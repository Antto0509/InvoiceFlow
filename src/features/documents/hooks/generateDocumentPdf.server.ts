"use server";
import "server-only";

import { z } from "zod";
import React from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";

import { createClientServer } from "@/data/supabase/server";
import {
  documentPdfSourceSchema,
  mapDocumentPdfSourceToPdfData,
  DocumentPdfData,
} from "@/schemas/pdf.schema";
import {
  DocumentDbSchema,
  DocumentLinesDbSchema,
} from "@/schemas/documents.schema";
import {
  ClientWithDetails,
  clientWithDetailsSchema,
} from "@/schemas/clients.schema";
import {
  CompanyWithDetails,
  companyWithDetailsSchema,
} from "@/schemas/companies.schema";
import { settingsSchema } from "@/schemas/settings.schema";

import DocumentPDF from "@/features/documents/components/pdf/DocumentPDF";
import { FileTargetType } from "@/schemas/index";

/* ---------------------------------- */
/*         Utils log / erreur         */
/* ---------------------------------- */

function logError(
  context: string,
  meta: Record<string, unknown>,
  err: unknown
): never {
  console.error(`[PDF] ${context} failed`, { ...meta, err });
  if (err instanceof Error) throw err;
  throw new Error(`${context} failed: ${String(err)}`);
}

/* ---------------------------------- */
/*     Fetch des données pour PDF     */
/* ---------------------------------- */

/**
 * Récupère toutes les données nécessaires à la génération du PDF :
 * - document
 * - lignes
 * - client + adresses + contacts
 * - company + adresses + comptes bancaires
 * - settings utilisateur
 * @param documentId ID du document
 * @param userId ID de l’utilisateur propriétaire
 * @returns Source complète pour le PDF
 */
async function fetchDocumentPdfSource(
  documentId: string,
  userId: string
) {
  const sb = createClientServer();

  try {
    // 1) Document principal
    const { data: docRow, error: docErr } = await sb
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .maybeSingle();

    if (docErr) {
      logError("fetchDocumentPdfSource:documentQuery", { documentId, userId }, docErr);
    }
    if (!docRow) {
      logError("fetchDocumentPdfSource:documentNotFound", { documentId, userId }, new Error("Document not found"));
    }

    let document: z.infer<typeof DocumentDbSchema>;
    try {
      document = DocumentDbSchema.parse(docRow);
    } catch (parseErr) {
      logError("fetchDocumentPdfSource:documentParse", { documentId, userId, raw: docRow }, parseErr);
    }

    if (document.user_id !== userId) {
      logError("fetchDocumentPdfSource:forbidden", { documentId, userId, ownerId: document.user_id }, new Error("Forbidden"));
    }

    // 2) Lignes du document
    const { data: lineRows, error: linesErr } = await sb
      .from("document_lines")
      .select("*")
      .eq("document_id", documentId);

    if (linesErr) {
      logError("fetchDocumentPdfSource:linesQuery", { documentId, userId }, linesErr);
    }

    let lines: z.infer<typeof DocumentLinesDbSchema>[];
    try {
      lines = z.array(DocumentLinesDbSchema).parse(lineRows ?? []);
    } catch (parseErr) {
      logError("fetchDocumentPdfSource:linesParse", { documentId, userId, raw: lineRows }, parseErr);
    }

    // 3) Client + détails
    let clientWithDetails: ClientWithDetails | null = null;
    if (document.client_id) {
      const { data: clientRow, error: clientErr } = await sb
        .from("clients")
        .select("*, client_addresses(*), client_contacts(*)")
        .eq("id", document.client_id)
        .maybeSingle();

      if (clientErr) {
        logError("fetchDocumentPdfSource:clientQuery", { documentId, userId, clientId: document.client_id }, clientErr);
      }

      if (clientRow) {
        try {
          clientWithDetails = clientWithDetailsSchema.parse({
            client: clientRow,
            addresses: clientRow.client_addresses ?? [],
            contacts: clientRow.client_contacts ?? [],
          });
        } catch (parseErr) {
          logError("fetchDocumentPdfSource:clientParse", { documentId, userId, clientId: document.client_id, raw: clientRow }, parseErr);
        }
      }
    }

    // 4) Company + détails
    let companyWithDetails: CompanyWithDetails | null = null;
    if (document.company_id) {
      const { data: companyRow, error: companyErr } = await sb
        .from("companies")
        .select("*, company_addresses(*), company_bank_accounts(*)")
        .eq("id", document.company_id)
        .maybeSingle();

      if (companyErr) {
        logError("fetchDocumentPdfSource:companyQuery", { documentId, userId, companyId: document.company_id }, companyErr);
      }

      if (companyRow) {
        try {
          companyWithDetails = companyWithDetailsSchema.parse({
            company: companyRow,
            addresses: companyRow.company_addresses ?? [],
            bank_accounts: companyRow.company_bank_accounts ?? [],
            memberships: [], // pas utile pour le PDF pour l’instant
          });
        } catch (parseErr) {
          logError("fetchDocumentPdfSource:companyParse", { documentId, userId, companyId: document.company_id, raw: companyRow }, parseErr);
        }
      }
    }

    // 5) Settings utilisateur (logo, mentions, banque…)
    const { data: settingsRow, error: settingsErr } = await sb
      .from("settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (settingsErr) {
      logError("fetchDocumentPdfSource:settingsQuery", { documentId, userId }, settingsErr);
    }

    let settings: z.infer<typeof settingsSchema> | null = null;
    if (settingsRow) {
      try {
        settings = settingsSchema.parse(settingsRow);
      } catch (parseErr) {
        logError("fetchDocumentPdfSource:settingsParse", { documentId, userId, raw: settingsRow }, parseErr);
      }
    }

    // 6) On régularise la forme globale
    try {
      const src = documentPdfSourceSchema.parse({
        ...document,
        lines,
        clientWithDetails,
        companyWithDetails,
        settings,
      });

      return src;
    } catch (parseErr) {
      logError("fetchDocumentPdfSource:sourceParse", {
        documentId,
        userId,
      }, parseErr);
    }
  } catch (err) {
    logError("fetchDocumentPdfSource:unexpected", { documentId, userId }, err);
  }
}

/**
 * Transforme la source en données view-model prêtes pour React-PDF
 * @param documentId ID du document
 * @param userId ID de l’utilisateur propriétaire
 * @returns Données du PDF
 */
async function fetchDocumentPdfData(
  documentId: string,
  userId: string
): Promise<DocumentPdfData> {
  try {
    const src = await fetchDocumentPdfSource(documentId, userId);
    return mapDocumentPdfSourceToPdfData(src);
  } catch (err) {
    logError("fetchDocumentPdfData", { documentId, userId }, err);
  }
}

/**
 * Génère le buffer PDF à partir du view-model
 * @param data Données du PDF
 * @returns Buffer du PDF généré
 */
async function generateDocumentPdfBuffer(data: DocumentPdfData) {
  try {
    const element = React.createElement(DocumentPDF, {
      data,
    }) as unknown as React.ReactElement<DocumentProps>;
    return await renderToBuffer(element);
  } catch (err) {
    logError("generateDocumentPdfBuffer", { number: data.number }, err);
  }
}

/**
 * Upload du PDF dans Supabase Storage
 * @param userId ID de l’utilisateur propriétaire
 * @param number Numéro du document (optionnel, pour le nom de fichier)
 * @param buf Buffer du PDF
 * @returns Chemin du fichier dans le storage
 */
export async function uploadDocumentPdf(
  userId: string,
  number: string | null,
  buf: Buffer
) {
  const sb = createClientServer();
  const safeNumber = number || `doc-${Date.now()}`;
  const path = `${userId}/${safeNumber}.pdf`;

  try {
    const { error } = await sb.storage
      .from("invoices")
      .upload(path, buf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (error) {
      logError("uploadDocumentPdf:storageUpload", { userId, path }, error);
    }

    return path;
  } catch (err) {
    logError("uploadDocumentPdf:unexpected", { userId, path }, err);
  }
}

/**
 * Enregistre le PDF dans la table `files` + crée le lien dans `file_links`.
 * @param sb Client Supabase
 * @param params.user_id ID utilisateur
 * @param params.documentId ID du document
 * @param params.path Chemin du fichier dans le storage
 * @param params.buffer Buffer du PDF
 * @returns Enregistrement du fichier
 */
async function persistPdfFileRecord(
  sb: ReturnType<typeof createClientServer>,
  params: {
    user_id: string;
    documentId: string;
    path: string;
    buffer: Buffer;
  }
) {
  const { user_id, documentId, path, buffer } = params;
  const bucket = "invoices" as const;

  try {
    const { data: file, error: fileErr } = await sb
      .from("files")
      .insert({
        user_id,
        bucket,
        path,
        mime_type: "application/pdf",
        size_bytes: buffer.byteLength,
      })
      .select("*")
      .single();

    if (fileErr) {
      logError("persistPdfFileRecord:insertFile", { user_id, documentId, path }, fileErr);
    }

    const { error: linkErr } = await sb.from("file_links").insert({
      file_id: file.id,
      target_table: "document" as FileTargetType,
      target_id: documentId,
    });

    if (linkErr) {
      logError("persistPdfFileRecord:insertLink", { user_id, documentId, fileId: file.id }, linkErr);
    }

    return file;
  } catch (err) {
    logError("persistPdfFileRecord:unexpected", { user_id, documentId, path }, err);
  }
}

/**
 * Assure que le PDF existe pour un document.
 * Retourne le buffer + chemin de stockage (optionnel) + nom de fichier
 * + éventuellement l'identifiant du fichier en base (files.id).
 * @param documentId ID du document
 * @param store Si true, stocke le PDF dans Supabase Storage + enregistre dans files/file_links
 * @return Objet avec buffer, path (optionnel), filename, fileId (optionnel)
 */
export async function ensurePdfForDocument(
  documentId: string,
  { store = false }: { store?: boolean } = {}
) {
  const sb = createClientServer();

  try {
    const {
      data: { user },
      error: authErr,
    } = await sb.auth.getUser();

    if (authErr) {
      logError("ensurePdfForDocument:getUserAuth", { documentId }, authErr);
    }

    if (!user) {
      logError("ensurePdfForDocument:unauthorized", { documentId }, new Error("Unauthorized"));
    }

    // 1) View-model pour React-PDF
    const data = await fetchDocumentPdfData(documentId, user.id);

    // 2) Génération du buffer PDF
    const buf = await generateDocumentPdfBuffer(data);

    // 3) Optionnel : upload + enregistrement dans files/file_links
    let storedPath: string | null = null;
    let fileId: string | null = null;

    if (store) {
      try {
        // Upload dans Supabase Storage (bucket "invoices")
        storedPath = await uploadDocumentPdf(user.id, data.number, buf);

        // Enregistrement dans files + file_links
        const file = await persistPdfFileRecord(sb, {
          user_id: user.id,
          documentId,
          path: storedPath,
          buffer: buf,
        });

        fileId = file.id;
      } catch (storeErr) {
        logError("ensurePdfForDocument:storePipeline", { documentId, userId: user.id }, storeErr);
      }
    }

    return {
      buffer: buf,
      path: storedPath,
      filename: `Document-${data.number ?? documentId}.pdf`,
      fileId,
    };
  } catch (err) {
    logError("ensurePdfForDocument:unexpected", { documentId }, err);
  }
}
