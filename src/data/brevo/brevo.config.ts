import { z } from "zod";

/**
 * Configuration et validation des variables d'environnement pour Brevo.
 */
const BrevoEnvSchema = z.object({
  BREVO_API_KEY: z.string().min(10),
  BREVO_BASE_URL: z.url().default("https://api.brevo.com/v3"),
});

/**
 * Variables d'environnement validées pour Brevo.
 */
export const brevoEnv = BrevoEnvSchema.parse({
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  BREVO_BASE_URL: process.env.BREVO_BASE_URL ?? "https://api.brevo.com/v3",
});

/**
 * Assure que le code n'est pas exécuté côté client.
 * Lance une erreur si c'est le cas.
 */
export function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Brevo client must not run in the browser.");
  }
}
