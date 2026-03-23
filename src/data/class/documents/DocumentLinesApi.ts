import { ResourceApi } from "../ResourceApi";
import { stripGeneratedMany } from "@/lib/utils";
import type { DocumentLine } from "@/schemas/documents.schema";

export class DocumentLinesApi extends ResourceApi<DocumentLine> {
  constructor() {
    super({
      table: "document_lines",
      select: "id, document_id, kind, description, qty, unit_price, unit, discount_rate, discount_amount, tax_rate, line_total, position, created_at, updated_at",
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
   * Remplacement atomique des lignes d’un document via RPC PostgreSQL.
   *
   * Toutes les opérations (delete des lignes supprimées + upsert des
   * lignes entrantes) sont exécutées dans une seule transaction DB,
   * éliminant le risque d’état incohérent en cas d’erreur partielle.
   *
   * @param documentId ID du document
   * @param incoming Lignes entrantes (avec `id` pour les existantes, sans pour les nouvelles)
   * @returns `{ upserted, deleted }` — compteurs retournés par la DB
   */
  async replaceForDocument(
    documentId: string,
    incoming: Array<Partial<DocumentLine>>
  ): Promise<{ upserted: number; deleted: number }> {
    const lines = stripGeneratedMany(
      incoming.map((l) => ({
        ...l,
        document_id: documentId,
        unit: l.unit ?? null,
        discount_rate: l.discount_rate ?? null,
        discount_amount: l.discount_amount ?? null,
        tax_rate: l.tax_rate ?? null,
      }))
    );

    const { data, error } = await this.supabase.rpc("replace_document_lines", {
      p_document_id: documentId,
      p_lines: lines,
    });

    if (error) throw error;

    const result = data as { upserted: number; deleted: number } | null;
    return { upserted: result?.upserted ?? 0, deleted: result?.deleted ?? 0 };
  }
}
