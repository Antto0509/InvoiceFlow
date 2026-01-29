import { ResourceApi } from "../ResourceApi";
import { stripGeneratedMany } from "@/lib/utils";
import type { DocumentLine } from "@/schemas/documents.schema";

export class DocumentLinesApi extends ResourceApi<DocumentLine> {
  constructor() {
    super({
      table: "document_lines",
      select: "*",
      sortableColumns: ["id", "description", "quantity", "unit_price", "total"],
      searchColumns: ["description"],
    });
  }

  /** 
   * Lignes d’un document 
   * @param documentId ID du document
   * @return Liste des lignes
   */
  async listByDocument(documentId: string) {
    return this.list({
      filters: {
        document_id: { op: "eq", value: documentId },
      },
      sort: { column: "id", dir: "asc" },
    });
  }

  /** 
   * Upsert lignes (id → update, sinon insert) 
   * @param lines Lignes à upserter
   * @returns Nombre de lignes upsertées
   */
  async upsert(lines: Array<Partial<DocumentLine>>) {
    if (!lines?.length) return { count: 0 };

    const clean = stripGeneratedMany(lines).map((l) => ({
      ...l,
      unit: l.unit ?? null,
      discount_rate: l.discount_rate ?? null,
      discount_amount: l.discount_amount ?? null,
      tax_rate: l.tax_rate ?? null,
    }));

    const { data, error } = await this.supabase
      .from(this.table)
      .upsert(clean, { onConflict: "id" })
      .select("id");

    if (error) throw error;
    return { count: data?.length ?? 0 };
  }

  /** 
   * Suppression en masse 
   * @param ids IDs des lignes à supprimer
   * @returns Nombre de lignes supprimées
   */
  async deleteMany(ids: string[]) {
    if (!ids?.length) return { count: 0 };

    const { data, error } = await this.supabase
      .from(this.table)
      .delete()
      .in("id", ids)
      .select("id");

    if (error) throw error;
    return { count: data?.length ?? 0 };
  }

  /** 
   * Remplacement total des lignes d’un document 
   * @param documentId ID du document
   * @param incoming Lignes entrantes
   * @returns Statistiques de l’opération
   */
  async replaceForDocument(
    documentId: string,
    incoming: Array<Partial<DocumentLine>>
  ) {
    const existing = await this.listByDocument(documentId);
    const existingRows = existing.data ?? [];
    const existingIds = new Set(existingRows.map((l) => l.id));

    const incomingWithDoc = incoming.map((l) => ({
      ...l,
      document_id: documentId,
    }));

    await this.upsert(incomingWithDoc);

    const incomingIds = new Set(
      incomingWithDoc.map((l) => l.id).filter(Boolean) as string[]
    );

    const toDelete = [...existingIds].filter(
      (id) => id && !incomingIds.has(id)
    );

    if (toDelete.length) {
      await this.deleteMany(toDelete);
    }

    return {
      upserted: incomingWithDoc.length,
      deleted: toDelete.length,
    };
  }
}
