// ============================================================================
// Users (InvoiceFlow) — Schémas Zod + Types TS
// Organisation :
//   1) Imports (Zod, helpers)
//   2) Schéma de validation des utilisateurs
//   3) Types TS dérivés des schémas Zod
// ============================================================================

import { z } from "zod";
import {
    zUuid,
    zDateISO,
    zUrl,
    zNonEmptyString,
    zEmail
} from "@/lib/zod";

// ---------------------------------------------------------------------------
// 2) Schéma de validation des utilisateurs
// ---------------------------------------------------------------------------

/**
 * Schéma de validation pour les utilisateurs (DB: public.users)
 */
export const userSchema = z.object({
    id: zUuid.describe("Identifiant de l’utilisateur (UUID)"),
    email: zEmail.describe("Adresse e-mail de l’utilisateur"),
    first_name: zNonEmptyString.describe("Prénom de l’utilisateur"),
    last_name: zNonEmptyString.describe("Nom de famille de l’utilisateur"),
    avatar_url: zUrl.optional().describe("URL de l’avatar de l’utilisateur"),
    created_at: zDateISO.optional().describe("Date de création de l’utilisateur"),
    updated_at: zDateISO.optional().describe("Date de dernière modification de l’utilisateur"),
}).describe("Utilisateur de l’application InvoiceFlow");

// ---------------------------------------------------------------------------
// 3) Types dérivés des schémas Zod
// ---------------------------------------------------------------------------

// Types TS dérivés des schémas Zod
export type User = z.infer<typeof userSchema>;
