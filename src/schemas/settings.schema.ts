import { z } from "zod";

// --- Paramètres utilisateur (DB: public.settings) ---

/**
 * Schéma de validation pour les formulaires de paramètres utilisateur.
 */
export const settingsFormSchema = z.object({
  user_id: z.uuid().optional(), // géré serveur
  logo_url: z.url().optional().nullable(),
  legal_notes: z.string().optional().nullable(),
  bank_info: z.string().optional().nullable(),
});

/**
 * Type des valeurs du formulaire de paramètres utilisateur.
 */
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

/**
 * Type des paramètres utilisateur.
 */
export type Settings = {
  user_id: string;
  logo_url: string | null;
  legal_notes: string | null;
  bank_info: string | null;
};
