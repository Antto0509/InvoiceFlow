// ===========================================================================
// Settings (InvoiceFlow) — Schéma Zod + Types TS
// Organisation :
//   1) Imports (Zod)
//   2) Schéma de validation des paramètres utilisateur
//   3) Types TS dérivés des schémas Zod
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zUrl,
  zNonNegative
} from "@/lib/zod";

// ---------------------------------------------------------------------------
// 2) Schéma de validation des paramètres utilisateur
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  user_id: zUuid.describe("Identifiant de l’utilisateur associé (UUID)"),
  logo_url: zUrl.optional().describe("URL du logo de l’entreprise"),
  legal_notes: z.string().optional().describe("Mentions légales à afficher sur les documents"),
  bank_info: z.string().optional().describe("Informations bancaires de l’entreprise"),
  tax_rate: zNonNegative.optional().describe("Taux de TVA par défaut (%)"),
  updated_at: zDateISO.optional().describe("Date de dernière modification des paramètres"),
}).describe("Paramètres utilisateur dans l’application InvoiceFlow");

// ---------------------------------------------------------------------------
// 3) Types dérivés des schémas Zod
// ---------------------------------------------------------------------------

/**
 * Types TypeScript associés
 */
export type Settings = z.infer<typeof settingsSchema>;
