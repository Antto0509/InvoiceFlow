// ============================================================================
// Documents (InvoiceFlow) — Schémas Zod + Types TS
// Organisation :
//   1) Imports (dates, currency, enums…)
//   2) Types dérivés des constantes (DocumentKind, …)
//   3) Schémas BDD (Document / Sequences / Lines / Reminders)
//   4) Schéma Form (DocumentFormSchema) + valeurs TS
//   5) Types de tri, paramètres de liste, rows, et props de modales
// ============================================================================

import { z } from "zod";
import { zCurrencyCode, zDateISO, zDateYMD, zNonNegative, zUuid } from "@/lib/zod";
import {
  DEFAULT_CURRENCY,
  DIR_SORT,
  DOC_KINDS,
  DOC_STATUSES,
  ITEM_KINDS,
  REMINDER_KINDS,
  REMINDER_STATUSES,
  SORTABLE_DOCS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// 2) Types dérivés des constantes (garantit la synchro avec constants.ts)
// ---------------------------------------------------------------------------

/** Types des documents (factures, devis, avoirs, proformas) */
export type DocumentKind = (typeof DOC_KINDS)[number];

/** Types des statuts de documents */
export type DocumentStatus = (typeof DOC_STATUSES)[number];

/** Types des lignes de documents (articles, services, etc.) */
export type DocumentItemKind = (typeof ITEM_KINDS)[number];

/** Types des rappels automatiques de paiement (relances clients) */
export type DocumentReminderKind = (typeof REMINDER_KINDS)[number];

/** Types des statuts des rappels automatiques de paiement */
export type DocumentReminderStatus = (typeof REMINDER_STATUSES)[number];

// ---------------------------------------------------------------------------
// 3) Schémas BDD
// ---------------------------------------------------------------------------

/**
 * Schéma principal des documents (factures, devis, avoirs, proformas)
 *
 * ⚠️ Côté BDD/API. Pour les formulaires, voir DocumentFormSchema plus bas.
 */
export const DocumentDbSchema = z.object({
  id: zUuid.describe("Identifiant unique du document"),
  user_id: zUuid.describe("Utilisateur propriétaire (auth.uid)"),
  company_id: zUuid.describe("Entreprise émettrice du document"),
  client_id: zUuid.describe("Client destinataire du document"),

  kind: z.enum(DOC_KINDS).describe("Type : invoice | quote | credit_note | proforma"),
  status: z.enum(DOC_STATUSES).describe("Statut : draft | sent | paid | overdue | void | finalized"),

  number: z.string().nullable().describe("Numéro visible (ex: FAC-2025-001)"),

  issue_date: zDateYMD.describe("Date d’émission"),
  due_date: zDateYMD.nullable().describe("Date d’échéance (factures uniquement)"),

  currency_code: zCurrencyCode
    .default(DEFAULT_CURRENCY)
    .describe("Devise du document (ISO-4217)"),

  fx_eur_per_unit_snapshot: z
    .number()
    .default(1.0)
    .refine((v) => v > 0, { message: "Must be greater than 0" })
    .describe("Taux de conversion 1 UNIT → EUR au moment de l’émission"),

  subtotal: zNonNegative.default(0).describe("Montant total HT (somme des lignes)"),
  tax: zNonNegative.default(0).describe("Montant total de TVA"),
  total: zNonNegative.default(0).describe("Montant TTC (subtotal + tax)"),
  total_eur: z.number().nullable().describe("Total converti en EUR (si devise ≠ EUR)"),

  sequence_number: z.number().nullable().describe("Numéro séquentiel interne (1,2,3,…)"),
  number_readonly: z
    .string()
    .nullable()
    .describe("Copie immuable du numéro pour l’historique"),

  reference_document_id: zUuid
    .nullable()
    .describe("Lien vers un autre document (ex: avoir lié à une facture)"),

  supply_date: zDateYMD.nullable().optional().describe("Date de livraison/prestation"),
  payment_terms: z.string().nullable().optional().describe("Conditions de paiement (ex: 30 jours)"),
  penalty_rate: z.number().nullable().optional().describe("Taux de pénalité de retard"),
  recovery_fee: z.boolean().nullable().optional().describe("Frais de recouvrement applicables"),
  purchase_order_number: z.string().nullable().optional().describe("Numéro de commande (PO)"),
  notes_public: z.string().nullable().optional().describe("Notes visibles (PDF)"),
  notes_private: z.string().nullable().optional().describe("Notes internes (non visibles)"),
  pdf_url: z
    .string()
    .min(1, "Chemin du PDF invalide")
    .nullable()
    .optional()
    .describe("Chemin du fichier PDF dans le bucket Supabase (ex: userId/FAC-2025-001.pdf)"),

  // On garde string ISO pour rester aligné avec Supabase (text/timestamptz -> string)
  created_at: zDateISO
    .describe("Horodatage de création (ISO)"),
  updated_at: zDateISO
    .describe("Horodatage de dernière modification (ISO)"),
}).describe("Document principal (facture, devis, avoir, proforma)");

/**
 * Séquences de numérotation par entreprise et type de document (par année)
 */
export const DocumentSequencesDbSchema = z.object({
  id: zUuid.describe("Identifiant unique de la séquence"),
  company_id: zUuid.describe("Entreprise associée"),
  kind: z.enum(DOC_KINDS).describe("Type concerné (invoice, quote, …)"),
  year: z.number().describe("Année de la séquence (ex: 2025)"),
  next_number: z.number().default(1).describe("Prochain numéro à attribuer"),
  config_id: zUuid.describe("Configuration de numérotation associée"),
  created_at: zDateISO.describe("Création (ISO)"),
  updated_at: zDateISO.describe("Dernière modification (ISO)"),
}).describe("Séquence de numérotation des documents");

/**
 * Lignes d’un document (articles, services, etc.)
 */
export const DocumentLinesDbSchema = z.object({
  id: zUuid.describe("Identifiant unique de la ligne"),
  document_id: zUuid.describe("Document parent (FK)"),

  kind: z.enum(ITEM_KINDS).default("service").describe("Type d’item : service | product | …"),
  description: z.string().describe("Description/détail de la prestation/produit"),

  qty: z
    .number()
    .default(1)
    .refine((v) => v > 0, { message: "Must be greater than 0" })
    .describe("Quantité (> 0)"),

  unit_price: z
    .number()
    .default(0)
    .refine((v) => v >= 0, { message: "Must be non-negative" })
    .describe("Prix unitaire HT"),

  unit: z.string().nullable().optional().describe("Unité (h, jour, pièce, …)"),
  discount_rate: z.number().nullable().optional().describe("Taux de remise (%)"),
  discount_amount: z.number().nullable().optional().describe("Montant absolu de remise"),
  tax_rate: z.number().nullable().optional().describe("Taux de TVA (%)"),

  line_total: zNonNegative.default(0).describe("Total HT de la ligne (après remise)"),
  position: z.number().nullable().optional().describe("Ordre d’affichage/tri"),

  created_at: zDateISO.describe("Création (ISO)"),
  updated_at: zDateISO.describe("Dernière modification (ISO)"),
}).describe("Ligne d’un document (article, service, etc.)");

/**
 * Rappels automatiques (relances) pour les documents
 */
export const DocumentRemindersDbSchema = z.object({
  id: zUuid.describe("Identifiant unique du rappel"),
  document_id: zUuid.describe("Document concerné (typiquement une facture)"),
  kind: z.enum(REMINDER_KINDS).describe("Type : before_due | after_due | …"),
  scheduled_at: zDateISO.describe("Date/heure planifiée (ISO)"),
  sent_at: z.string().nullable().describe("Date/heure d’envoi effectif (ISO)"),
  status: z.enum(REMINDER_STATUSES).default("scheduled").describe("Statut : scheduled | sent | failed"),
  created_at: zDateISO.describe("Création (ISO)"),
  updated_at: zDateISO.describe("Dernière modification (ISO)"),
}).describe("Rappel automatique pour document (relance)");

/** 
 * Configuration de numérotation des documents
 */
export const DocumentNumberingConfigDbSchema = z.object({
  id: zUuid.optional().describe("Identifiant unique de la configuration"),

  company_id: zUuid.describe("Entreprise associée"),

  kind: z.enum(DOC_KINDS).describe("Type de document concerné"),

  prefix: z.string()
    .min(1, "Préfixe requis")
    .describe("Préfixe du numéro (ex: FAC)"),

  format: z.string()
    .refine(v => v.includes("{number}"), {
      message: "Le format doit contenir {number}",
    })
    .describe("Format du numéro (ex: {prefix}-{year}-{number})"),

  is_active: z.boolean()
    .default(true)
    .describe("Indique si cette configuration est active"),

  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Configuration de numérotation des documents");

// Types TS dérivés
export type Document = z.infer<typeof DocumentDbSchema>;
export type DocumentLine = z.infer<typeof DocumentLinesDbSchema>;
export type DocumentSequence = z.infer<typeof DocumentSequencesDbSchema>;
export type DocumentReminder = z.infer<typeof DocumentRemindersDbSchema>;
export type DocumentNumberingConfig = z.infer<typeof DocumentNumberingConfigDbSchema>;

// ---------------------------------------------------------------------------
// 4) Schéma FORM (ce que RHF manipule côté UI)
//    - On autorise id/user_id optionnels
//    - On restreint "lines" au sous-ensemble utile au formulaire
// ---------------------------------------------------------------------------

/**
 * Schéma dédié au formulaire de création/édition de document.
 * On ne force pas certains champs gérés serveur (id, user_id, pdf_url, timestamps…).
 */
export const DocumentFormSchema = DocumentDbSchema
  .omit({ created_at: true, updated_at: true })
  .extend({
    id: DocumentDbSchema.shape.id.optional().describe("UUID (optionnel en création)"),
    user_id: DocumentDbSchema.shape.user_id.optional().describe("Renseigné par trigger/serveur"),

    // Les lignes dans le formulaire : uniquement les champs éditables
    lines: DocumentLinesDbSchema.pick({
      kind: true,
      description: true,
      qty: true,
      unit_price: true,
      unit: true,
      discount_rate: true,
      discount_amount: true,
      tax_rate: true,
    })
      .array()
      .min(1, "Ajoute au moins une ligne")
      .describe("Lignes éditées dans le formulaire"),
}).describe("Schéma de formulaire (client) pour les documents");

export type DocumentFormValues = z.infer<typeof DocumentFormSchema>;

// ---------------------------------------------------------------------------
// 5) Tri, Params de liste, Rows d’affichage, Props de composants
// ---------------------------------------------------------------------------

/** Configuration de tri pour les listes de documents */
export type DocumentSort = {
  /** Colonne triable (doit être listée dans SORTABLE_DOCS) */
  column: (typeof SORTABLE_DOCS)[number];
  /** Direction de tri : asc | desc */
  dir: (typeof DIR_SORT)[number];
};

/** Paramètres de liste/recherche pour les documents */
export type DocumentListParams = {
  page: number;                 // Index de page (0-based ou 1-based selon usage interne)
  pageSize: number;             // Nombre d’éléments par page
  search?: string;              // Requête texte (numéro, client, …)
  status?: DocumentStatus | "all";
  kind?: DocumentKind | "all";
  dateFrom?: string;            // Filtre date min (YYYY-MM-DD)
  dateTo?: string;              // Filtre date max (YYYY-MM-DD)
  clientId?: string;            // Filtrer par client
  companyId?: string;           // Filtrer par entreprise émettrice
  sort?: DocumentSort;          // Tri
  signal?: AbortSignal;         // Annulation fetch (UI)
};

/** Projection “liste” (ex: table) — souvent issue d’un SELECT + JOIN clients */
export type DocumentListRow = {
  id: string;
  number: string | null;
  kind: string | null;            // Facile à formatter (Facture/Devis/…)
  issue_date: string;             // YYYY-MM-DD
  total: number | null;
  status: string;
  currency_code: string | null;
  client_name: string | null;     // Depuis JOIN / vue
  user_id: string | null;
  email_sent?: boolean;           // Depuis JOIN / vue
};

/** Props du tableau des documents */
export type DocumentsTableProps = {
  data?: DocumentListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: DocumentSort;
  onSortChange?: (s: DocumentSort) => void;
  onEdit?: (item: DocumentListRow) => void;
  onDelete?: (item: DocumentListRow) => void;
  /** Affiche une colonne Type (Facture/Devis/Avoir/…) */
  showKindColumn?: boolean;
};

/** Document enrichi des lignes (utile pour édition) */
export type EditDoc = Document & { lines?: DocumentLine[] | null };

// ---------------------- Modales (create / edit / delete) --------------------

/** Props modale de création */
export type DocumentCreateProps = {
  kind: DocumentKind;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (v: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<DocumentListParams>>;
};

/** Props modale d’édition */
export type DocumentEditProps = {
  kind: DocumentKind;
  editDocument: EditDoc | null;
  setEditDocument: (inv: EditDoc | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<DocumentListParams>>;
};

/** Props modale de suppression */
export type DocumentDeleteProps = {
  kind: DocumentKind;
  deleteDocument: Document | null;
  setDeleteDocument: (inv: Document | null) => void;
  setParams?: React.Dispatch<React.SetStateAction<DocumentListParams>>;
};

/** Union des props pour les différents modes de la boîte de dialogue */
export type DocumentDialogsProps =
  | ({ mode?: "create" } & DocumentCreateProps)
  | ({ mode: "edit" } & DocumentEditProps)
  | ({ mode: "delete" } & DocumentDeleteProps);

export type DocumentsComponentProps = {
  kind: DocumentKind;
};