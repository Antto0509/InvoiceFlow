import { ResourceApi } from "../ResourceApi";
import type { DocumentReminder } from "@/schemas/documents.schema";

/**
 * API CRUD pour les rappels automatiques de documents
 */
export class DocumentRemindersApi extends ResourceApi<DocumentReminder> {
  constructor() {
    super({
      table: "document_reminders",
      select: "*",
      sortableColumns: ["scheduled_at", "sent_at", "status", "created_at"],
      searchColumns: [],
    });
  }

  /** 
   * Rappels d’un document 
   * @param documentId ID du document
   * @return Liste des rappels
   */
  listByDocument(documentId: string) {
    return this.list({
      filters: {
        document_id: { op: "eq", value: documentId },
      },
    });
  }

  /** 
   * Rappels à envoyer (scheduler / cron)
   * @param before Date limite (ISO)
   * @return Liste des rappels programmés avant la date 
   */
  listScheduled(before?: string) {
    return this.list({
      filters: {
        status: { op: "eq", value: "scheduled" },
        ...(before && {
          scheduled_at: { op: "lte", value: before },
        }),
      },
    });
  }

  /** 
   * Marquer comme envoyé 
   * @param id ID du rappel
   * @param sentAt Date d’envoi (ISO)
   * @return Rappel mis à jour
   */
  markAsSent(id: string, sentAt = new Date().toISOString()) {
    return this.update(id, {
      status: "sent",
      sent_at: sentAt,
    });
  }

  /** 
   * Marquer comme échoué 
   * @param id ID du rappel
   * @return Rappel mis à jour
   */
  markAsFailed(id: string) {
    return this.update(id, {
      status: "failed",
    });
  }
}
