import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers Zod (validation générique et descriptions)
// ---------------------------------------------------------------------------

/** Date stricte au format YYYY-MM-DD (UTC-agnostic) */
export const zDateYMD = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Format attendu : YYYY-MM-DD")
  .describe("Date au format YYYY-MM-DD");

/** Datetime ISO (souvent pour created_at/updated_at) */
export const zDateISO = z
  .iso
  .datetime({ offset: true, error: "Horodatage ISO attendu" })
  .describe("Horodatage ISO (avec décalage)");

/** Code devise ISO-4217 (3 lettres, ex: EUR, USD) */
export const zCurrencyCode = z
  .string()
  .min(3)
  .max(3)
  .regex(/^[A-Z]{3}$/i, "Code devise ISO-4217 en 3 lettres (ex: EUR)")
  .transform((v) => v.toUpperCase())
  .describe("Code devise ISO-4217 (3 lettres)");

/** UUID v4 standard */
export const zUuid = z.uuid({ version: "v4", error: "Doit être un UUID valide" })
  .describe("Identifiant unique (UUID)");

/** Nombre >= 0 */
export const zNonNegative = z
  .coerce.number()
  .refine((n) => n >= 0, { error: "Doit être supérieur ou égal à 0" })
  .describe("Nombre supérieur ou égal à 0");

export const zPositive = z
  .coerce.number()
  .refine((n) => n > 0, { error: "Doit être strictement supérieur à 0" })
  .describe("Nombre strictement supérieur à 0");

/** Chaîne de caractères non vide */
export const zNonEmptyString = z
  .string()
  .min(1, { error: "Ne peut pas être vide" })
  .describe("Chaîne de caractères non vide");

/** URL valide */
export const zUrl = z
  .url({ error: "Doit être une URL valide (ex: https://example.com)" })
  .describe("URL valide");

/** Adresse e-mail valide */
export const zEmail = z
  .email({ error: "Doit être une adresse e-mail valide" })
  .describe("Adresse e-mail valide");

/** Numéro de compte bancaire au format IBAN */
export const zIbanLike = z
  .string()
  .regex(
    /^[A-Z]{2}[0-9A-Z]{13,32}$/,
    "Doit ressembler à un IBAN (longueur entre 15 et 34 caractères)"
  )
  .describe("Numéro de compte bancaire au format IBAN");

/** Code BIC/SWIFT */
export const zBicLike = z
  .string()
  .regex(
    /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
    "Doit ressembler à un BIC/SWIFT (8 ou 11 caractères)"
  )
  .describe("Code BIC/SWIFT");
