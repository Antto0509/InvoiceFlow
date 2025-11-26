// ============================================================================
// Files — Schémas Zod + Types TS (InvoiceFlow)
// Organisation :
//   1) Imports (Zod, helpers)
//   2) Schéma de validation des fichiers
//   3) Schéma de validation des cibles de fichier (documents, clients, etc.)
//   4) Schéma combiné fichier + détails (target)
//   5) Types TS
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zNonEmptyString,
  zMimeType,
  zFileSize
} from "@/lib/zod";
import { FILE_TARGETS } from "@/lib/constants";

/** ENUM côté front aligné avec DB: file_target */
export const fileTargetEnum = z.enum(FILE_TARGETS).describe("Cible du fichier");

// ---------------------------------------------------------------------------
// 2) Schémas — Fichiers
// ---------------------------------------------------------------------------

/**
 * Schéma DB des fichiers (DB: public.files)
 * Note : timestamps en string ISO pour rester aligné Supabase.
 * Le champ target_id est nullable car un fichier peut ne pas être attaché à une cible.
 */
export const fileDbSchema = z.object({
    id: zUuid.describe("Identifiant fichier (UUID)"),
    user_id: zUuid.nullable().describe("Propriétaire (auth.uid)"),
    bucket: zNonEmptyString.describe("Bucket de stockage (Supabase Storage)"),
    path: zNonEmptyString.describe("Chemin du fichier dans le bucket"),
    mime_type: zMimeType.optional().describe("Type MIME du fichier"),
    size_bytes: zFileSize.optional().describe("Taille du fichier en octets"),
    created_at: zDateISO.describe("Création (ISO)")
}).describe("Fichier (enregistrement BDD)");

/**
 * Schéma formulaire fichier (UI)
 * Plus permissif sur id et timestamps; mêmes labels côté UI.
 */
export const fileFormSchema = z.object({
    id: zUuid.optional().describe("UUID (optionnel en création)"),
    bucket: zNonEmptyString.describe("Bucket de stockage"),
    path: zNonEmptyString.describe("Chemin du fichier dans le bucket"),
    mime_type: zMimeType.optional().describe("Type MIME du fichier"),
    size_bytes: zFileSize.optional().describe("Taille du fichier en octets"),
}).describe("Formulaire de création/édition de fichier");

// ---------------------------------------------------------------------------
// 3) Schémas — Cibles de fichier
// ---------------------------------------------------------------------------

/**
 * Schéma d’affectation d’un fichier à une cible (document, client, company, other)
 */
export const fileTargetSchema = z.object({
    file_id: zUuid.describe("Identifiant du fichier (UUID)"),
    target_table: fileTargetEnum.describe("Type de cible du fichier"),
    target_id: zUuid.describe("Identifiant de la cible (UUID)"),
    created_at: zDateISO.describe("Date d’affectation du fichier à la cible"),
}).describe("Affectation d’un fichier à une cible dans l’application InvoiceFlow");

// ---------------------------------------------------------------------------
// 4) Schémas — Fichier avec détails de la cible
// ---------------------------------------------------------------------------

/**
 * Schéma combiné fichier + détails de la cible associée
 */
export const fileWithDetailSchema = fileDbSchema.extend({
    target: fileTargetSchema.optional().describe("Détails de la cible du fichier"),
}).describe("Fichier avec détails de la cible associée");

// ---------------------------------------------------------------------------
// 5) Types TS
// ---------------------------------------------------------------------------

export type File = z.infer<typeof fileDbSchema>;
export type FileForm = z.infer<typeof fileFormSchema>;
export type FileTarget = z.infer<typeof fileTargetSchema>;
export type FileTargetType = z.infer<typeof fileTargetEnum>;
export type FileWithDetail = z.infer<typeof fileWithDetailSchema>;

/* ---------------------------------- */
/*        Recherche / Listing         */
/* ---------------------------------- */

export type FileSort = {
  column: "bucket" | "path" | "mime_type" | "size_bytes" | "created_at";
  dir: "asc" | "desc";
};

export type FileListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  bucket?: string;
  mimeType?: string;
  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  sort?: FileSort;
  signal?: AbortSignal;
};
