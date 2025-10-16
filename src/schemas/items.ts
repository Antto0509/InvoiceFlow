import { z } from "zod";

// --- Lignes de facture (DB: public.items) ---

/**
 * Schéma de validation pour les lignes de facture.
 */
export const itemSchema = z.object({
  id: z.uuid().optional(),
  invoice_id: z.uuid(),
  description: z.string().min(1, "Description requise"),
  qty: z.coerce.number().positive("Quantité > 0"),
  unit_price: z.coerce.number().min(0, "Prix >= 0"),
  total: z.coerce.number().min(0).optional(), // souvent calculé
});

/**
 * Type des lignes de facture.
 */
export type Item = z.infer<typeof itemSchema>;
