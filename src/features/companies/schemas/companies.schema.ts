import { z } from "zod";

/** ENUM côté front aligné avec DB: address_kind */
export const companyAddressKindEnum = z.enum([
  "headquarters", // siège
  "billing",      // facturation
  "shipping",     // livraison
  "other",
]);

/** Helpers simples pour IBAN/BIC (validation "light" et non bloquante) */
const ibanLike = z
  .string()
  .min(8, "IBAN trop court")
  .max(34, "IBAN trop long")
  .regex(/^[A-Z0-9 ]+$/i, "IBAN invalide (caractères non autorisés)");

const bicLike = z
  .string()
  .regex(/^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/, "BIC invalide")
  .optional()
  .nullable();

/**
 * Schéma de validation pour les entreprises (DB: public.companies)
 */
export const companySchema = z.object({
  id: z.uuid().optional(),
  user_id: z.uuid().optional(),
  name: z.string().min(1, "Le nom de l'entreprise est requis"),
  legal_form: z.string().optional().nullable(),         // ex: SAS, EI…
  siren: z.string().optional().nullable(),
  siret: z.string().optional().nullable(),
  vat_number: z.string().optional().nullable(),
  rcs_city: z.string().optional().nullable(),           // ex: Amiens
  ape_naf: z.string().optional().nullable(),            // ex: 6201Z
  share_capital: z.string().optional().nullable(),      // texte pour flexibilité
  website: z.url().optional().nullable(),
  email: z.email("Adresse e-mail invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  logo_url: z.url().optional().nullable(),
  default_currency: z.string().length(3).default("EUR"),
  payment_terms: z.string().optional().nullable(),
  penalty_rate: z.number().positive().optional().nullable(),
  recovery_fee_enabled: z.boolean().default(true),
  vat_regime: z
    .enum(["normal", "franchise_293B", "other"])
    .optional()
    .nullable(),
  legal_notes: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/** Schéma des adresses d'entreprise */
export const companyAddressSchema = z.object({
  id: z.uuid().optional(),
  company_id: z.uuid(),
  kind: companyAddressKindEnum,
  line1: z.string().min(1, "L’adresse (ligne 1) est requise"),
  line2: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  // DB: text avec défaut 'FR' — on autorise toute string non vide, ou restreins à 2 lettres si tu veux ISO-3166
  country: z.string().min(2).default("FR"),
  created_at: z.string().optional(), // timestamptz -> string
  updated_at: z.string().optional(), // timestamptz -> string
});

/** Schéma des comptes bancaires d’entreprise */
export const companyBankAccountSchema = z.object({
  id: z.uuid().optional(),
  company_id: z.uuid(),
  label: z.string().min(1, "Un libellé est requis"),   // ex: "Compte pro Crédit Agricole"
  iban: ibanLike,
  bic: bicLike,
  display: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const companyWithDetailsSchema = z.object({
  company: companySchema,
  addresses: z.array(companyAddressSchema),
  bank_accounts: z.array(companyBankAccountSchema),
});

/**
 * Type TypeScript associé
 */
export type Company = z.infer<typeof companySchema>;
export type CompanyAddress = z.infer<typeof companyAddressSchema>;
export type CompanyAddressKind = z.infer<typeof companyAddressKindEnum>;
export type CompanyBankAccount = z.infer<typeof companyBankAccountSchema>;
export type CompanyWithDetails = z.infer<typeof companyWithDetailsSchema>;

// --- Types pour les lignes de listing ---

export type CompanyListRow = Pick<
  Company,
  | "id"
  | "name"
  | "email"
  | "phone"
  | "website"
  | "vat_number"
  | "default_currency"
  | "vat_regime"
  | "created_at"
>;

// --- Types pour listing ---

export type CompanySort = { column: "name" | "vat_number" | "default_currency" | "vat_regime" | "created_at"; dir: "asc" | "desc" };

// --- Params pour listing ---

export type CompanyListParams = {
  page?: number;
    pageSize?: number;
    search?: string;
    /** Filtres simples directement mappables sur la table companies */
    vatRegime?: "normal" | "franchise_293B" | "other";
    hasVatNumber?: boolean;
    hasWebsite?: boolean;
    hasEmail?: boolean;
    dateFrom?: string; // ISO
    dateTo?: string;   // ISO
    signal?: AbortSignal;
    sort?: CompanySort;
};

// --- Dialogs props ---

/**
 * Type des props pour le composant CompanyCreateDialog.
 */
export type CompanyCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/**
 * Type des props pour le composant CompanyEditDialog.
 */
export type CompanyEditProps = {
  editCompany: Company | null;
  setEditCompany: (company: Company | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/**
 * Type des props pour le composant CompanyDeleteDialog.
 */
export type CompanyDeleteProps = {
  deleteCompany: Company | null;
  setDeleteCompany: (company: Company | null) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

export type CompanyDialogsProps = 
| ({ mode?: "create" } & CompanyCreateProps)
  | ({ mode: "edit" } & CompanyEditProps)
  | ({ mode: "delete" } & CompanyDeleteProps);