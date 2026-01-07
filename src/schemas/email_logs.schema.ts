// ============================================================================
// Email Logs (InvoiceFlow) — Schéma Zod + Type TS
// Organisation :
//   1) Imports (Zod, helpers, constantes)
//   2) Schéma de validation des logs d'email
//   3) Type TS dérivé du schéma Zod
// ============================================================================

import { z } from "zod";
import { 
  zUuid,
  zEmail,
  zDateISO
} from "@/lib/zod";
import { EMAIL_LOG_STATUSES } from "@/lib/constants";

export const emailLogStatusEnum = z.enum(EMAIL_LOG_STATUSES).describe("Statuts des logs d'email");

// ---------------------------------------------------------------------------
// 2) Schéma de validation des logs d'email
// ---------------------------------------------------------------------------

/**
 * Schéma de validation pour les logs d'email.
 */
export const emailLogSchema = z.object({
  id: zUuid.describe("Identifiant du log d'email (UUID)"),
  user_id: zUuid.describe("Identifiant de l’utilisateur associé (UUID)"),
  document_id: zUuid.describe("Identifiant du document associé (UUID)"),
  to_email: zEmail.describe("Adresse e-mail du destinataire"),
  subject: z.string().describe("Sujet de l'email"),
  status: emailLogStatusEnum.describe("Statut de l'envoi de l'email"),
  created_at: zDateISO.describe("Date de création du log d'email"),
  updated_at: zDateISO.optional().describe("Date de dernière modification du log d'email"),
}).describe("Log d'email enregistré dans l’application InvoiceFlow");

// ---------------------------------------------------------------------------
// 3) Type dérivé du schéma Zod
// ---------------------------------------------------------------------------

// Types TS dérivés des schémas Zod
export type EmailLog = z.infer<typeof emailLogSchema>;
export type EmailLogStatus = z.infer<typeof emailLogStatusEnum>;
