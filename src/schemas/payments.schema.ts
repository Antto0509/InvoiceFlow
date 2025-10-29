import { z } from "zod";

/**
 * Méthodes de paiement autorisées (ENUM DB: public.payment_method)
 */
export const paymentMethodEnum = z.enum([
  "bank_transfer",
  "card",
  "cash",
  "check",
  "paypal",
  "other",
]);

/**
 * Schéma principal des paiements (DB: public.payments)
 */
export const paymentSchema = z.object({
  id: z.uuid().optional(),
  user_id: z.uuid(),
  company_id: z.uuid(),
  method: paymentMethodEnum,
  reference: z.string().optional().nullable(),
  paid_at: z.string(), // date
  amount: z.number().positive("Le montant doit être positif"),
  currency_code: z.string().length(3).default("EUR"),
  notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/**
 * Table d’affectation d’un paiement à une facture (DB: public.payment_allocations)
 */
export const paymentAllocationSchema = z.object({
  payment_id: z.uuid(),
  invoice_id: z.uuid(),
  amount: z.number().positive(),
});

/**
 * Types TypeScript associés
 */
export type Payment = z.infer<typeof paymentSchema>;
export type PaymentAllocation = z.infer<typeof paymentAllocationSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodEnum>;
