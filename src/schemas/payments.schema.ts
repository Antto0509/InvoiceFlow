// ============================================================================
// Payments (InvoiceFlow) — Schémas Zod + Types TS
// Organisation :
//   1) Imports (Zod, helpers, constantes)
//   2) Schéma de validation des paiements et affectations
//   3) Types TS dérivés des schémas Zod
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zNonEmptyString,
  zPositive
} from "@/lib/zod";
import { PAYMENT_METHODS } from "@/lib/constants";

/**
 * Méthodes de paiement autorisées (ENUM DB: public.payment_method)
 */
export const paymentMethodEnum = z.enum(PAYMENT_METHODS).describe("Méthodes de paiement autorisées");

// ---------------------------------------------------------------------------
// 2) Schéma de validation des paiements et affectations
// ---------------------------------------------------------------------------

/**
 * Schéma principal des paiements (DB: public.payments)
 */
export const paymentSchema = z.object({
  id: zUuid.describe("Identifiant du paiement (UUID)"),
  user_id: zUuid.describe("Identifiant de l’utilisateur ayant enregistré le paiement (UUID)"),
  company_id: zUuid.describe("Identifiant de l’entreprise associée (UUID)"),
  method: paymentMethodEnum.describe("Méthode de paiement utilisée"),
  reference: zNonEmptyString.optional().describe("Référence du paiement"),
  paid_at: zDateISO.describe("Date du paiement"),
  amount: zPositive.describe("Montant du paiement"),
  currency_code: zNonEmptyString.describe("Code devise du paiement (ex: EUR)"),
  notes: zNonEmptyString.optional().describe("Notes associées au paiement"),
  created_at: zDateISO.optional().describe("Date de création du paiement"),
  updated_at: zDateISO.optional().describe("Date de dernière modification du paiement"),
}).describe("Paiement enregistré dans l’application InvoiceFlow");

/**
 * Table d’affectation d’un paiement à une facture (DB: public.payment_allocations)
 */
export const paymentAllocationSchema = z.object({
  payment_id: zUuid.describe("Identifiant du paiement (UUID)"),
  document_id: zUuid.describe("Identifiant du document (facture) (UUID)"),
  amount: zPositive.describe("Montant affecté à la facture"),
}).describe("Affectation d’un paiement à une facture dans l’application InvoiceFlow");

// ---------------------------------------------------------------------------
// 3) Types dérivés des schémas Zod
// ---------------------------------------------------------------------------

/**
 * Types TypeScript associés
 */
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentAllocation = z.infer<typeof paymentAllocationSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
