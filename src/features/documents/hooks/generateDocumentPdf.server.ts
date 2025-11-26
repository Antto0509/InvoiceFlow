"use server";
import "server-only";

import { z } from "zod";
import React from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";

import { createClient } from "@/data/supabase/server";
import { 
  documentPdfSourceSchema, 
  mapDocumentPdfSourceToPdfData,
  DocumentPdfData 
} from "@/schemas/pdf.schema";
import { DocumentDbSchema, DocumentLinesDbSchema } from "@/schemas/documents.schema";
import { ClientWithDetails, clientWithDetailsSchema } from "@/schemas/clients.schema";
import { CompanyWithDetails, companyWithDetailsSchema } from "@/schemas/companies.schema";
import { settingsSchema } from "@/schemas/settings.schema";

import DocumentPDF from "@/features/documents/components/pdf/DocumentPDF";
import { FileTargetType } from "@/schemas/index";

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
async function fetchDocumentPdfSource(documentId: string, userId: string) {
  const sb = createClient();

  // 1) Document principal
  const { data: docRow, error: docErr } = await sb
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .maybeSingle();

  if (docErr) throw docErr;
  if (!docRow) throw new Error("Document not found");

  const document = DocumentDbSchema.parse(docRow);

  if (document.user_id !== userId) {
    throw new Error("Forbidden");
  }

  // 2) Lignes du document
  const { data: lineRows, error: linesErr } = await sb
    .from("document_lines")
    .select("*")
    .eq("document_id", documentId);

  if (linesErr) throw linesErr;

  const lines = z.array(DocumentLinesDbSchema).parse(lineRows ?? []);

  // 3) Client + détails
  let clientWithDetails = null as ClientWithDetails | null;
  if (document.client_id) {
    const { data: clientRow, error: clientErr } = await sb
      .from("clients")
      .select("*, client_addresses(*), client_contacts(*)")
      .eq("id", document.client_id)
      .maybeSingle();

    if (clientErr) throw clientErr;

    if (clientRow) {
      clientWithDetails = clientWithDetailsSchema.parse({
        client: clientRow,
        addresses: clientRow.client_addresses ?? [],
        contacts: clientRow.client_contacts ?? [],
      });
    }
  }

  // 4) Company + détails
  let companyWithDetails = null as CompanyWithDetails | null;
  if (document.company_id) {
    const { data: companyRow, error: companyErr } = await sb
      .from("companies")
      .select("*, company_addresses(*), company_bank_accounts(*)")
      .eq("id", document.company_id)
      .maybeSingle();

    if (companyErr) throw companyErr;

    if (companyRow) {
      companyWithDetails = companyWithDetailsSchema.parse({
        company: companyRow,
        addresses: companyRow.company_addresses ?? [],
        bank_accounts: companyRow.company_bank_accounts ?? [],
        memberships: [], // pas utile pour le PDF pour l’instant
      });
    }
  }

  // 5) Settings utilisateur (logo, mentions, banque…)
  const { data: settingsRow, error: settingsErr } = await sb
    .from("settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (settingsErr) throw settingsErr;
  const settings = settingsRow ? settingsSchema.parse(settingsRow) : null;

  // 6) On régularise la forme globale
  const src = documentPdfSourceSchema.parse({
    ...document,
    lines,
    clientWithDetails,
    companyWithDetails,
    settings,
  });

  return src;
}

/** 
 * Transforme la source en données view-model prêtes pour React-PDF 
 * @param documentId ID du document
 * @param userId ID de l’utilisateur propriétaire
 * @returns Données du PDF
 */
async function fetchDocumentPdfData(documentId: string, userId: string): Promise<DocumentPdfData> {
  const src = await fetchDocumentPdfSource(documentId, userId);
  return mapDocumentPdfSourceToPdfData(src);
}

/** 
 * Génère le buffer PDF à partir du view-model 
 * @param data Données du PDF
 * @returns Buffer du PDF généré
 */
async function generateDocumentPdfBuffer(data: DocumentPdfData) {
  const element = React.createElement(DocumentPDF, { data }) as unknown as React.ReactElement<DocumentProps>;
  return await renderToBuffer(element);
}

/** 
 * Upload du PDF dans Supabase Storage 
 * @param userId ID de l’utilisateur propriétaire
 * @param number Numéro du document (optionnel, pour le nom de fichier)
 * @param buf Buffer du PDF
 * @returns Chemin du fichier dans le storage
 */
export async function uploadDocumentPdf(userId: string, number: string | null, buf: Buffer) {
  const sb = createClient();
  const safeNumber = number || `doc-${Date.now()}`;
  const path = `${userId}/${safeNumber}.pdf`;

  const { error } = await sb.storage.from("invoices").upload(path, buf, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) throw error;
  return path;
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
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // 1) View-model pour React-PDF
  const data = await fetchDocumentPdfData(documentId, user.id);

  // 2) Génération du buffer PDF
  const buf = await generateDocumentPdfBuffer(data);

  // 3) Optionnel : upload + enregistrement dans files/file_links
  let storedPath: string | null = null;
  let fileId: string | null = null;

  if (store) {
    // Upload dans Supabase Storage (bucket "invoices")
    storedPath = await uploadDocumentPdf(user.id, data.number, buf);

    console.log("PDF uploaded to storage at path:", storedPath);

    // Enregistrement dans files + file_links
    const file = await persistPdfFileRecord(sb, {
      user_id: user.id,
      documentId,
      path: storedPath,
      buffer: buf,
    });

    console.log("PDF record created with ID:", file.id);

    fileId = file.id;
  }

  return {
    buffer: buf,
    path: storedPath,
    filename: `Document-${data.number ?? documentId}.pdf`,
    fileId, // nouveau champ optionnel
  };
}

/**
 * Enregistre le PDF dans la table `files` + crée le lien dans `file_links`.
 * @param sb Client Supabase
 * @param params.documentId ID du document
 * @param params.path Chemin du fichier dans le storage
 * @param params.buffer Buffer du PDF
 * @returns Enregistrement du fichier
 */
async function persistPdfFileRecord(
  sb: ReturnType<typeof createClient>,
  params: {
    user_id: string;
    documentId: string;
    path: string;
    buffer: Buffer;
  }
) {
  const { user_id, documentId, path, buffer } = params;
  const bucket = "invoices" as const;

  console.log("Persisting PDF file record for document ID:", documentId);

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

  console.log("File record created with ID:", file?.id);

  if (fileErr) {
    console.error("Error creating file record:", fileErr);
    throw fileErr;
  }

  const { error: linkErr } = await sb.from("file_links").insert({
    file_id: file.id,
    target_table: "document" as FileTargetType,
    target_id: documentId,
  });

  if (linkErr) throw linkErr;

  console.log("File link created for file ID:", file.id);

  return file;
}
