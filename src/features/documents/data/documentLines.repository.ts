import { createClient } from "@/data/supabase/client";
import { stripGeneratedMany } from "@/lib/utils";
import type { DocumentLine } from "@/schemas/documents.schema";

/**
 * Récupérer les lignes d'un document
 * @param documentId ID du document
 * @returns Liste des lignes
 */
export async function listDocumentLines(documentId: string): Promise<DocumentLine[]> {
  const sb = createClient();
  const { data, error } = await sb
    .from("document_lines")
    .select("*")
    .eq("document_id", documentId)
    .order("position", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as DocumentLine[];
}

/**
 * Upsert de lignes :
 * - Si id présent → update
 * - Si pas d'id → insert  
 * NOTE: `document_id` doit être fourni pour chaque ligne.
 * @param lines Lignes à upserter
 * @returns Nombre de lignes upsertées
 */
export async function upsertDocumentLines(lines: Array<Partial<DocumentLine>>) {
  if (!lines?.length) return { count: 0 };

  const sb = createClient();

  // On enlève les colonnes calculées/readonly si tu utilises cette util (sinon retire cette ligne)
  const clean = stripGeneratedMany(lines).map((ln: Partial<DocumentLine>) => ({
    ...ln,
    // sécurité : valeurs nulles cohérentes
    unit: ln.unit ?? null,
    discount_rate: ln.discount_rate ?? null,
    discount_amount: ln.discount_amount ?? null,
    tax_rate: ln.tax_rate ?? null,
  }));

  // upsert par id si présent, sinon insert
  const { data, error } = await sb
    .from("document_lines")
    .upsert(clean, { onConflict: "id", ignoreDuplicates: false })
    .select("id");

  if (error) throw error;
  return { count: data?.length ?? 0 };
}

/**
 * Suppression en masse de lignes par id
 * @param ids IDs des lignes à supprimer
 * @returns Nombre de lignes supprimées
 */
export async function deleteDocumentLines(ids: string[]) {
  if (!ids?.length) return { count: 0 };
  const sb = createClient();
  const { data, error } = await sb.from("document_lines").delete().in("id", ids).select("id");
  if (error) throw error;
  return { count: data?.length ?? 0 };
}

/**
 * Remplacement total des lignes d'un document :
 * - Fait le diff entre les lignes existantes et entrantes
 * - Upsert les nouvelles/maj
 * - Supprime celles retirées
 * @param documentId ID du document
 * @param incoming Lignes entrantes
 * @returns Statistiques de l'opération
 */
export async function replaceDocumentLines(
  documentId: string,
  incoming: Array<Partial<DocumentLine>>
) {
  const existing = await listDocumentLines(documentId);
  const existingIds = new Set(existing.map((l) => l.id));
  const incomingWithDoc = (incoming ?? []).map((ln) => ({ ...ln, document_id: documentId }));

  // upsert (insert + update)
  await upsertDocumentLines(incomingWithDoc as Array<Partial<DocumentLine> & { document_id: string }>);

  // delete celles qui ne sont plus là
  const incomingIds = new Set(
    incomingWithDoc.map((l) => l.id).filter(Boolean) as string[]
  );
  const toDelete = [...existingIds].filter((id) => id && !incomingIds.has(id));
  if (toDelete.length) {
    await deleteDocumentLines(toDelete);
  }

  return { upserted: incomingWithDoc.length, deleted: toDelete.length };
}
