import { z } from "zod";

/**
 * Schéma de validation pour l'entrée d'un contact Brevo.
 */
export const BrevoContactInputSchema = z.object({
  email: z.email(),
  attributes: z.record(z.string(), z.any()).optional(),
  listIds: z.array(z.number().int().positive()).optional(),
  updateEnabled: z.boolean().optional(),
});

/**
 * Type TypeScript dérivée du schéma BrevoContactInputSchema.
 */
export type BrevoContactInput = z.infer<typeof BrevoContactInputSchema>;
