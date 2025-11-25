// src/data/documents.repository.server.ts
import { createClient } from "@/data/supabase/server";
import type {
  Document,
  DocumentLine,
} from "@/schemas/documents.schema";
import {
  documentWithRelationsSchema,
  type DocumentWithRelations,
} from "@/schemas/pdf.schema";

/**
 * Récupère un document + lignes + client + company côté serveur,
 * avec vérification user_id.
 */
export async function getDocumentForPdfServer(
  id: string,
  userId: string
): Promise<DocumentWithRelations> {
  const sb = createClient();

  const { data, error } = await sb
    .from("documents")
    .select(
      [
        "*",
        "document_lines(*)",
        "clients:clients(id, name, address, company)",
        "companies:companies(id, name, vat_regime, payment_terms, penalty_rate, recovery_fee_enabled, default_currency, logo_url)",
      ].join(",")
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Document not found");

  if (userId && data.user_id && data.user_id !== userId) {
    throw new Error("Forbidden");
  }

  const merged: DocumentWithRelations = {
    ...(data as Document),
    lines: (data.document_lines ?? []) as DocumentLine[],
    client: data.clients
      ? {
          id: data.client_id,
          name: data.clients.name,
          address: data.clients.address,
          company: data.clients.company,
        }
      : null,
    company: data.companies ?? null,
  };

  // Validation Zod pour être sûr de ne pas casser le flux PDF
  return documentWithRelationsSchema.parse(merged);
}
