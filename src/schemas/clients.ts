import { z } from "zod";

// --- Clients (DB: public.clients) ---

/**
 * Schéma de validation pour les formulaires de client.
 */
export const clientFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(2, "Nom trop court"),
  email: z.email("Email invalide").optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Type des valeurs du formulaire de client.
 */
export type ClientFormValues = z.infer<typeof clientFormSchema>;

/**
 * Type des clients.
 */
export type Client = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  address: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;   // timestamptz
  updated_at: string;   // timestamptz
};
