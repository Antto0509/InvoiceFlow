import { z } from "zod";

// --- Lignes de facture (DB: public.items) ---

/**
 * Schéma de validation pour les lignes de facture (form RHF).
 * On laisse total en option (calculé côté DB/compute).
 */
export const itemFormSchema = z.object({
  id: z.uuid().optional(),
  invoice_id: z.uuid(),
  description: z.string().min(1, "Description requise"),
  qty: z.coerce.number().positive("Quantité > 0"),
  unit_price: z.coerce.number().min(0, "Prix ≥ 0"),
  unit: z.string().optional().nullable(),                // "h", "jour", "pièce", etc.
  discount_rate: z.coerce.number().min(0).max(1).optional().nullable(), // 0.10 = 10%
  discount_amount: z.coerce.number().min(0).optional().nullable(),      // en €
  tax_rate: z.coerce.number().min(0).max(1).optional().nullable(),      // par ligne si utilisé
  total: z.coerce.number().min(0).optional(),            // calculé (DB: GENERATED)
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;

/**
 * Type des lignes de facture (lecture DB).
 * Aligne la signature sur tes colonnes actuelles.
 */
export type Item = {
  id: string;
  user_id: string | null;
  invoice_id: string | null;
  description: string;
  qty: number;                 // numeric
  unit_price: number;          // numeric
  total: number;               // numeric (GENERATED ALWAYS)
  unit: string | null;
  discount_rate: number | null;
  discount_amount: number | null;
  tax_rate: number | null;
  created_at: string;          // timestamptz
  updated_at: string;          // timestamptz
};

/** Lignes pour les listes (table) */
export type ItemListRow = {
  id: string;
  user_id: string | null;
  invoice_id: string | null;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
  unit?: string | null;
};
