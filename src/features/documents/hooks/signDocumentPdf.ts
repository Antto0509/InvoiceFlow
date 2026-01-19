"use server";

import "server-only";
import { createClientServer } from "@/data/supabase/server";
import { assertCanAccessDocument, ensurePdfForDocument } from "./generateDocumentPdf.server";
import type { SupabaseClient } from "@supabase/supabase-js";

type SignOptions = {
  expiresIn?: number; // secondes
  force?: boolean;    // force regénération du PDF
};

/**
 * Génère (si besoin) le PDF d’un document, le stocke dans Supabase Storage
 * puis retourne une URL signée.
 * @param documentId ID du document
 * @param param1 Options de signature
 * @returns URL signée du PDF
 */
export async function getOrCreateSignedDocumentPdfUrl(
  documentId: string,
  { expiresIn = 300, force = false }: SignOptions = {}
): Promise<string> {
  const supabase = createClientServer();

  // 1) Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("Unauthorized");

  // 2) On récupère le document pour connaître le pdf_url actuel
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id, user_id, company_id, pdf_url, kind, number")
    .eq("id", documentId)
    .maybeSingle();

  if (docErr) throw docErr;
  if (!doc) throw new Error("Not found");

  // Vérification des droits d’accès
  await assertCanAccessDocument(supabase, { actorUserId: user.id, document: doc });

  let pdfPath = doc.pdf_url as string | null;

  // 3) (Re)génération du PDF si nécessaire
  if (force || !pdfPath) {
    const { path } = await ensurePdfForDocument(documentId, { store: true });
    if (!path) {
      throw new Error("Erreur lors de la génération du PDF");
    }

    pdfPath = path;

    // On persiste le chemin dans documents.pdf_url
    const { error: updErr } = await supabase
      .from("documents")
      .update({ pdf_url: pdfPath })
      .eq("id", documentId);

    if (updErr) {
      // Ce n’est pas bloquant pour l’utilisateur, mais on log quand même
      console.error("Impossible de mettre à jour pdf_url sur documents", updErr);
    }
  }

  if (!pdfPath) {
    throw new Error("PDF path missing after generation");
  }

  // 4) Génération de l’URL signée
  const { data: signed, error: signErr } = await supabase.storage
    .from("invoices") // même bucket qu’avant
    .createSignedUrl(pdfPath, expiresIn);

  if (signErr) throw signErr;
  if (!signed?.signedUrl) throw new Error("Could not create signed URL");

  return signed.signedUrl;
} 

/**
 * Génère (si besoin) le PDF d’un document, le stocke dans Supabase Storage
 * puis retourne une URL signée ainsi que le chemin du PDF dans le storage.
 * @param supabase Supabase client serveur
 * @param userId ID de l’utilisateur courant
 * @param documentId ID du document
 * @param param3 Options de signature
 * @returns URL signée et chemin du PDF dans le storage
 */
export async function getOrCreateSignedDocumentPdfUrlWithClient(
  supabase: SupabaseClient,
  userId: string,
  documentId: string,
  { expiresIn = 300, force = false }: SignOptions = {}
): Promise<{ signedUrl: string; pdfPath: string }> {
  // 1) On récupère le document pour connaître le pdf_url actuel (qui est un PATH)
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .select("id, user_id, pdf_url, kind, number")
    .eq("id", documentId)
    .maybeSingle();

  if (docErr) throw docErr;
  if (!doc) throw new Error("Not found");
  if (doc.user_id && doc.user_id !== userId) throw new Error("Forbidden");

  let pdfPath = doc.pdf_url as string | null;

  // 2) (Re)génération du PDF si nécessaire
  if (force || !pdfPath) {
    const { path } = await ensurePdfForDocument(documentId, { store: true });
    if (!path) throw new Error("PDF generation failed");

    pdfPath = path;

    // On persiste le chemin dans documents.pdf_url (best effort)
    const { error: updErr } = await supabase
      .from("documents")
      .update({ pdf_url: pdfPath })
      .eq("id", documentId);

    if (updErr) {
      console.error("[InvoiceFlow] update documents.pdf_url failed", updErr);
    }
  }

  if (!pdfPath) throw new Error("PDF path missing");

  // 3) Génération de l’URL signée
  const { data: signed, error: signErr } = await supabase.storage
    .from("invoices") // même bucket qu’avant
    .createSignedUrl(pdfPath, expiresIn);

  if (signErr) throw signErr;
  if (!signed?.signedUrl) throw new Error("Could not create signed URL");

  return { signedUrl: signed.signedUrl, pdfPath };
}