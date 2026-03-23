import { ResourceApi } from "@/class/ResourceApi";
import { createClientServer } from "@/data/supabase";
import type { EmailLog } from "@/schemas/email_logs.schema";
import { EMAIL_LOG_STATUSES } from "@/lib/constants";

/**
 * API pour les logs d'emails
 */
export class EmailLogsApi extends ResourceApi<EmailLog> {
  constructor() {
    super(
      {
        table: "email_logs",
        select: "id, user_id, to_email, subject, status, created_at, updated_at, document_id, provider, provider_message_id, trace_id, error_code, error_message, error_details",
        sortableColumns: ["created_at"],
      },
      createClientServer()
    );
  }

  // ---------------------------------------------------------------------------
  // Checks
  // ---------------------------------------------------------------------------

  /**
   * Vérifie si un log d'email existe pour un document avec certains statuts
   * @param documentId L'identifiant du document
   * @param statuses Les statuts à vérifier
   * @returns Vrai si un log existe, faux sinon
   */
  async existsForDocument(
    documentId: string,
    statuses: (typeof EMAIL_LOG_STATUSES)[number][]
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.table)
      .select("id")
      .eq("document_id", documentId)
      .in("status", statuses)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  // ---------------------------------------------------------------------------
  // Creation
  // ---------------------------------------------------------------------------

  /**
   * Crée un log d'email en statut "pending"
   * @param payload Les données du log à créer
   * @returns Le log d'email créé
   */
  async createPending(payload: {
    user_id: string;
    document_id: string;
    to_email: string;
    subject: string;
    trace_id: string;
  }): Promise<EmailLog> {
    return this.create({
      ...payload,
      status: "pending",
    });
  }

  // ---------------------------------------------------------------------------
  // Updates
  // ---------------------------------------------------------------------------

  /**
   * Marque un log d'email comme envoyé
   * @param id L'identifiant du log
   * @param payload Les données à mettre à jour
   * @return void
   */
  async markAsSent(
    id: string,
    payload: {
      provider?: string;
      provider_message_id?: string | null;
      trace_id?: string;
    }
  ): Promise<void> {
    await this.update(id, {
      status: "sent",
      ...payload,
    });
  }

  /**
   * Marque un log d'email comme échoué
   * @param id L'identifiant du log
   * @param payload Les données à mettre à jour
   * @return void
   */
  async markAsFailed(
    id: string,
    payload: {
      provider?: string;
      error_code?: string;
      error_message?: string;
      error_details?: unknown;
      trace_id?: string;
    }
  ): Promise<void> {
    await this.update(id, {
      status: "failed",
      ...payload,
    });
  }
}
