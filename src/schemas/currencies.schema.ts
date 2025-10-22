import { z } from "zod";

// --- Devises (DB: public.currencies & public.currency_rates) ---

/**
 * Schéma de validation pour les devises.
 */
export const currencySchema = z.object({
    code: z.string().length(3, "Le code de la devise doit contenir exactement 3 caractères"),
    name: z.string().min(1, "Le nom de la devise est requis"),
    symbol: z.string().min(1, "Le symbole de la devise est requis"),
    locale: z.string().min(1).optional().nullable(),
    is_active: z.boolean().optional(),
    created_at: z.string().optional(), // timestamptz -> string
    updated_at: z.string().optional(), // timestamptz -> string
});

export const currencyRateSchema = z.object({
    id: z.uuid().optional(),
    currency_code: z.string().length(3, "Le code de la devise doit contenir exactement 3 caractères"),
    valid_from: z.string(), // date -> string
    eur_per_unit: z.number().positive("Le taux de change doit être un nombre positif"),
});

/**
 * Type des devises.
 */
export type Currency = z.infer<typeof currencySchema>;

/**
 * Type des taux de change des devises.
 */
export type CurrencyRate = z.infer<typeof currencyRateSchema>;
