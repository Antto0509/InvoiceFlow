// ============================================================================
// Currencies (InvoiceFlow) — Schémas Zod + Types TS
// Organisation :
//   1) Imports (Zod, helpers)
//   2) Schéma de validation des devises
//   3) Schéma de validation des taux de change
//   4) Types TS dérivés des schémas Zod
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zCurrencyCode,
  zNonEmptyString,
} from "@/lib/zod";

// ---------------------------------------------------------------------------
// 2) Schéma de validation des devises
// ---------------------------------------------------------------------------

/**
 * Schéma de validation pour les devises (DB: public.currencies)
 */
export const currencySchema = z.object({
  code: zCurrencyCode.describe("Code devise ISO-4217 (3 lettres, ex: EUR)"),
  name: zNonEmptyString.describe("Nom lisible de la devise (ex: Euro)"),
  symbol: zNonEmptyString.describe("Symbole monétaire (ex: €)"),
  locale: z.string().min(1).optional().nullable()
    .describe("Code locale (ex: fr-FR), optionnel"),
  is_active: z.boolean().optional()
    .describe("Devise active dans l’app (pour listes de sélection)"),
  created_at: zDateISO.optional()
    .describe("Horodatage de création (ISO)"),
  updated_at: zDateISO.optional()
    .describe("Horodatage de dernière modification (ISO)"),
}).describe("Devise monétaire (ex: EUR, USD, CHF)");

// ---------------------------------------------------------------------------
// 3) Schéma de validation des taux de change
// ---------------------------------------------------------------------------

/**
 * Schéma des taux de change (DB: public.currency_rates)
 */
export const currencyRateSchema = z.object({
  id: zUuid.optional().describe("Identifiant du taux de change (UUID)"),
  currency_code: zCurrencyCode.describe("Code devise concernée (ISO-4217)"),
  valid_from: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD")
    .describe("Date d’entrée en vigueur du taux (YYYY-MM-DD)"),
  eur_per_unit: z.number().positive("Le taux doit être strictement positif")
    .describe("Nombre d’euros pour 1 unité de la devise (ex: 1 USD → 0.93 EUR)"),
}).describe("Taux de change journalier pour une devise donnée");

// ---------------------------------------------------------------------------
// 4) Types dérivés des schémas Zod
// ---------------------------------------------------------------------------

// Types TS
export type Currency = z.infer<typeof currencySchema>;
export type CurrencyRate = z.infer<typeof currencyRateSchema>;
