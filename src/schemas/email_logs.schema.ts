import { z } from "zod";

// --- Logs d'email (DB: public.email_logs) ---

/**
 * Schéma de validation pour les logs d'email.
 */
export const emailLogSchema = z.object({
  id: z.uuid().optional(),
  user_id: z.uuid().optional().nullable(),
  invoice_id: z.uuid(),
  to_email: z.email("Email invalide"),
  subject: z.string().min(1, "Sujet requis"),
  status: z.string().min(1),        // DB: text libre (queued/sent/failed, etc.)
  created_at: z.string().optional(), // timestamptz -> string
});

/**
 * Type des logs d'email.
 */
export type EmailLog = z.infer<typeof emailLogSchema>;
