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

/**
 * Log et throw une erreur formatée
 * 
 * @param context Contexte de l’erreur
 * @param meta Métadonnées
 * @param err Erreur originale
 * 
 * @returns never (throw)
 */
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
/*           ACL Document             */
/* ---------------------------------- */

/**
 * Vérifie que l’utilisateur peut accéder au document.  
 * Propriétaire direct OU owner/admin de la company.
 * 
 * @param sb Client Supabase server
 * @param params Paramètres
 * @param params.actorUserId ID de l’utilisateur acteur
 * @param params.document Document à vérifier
 * 
 * @returns void ou throw Error("Forbidden")
 */
export async function assertCanAccessDocument(
  sb: ReturnType<typeof createClientServer>,
  params: {
    actorUserId: string;
    document: Partial<z.infer<typeof DocumentDbSchema>>;
    rolesAllowed?: Array<"owner" | "admin">;
  }
) {
  const { actorUserId, document, rolesAllowed = ["owner", "admin"] } = params;

  // 1) Propriétaire direct => OK
  if (document.user_id === actorUserId) return;

  // 2) Sinon, il faut une company + membership owner/admin
  if (!document.company_id) {
    throw new Error("Forbidden");
  }

  const { data: membership, error } = await sb
    .from("company_memberships")
    .select("user_id, company_id, role")
    .eq("company_id", document.company_id)
    .eq("user_id", actorUserId)
    .in("role", rolesAllowed)
    .maybeSingle();

  if (error) throw error;
  if (!membership) throw new Error("Forbidden");
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
 * 
 * @param documentId ID du document
 * @param actorUserId ID de l’utilisateur acteur
 * 
 * @returns Source complète pour le PDF
 */
async function fetchDocumentPdfSource(documentId: string, actorUserId: string) {
  const sb = createClientServer();

  try {
    // 1) Document principal
    const { data: docRow, error: docErr } = await sb
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .maybeSingle();

    if (docErr) {
      logError(
        "fetchDocumentPdfSource:documentQuery",
        { documentId, actorUserId },
        docErr
      );
    }
    if (!docRow) {
      logError(
        "fetchDocumentPdfSource:documentNotFound",
        { documentId, actorUserId },
        new Error("Document not found")
      );
    }

    let document: z.infer<typeof DocumentDbSchema>;
    try {
      document = DocumentDbSchema.parse(docRow);
    } catch (parseErr) {
      logError(
        "fetchDocumentPdfSource:documentParse",
        { documentId, actorUserId, raw: docRow },
        parseErr
      );
    }

    // ✅ ACL : owner du doc OU owner/admin de la company
    try {
      await assertCanAccessDocument(sb, { actorUserId, document });
    } catch (aclErr) {
      logError(
        "fetchDocumentPdfSource:forbidden",
        {
          documentId,
          actorUserId,
          ownerId: document.user_id,
          companyId: document.company_id,
        },
        aclErr
      );
    }

    // 2) Lignes du document
    const { data: lineRows, error: linesErr } = await sb
      .from("document_lines")
      .select("*")
      .eq("document_id", documentId);

    if (linesErr) {
      logError(
        "fetchDocumentPdfSource:linesQuery",
        { documentId, actorUserId },
        linesErr
      );
    }

    let lines: z.infer<typeof DocumentLinesDbSchema>[];
    try {
      lines = z.array(DocumentLinesDbSchema).parse(lineRows ?? []);
    } catch (parseErr) {
      logError(
        "fetchDocumentPdfSource:linesParse",
        { documentId, actorUserId, raw: lineRows },
        parseErr
      );
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
        logError(
          "fetchDocumentPdfSource:clientQuery",
          { documentId, actorUserId, clientId: document.client_id },
          clientErr
        );
      }

      if (clientRow) {
        try {
          clientWithDetails = clientWithDetailsSchema.parse({
            client: clientRow,
            addresses: clientRow.client_addresses ?? [],
            contacts: clientRow.client_contacts ?? [],
          });
        } catch (parseErr) {
          logError(
            "fetchDocumentPdfSource:clientParse",
            {
              documentId,
              actorUserId,
              clientId: document.client_id,
              raw: clientRow,
            },
            parseErr
          );
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
        logError(
          "fetchDocumentPdfSource:companyQuery",
          { documentId, actorUserId, companyId: document.company_id },
          companyErr
        );
      }

      if (companyRow) {
        try {
          companyWithDetails = companyWithDetailsSchema.parse({
            company: companyRow,
            addresses: companyRow.company_addresses ?? [],
            bank_accounts: companyRow.company_bank_accounts ?? [],
            memberships: [], // pas utile pour le PDF
          });
        } catch (parseErr) {
          logError(
            "fetchDocumentPdfSource:companyParse",
            {
              documentId,
              actorUserId,
              companyId: document.company_id,
              raw: companyRow,
            },
            parseErr
          );
        }
      }
    }

    // 5) Settings utilisateur
    const { data: settingsRow, error: settingsErr } = await sb
      .from("settings")
      .select("*")
      .eq("user_id", actorUserId)
      .maybeSingle();

    if (settingsErr) {
      logError(
        "fetchDocumentPdfSource:settingsQuery",
        { documentId, actorUserId },
        settingsErr
      );
    }

    let settings: z.infer<typeof settingsSchema> | null = null;
    if (settingsRow) {
      try {
        settings = settingsSchema.parse(settingsRow);
      } catch (parseErr) {
        logError(
          "fetchDocumentPdfSource:settingsParse",
          { documentId, actorUserId, raw: settingsRow },
          parseErr
        );
      }
    }

    // 6) Shape finale
    try {
      return documentPdfSourceSchema.parse({
        ...document,
        lines,
        clientWithDetails,
        companyWithDetails,
        settings,
      });
    } catch (parseErr) {
      logError(
        "fetchDocumentPdfSource:sourceParse",
        { documentId, actorUserId },
        parseErr
      );
    }
  } catch (err) {
    logError(
      "fetchDocumentPdfSource:unexpected",
      { documentId, actorUserId },
      err
    );
  }
}

/**
 * Génère le buffer PDF à partir du view-model
 * 
 * @param data Données pour le PDF
 * 
 * @returns Buffer du PDF
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

/* ---------------------------------- */
/*        Storage + DB records        */
/* ---------------------------------- */

/**
 * Upload du PDF dans Supabase Storage (path stable multi-tenant)
 * -> companies/<companyId>/documents/<documentId>.pdf
 * 
 * @param params Paramètres
 * @param params.actorUserId ID de l’utilisateur acteur
 * @param params.documentId ID du document
 * @param params.companyId ID de la company (si applicable)
 * @param params.number Numéro du document (optionnel, pour le filename)
 * @param params.buf Buffer du fichier PDF
 * 
 * @returns Le path où le PDF a été stocké
 */
export async function uploadDocumentPdf(params: {
  actorUserId: string;
  documentId: string;
  companyId: string | null;
  number: string | null;
  buf: Buffer;
}) {
  const sb = createClientServer();
  const { actorUserId, documentId, companyId, number, buf } = params;

  // Path stable : si company => company scope, sinon fallback owner scope
  const safeName = number || documentId;
  const path = companyId
    ? `companies/${companyId}/documents/${safeName}-${documentId}.pdf`
    : `users/${actorUserId}/documents/${safeName}-${documentId}.pdf`;

  try {
    const { error } = await sb.storage.from("invoices").upload(path, buf, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (error) {
      logError(
        "uploadDocumentPdf:storageUpload",
        { actorUserId, documentId, companyId, path },
        error
      );
    }

    return path;
  } catch (err) {
    logError(
      "uploadDocumentPdf:unexpected",
      { actorUserId, documentId, companyId, path },
      err
    );
  }
}

/**
 * Enregistre le PDF dans `files` + lien dans `file_links`.
 * Évite les doublons (bucket+path) : reuse ou update.
 * 
 * @param sb Client Supabase server
 * @param params Paramètres
 * @param params.actorUserId ID de l’utilisateur acteur
 * @param params.documentId ID du document
 * @param params.path Chemin dans le storage
 * @param params.buffer Buffer du fichier PDF
 * 
 * @returns Le record `files` créé ou mis à jour.
 */
async function persistPdfFileRecord(
  sb: ReturnType<typeof createClientServer>,
  params: {
    actorUserId: string;
    documentId: string;
    path: string;
    buffer: Buffer;
  }
) {
  const { actorUserId, documentId, path, buffer } = params;
  const bucket = "invoices" as const;

  try {
    // 1) Si existe déjà => update (best effort) + reuse
    const { data: existing, error: existingErr } = await sb
      .from("files")
      .select("*")
      .eq("bucket", bucket)
      .eq("path", path)
      .maybeSingle();

    if (existingErr) {
      logError(
        "persistPdfFileRecord:selectExisting",
        { actorUserId, documentId, path },
        existingErr
      );
    }

    if (existing) {
      const { data: updated, error: updErr } = await sb
        .from("files")
        .update({
          mime_type: "application/pdf",
          size_bytes: buffer.byteLength,
          // user_id: actorUserId, // optionnel : à toi de voir si tu veux garder le créateur initial
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (updErr) {
        logError(
          "persistPdfFileRecord:updateFile",
          { actorUserId, documentId, fileId: existing.id, path },
          updErr
        );
      }

      // ensure link exists (best effort)
      const { data: linkExists, error: linkSelErr } = await sb
        .from("file_links")
        .select("id")
        .eq("file_id", existing.id)
        .eq("target_table", "document" as FileTargetType)
        .eq("target_id", documentId)
        .maybeSingle();

      if (linkSelErr) {
        logError(
          "persistPdfFileRecord:selectLink",
          { actorUserId, documentId, fileId: existing.id },
          linkSelErr
        );
      }

      if (!linkExists) {
        const { error: linkErr } = await sb.from("file_links").insert({
          file_id: existing.id,
          target_table: "document" as FileTargetType,
          target_id: documentId,
        });

        if (linkErr) {
          logError(
            "persistPdfFileRecord:insertLinkExistingFile",
            { actorUserId, documentId, fileId: existing.id },
            linkErr
          );
        }
      }

      return updated;
    }

    // 2) Sinon insert file
    const { data: file, error: fileErr } = await sb
      .from("files")
      .insert({
        user_id: actorUserId,
        bucket,
        path,
        mime_type: "application/pdf",
        size_bytes: buffer.byteLength,
      })
      .select("*")
      .single();

    if (fileErr) {
      logError(
        "persistPdfFileRecord:insertFile",
        { actorUserId, documentId, path },
        fileErr
      );
    }

    // 3) Link
    const { error: linkErr } = await sb.from("file_links").insert({
      file_id: file.id,
      target_table: "document" as FileTargetType,
      target_id: documentId,
    });

    if (linkErr) {
      logError(
        "persistPdfFileRecord:insertLink",
        { actorUserId, documentId, fileId: file.id },
        linkErr
      );
    }

    return file;
  } catch (err) {
    logError(
      "persistPdfFileRecord:unexpected",
      { actorUserId, documentId, path },
      err
    );
  }
}

/* ---------------------------------- */
/*          Public entrypoint         */
/* ---------------------------------- */

/**
 * Assure que le PDF existe pour un document.  
 * Retourne le buffer + chemin (optionnel) + filename + fileId (optionnel).
 * 
 * @param documentId ID du document
 * @param store Si true, stocke le PDF dans Supabase Storage + crée le record dans `files` + `file_links`
 * 
 * @return Résultat avec buffer, path (si stocké), filename, fileId (si stocké)
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
      logError(
        "ensurePdfForDocument:unauthorized",
        { documentId },
        new Error("Unauthorized")
      );
    }

    // Fetch source 1 seule fois (et ACL dedans)
    const src = await fetchDocumentPdfSource(documentId, user.id);
    const data = mapDocumentPdfSourceToPdfData(src);

    // Génération du PDF
    const buf = await generateDocumentPdfBuffer(data);

    let storedPath: string | null = null;
    let fileId: string | null = null;

    if (store) {
      try {
        storedPath = await uploadDocumentPdf({
          actorUserId: user.id,
          documentId,
          companyId: src.company_id ?? null,
          number: data.number ?? null,
          buf,
        });

        const file = await persistPdfFileRecord(sb, {
          actorUserId: user.id,
          documentId,
          path: storedPath,
          buffer: buf,
        });

        fileId = file.id;
      } catch (storeErr) {
        logError(
          "ensurePdfForDocument:storePipeline",
          { documentId, actorUserId: user.id },
          storeErr
        );
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
