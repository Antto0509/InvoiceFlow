import { ResourceApi } from "../ResourceApi";
import type { DocumentKind, DocumentNumberingConfig } from "@/schemas/documents.schema";

/**
 * API CRUD pour les configurations de numérotation des documents
 */
export class DocumentNumberingConfigsApi extends ResourceApi<DocumentNumberingConfig> {
  constructor() {
    super({
      table: "document_numbering_configs",
      select: "id, company_id, kind, prefix, format, is_active, created_at, updated_at",
      sortableColumns: ["id", "company_id", "kind", "is_active", "updated_at"],
      searchColumns: [],
    });
  }

  /**
   * Configuration par entreprise et type de document
   * @param companyId ID de la société
   * @param kind Type de document
   * @returns Configuration ou null
   */
  async getByCompanyAndKind(
    companyId: string,
    kind: DocumentKind
  ) {
    const res = await this.list({
      filters: {
        company_id: { op: "eq", value: companyId },
        kind: { op: "eq", value: kind },
      },
    });

    return res?.data?.[0] ?? null;
  }
}
