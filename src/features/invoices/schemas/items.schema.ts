import { z } from "zod";

// --- Lignes de facture (DB: public.items) ---

/**
 * Schéma de validation pour les lignes de facture.
 */
export const itemFormSchema = z.object({
  id: z.uuid().optional(),
  invoice_id: z.uuid(),
  description: z.string().min(1, "Description requise"),
  qty: z.coerce.number().positive("Quantité > 0"),
  unit_price: z.coerce.number().min(0, "Prix >= 0"),
  total: z.coerce.number().min(0).optional(), // calculé
});

/**
 * Type des valeurs du formulaire de ligne de facture.
 */
export type ItemFormValues = z.infer<typeof itemFormSchema>;

/**
 * Type des lignes de facture.
 */
export type Item = {
  id: string;
  user_id: string;
  invoice_id: string;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
  created_at: string;
  updated_at: string;
};

/** 
 * Type des lignes de facture pour les listes
 */
export type ItemListRow = {
  id: string;
  user_id: string;
  invoice_id: string;
  description: string;
  qty: number;
  unit_price: number;
  total: number;
};