import { ResourceApi } from "../ResourceApi";
import { SORTABLE_DOCS } from "@/lib/index";
import type { Document, DocumentKind } from "@/schemas/documents.schema";

/**
 * API CRUD pour les documents (table)
 */
export class DocumentsApi extends ResourceApi<Document> {
  constructor(userId?: string) {
    super({
      table: "documents",
      select: "*",
      sortableColumns: SORTABLE_DOCS.filter((c) => c !== "client_name"),
      searchColumns: ["number"],
      defaultFilters: userId
        ? { user_id: { op: "eq", value: userId } }
        : undefined,
      protectedColumns: ["user_id"],
    });
  }

  /** 
   * Documents d’une société 
   * @param companyId ID de la société
   * @return Liste des documents
   */
  listByCompany(companyId: string) {
    return this.list({
      filters: {
        company_id: { op: "eq", value: companyId },
      },
    });
  }

  /** 
   * Documents d’un client 
   * @param clientId ID du client
   * @return Liste des documents
   */
  listByClient(clientId: string) {
    return this.list({
      filters: {
        client_id: { op: "eq", value: clientId },
      },
    });
  }

  /** 
   * Duplication simple (sans lignes) 
   * @param id ID du document à dupliquer
   * @return Document dupliqué
   */
  async duplicate(id: string) {
    const doc = await this.get(id);
    if (!doc) return null;

    const rest = { ...doc } as Partial<Document>;

    delete rest.id;
    delete rest.created_at;
    delete rest.updated_at;
    delete rest.number;
    delete rest.number_readonly;

    return this.create({
      ...rest,
      status: "draft",
    });
  }

  /**
   * Génération de numéro de document
   * @param params Paramètres de génération
   * @returns Numéro généré
   */
  async generateNumber(params: {
    company_id: string;
    kind: DocumentKind;
    issue_date: string;
  }) {
    const { company_id, kind, issue_date } = params;

    // RPC = vérité absolue
    const { data, error } = await this.supabase.rpc(
      "generate_document_number",
      {
        p_company_id: company_id,
        p_kind: kind,
        p_issue_date: issue_date,
      }
    );

    if (error || !data?.length) {
      throw error ?? new Error("Number generation failed");
    }

    return data[0] as {
      number_value: string;
      number_readonly: string;
    };
  }
}
