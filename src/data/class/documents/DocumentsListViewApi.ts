import { ResourceApi } from "../ResourceApi";
import { SORTABLE_DOCS } from "@/lib/index";
import type { Document, DocumentStatus } from "@/schemas/documents.schema";

/**
 * Ligne de la liste des documents avec informations client
 */
type DocumentListRow = Document & {
  client_name: string | null;
  email_sent?: boolean;
};

/**
 * API liste des documents pour la vue liste avec client
 */
export class DocumentsListViewApi extends ResourceApi<DocumentListRow> {
  constructor(userId?: string) {
    super({
      table: "documents_with_client",
      select:
        "id, number, number_readonly, issue_date, total, status, currency_code, client_name, client_id, user_id, kind, email_sent",
      sortableColumns: [...SORTABLE_DOCS],
      searchColumns: ["number", "client_name"],
      defaultFilters: userId
        ? { user_id: { op: "eq", value: userId } }
        : undefined,
      protectedColumns: ["user_id"],
    });
  }

  /** 
   * Liste par client 
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
   * Liste par statut 
   * @param status Statut du document
   * @return Liste des documents
   */
  listByStatus(status: DocumentStatus) {
    return this.list({
      filters: {
        status: { op: "eq", value: status },
      },
    });
  }
}
