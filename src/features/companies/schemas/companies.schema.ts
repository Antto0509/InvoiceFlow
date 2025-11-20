// ============================================================================
// Companies (InvoiceFlow) — Schémas Zod + Types TS
// Organisation :
//   1) Imports (Zod, helpers)
//   2) Schéma de validation des entreprises
//   3) Schéma de validation des adresses d’entreprise
//   4) Schéma de validation des comptes bancaires d’entreprise
//   5) Schéma combiné entreprise + détails (addresses, bank_accounts)
//   6) Types TS dérivés des schémas Zod
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zUrl,
  zEmail,
  zCurrencyCode,
  zNonEmptyString,
  zIbanLike,
  zBicLike,
} from "@/lib/zod";
import { ADDRESS_KINDS } from "@/lib/constants";

/** ENUM côté front aligné avec DB: address_kind */
export const companyAddressKindEnum = z.enum(ADDRESS_KINDS).describe("Type d’adresse d’entreprise");

// ---------------------------------------------------------------------------
// 2) Schéma de validation des entreprises
// ---------------------------------------------------------------------------

/** Entreprises (DB: public.companies) */
export const companySchema = z.object({
  id: zUuid.optional().describe("Identifiant (UUID)"),
  user_id: zUuid.optional().describe("Propriétaire (auth.uid)"),
  name: zNonEmptyString.describe("Raison sociale / Nom de l’entreprise"),

  legal_form: z.string().optional().nullable()
    .describe("Forme juridique (ex: SAS, EI)"),
  siren: z.string().optional().nullable()
    .describe("SIREN (9 chiffres)"),
  siret: z.string().optional().nullable()
    .describe("SIRET (14 chiffres)"),
  vat_number: z.string().optional().nullable()
    .describe("N° TVA intracommunautaire (ex: FRxx...)"),

  rcs_city: z.string().optional().nullable()
    .describe("Ville RCS (ex: Amiens)"),
  ape_naf: z.string().optional().nullable()
    .describe("Code APE/NAF (ex: 6201Z)"),
  share_capital: z.string().optional().nullable()
    .describe("Capital social (texte libre, formaté à l’affichage)"),

  website: zUrl.optional().nullable()
    .describe("Site web de l’entreprise"),
  email: zEmail.optional().nullable()
    .describe("Adresse e-mail de contact"),
  phone: z.string().optional().nullable()
    .describe("Téléphone"),
  logo_url: zUrl.optional().nullable()
    .describe("Logo (URL)"),

  default_currency: zCurrencyCode.default("EUR")
    .describe("Devise par défaut (ISO-4217, ex: EUR)"),
  payment_terms: z.string().optional().nullable()
    .describe("Conditions de paiement (ex: 30 jours net)"),
  penalty_rate: z.number().positive().optional().nullable()
    .describe("Taux de pénalité de retard"),
  recovery_fee_enabled: z.boolean().default(true)
    .describe("Activer les frais de recouvrement"),

  vat_regime: z
    .enum(["normal", "franchise_293B", "other"])
    .optional().nullable()
    .describe("Régime de TVA"),

  legal_notes: z.string().optional().nullable()
    .describe("Mentions légales / Notes à afficher sur les documents"),

  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Fiche entreprise (émettrice de documents)");

// ---------------------------------------------------------------------------
// 3) Schéma de validation des adresses d’entreprise
// ---------------------------------------------------------------------------

/** Identité légale de l’entreprise (sous-ensemble) */
export const companyIdentitySchema = companySchema.pick({
  id: true,
  name: true,
  siren: true,
  siret: true,
  legal_form: true,
  rcs_city: true,
  ape_naf: true,
  share_capital: true,
  vat_number: true,
}).describe("Identité légale de l’entreprise");

// ---------------------------------------------------------------------------
// 4) Schéma de validation des comptes bancaires d’entreprise
// ---------------------------------------------------------------------------

/** Contact & branding (sous-ensemble) */
export const companyContactBrandingSchema = companySchema.pick({
  id: true,
  website: true,
  email: true,
  phone: true,
  logo_url: true,
}).describe("Coordonnées et identité visuelle");

// ---------------------------------------------------------------------------
// 5) Schéma combiné entreprise + détails (addresses, bank_accounts)
// ---------------------------------------------------------------------------

/** Paramètres de facturation (sous-ensemble) */
export const companyBillingSchema = companySchema.pick({
  id: true,
  default_currency: true,
  payment_terms: true,
  penalty_rate: true,
  recovery_fee_enabled: true,
  vat_regime: true,
  legal_notes: true,
}).describe("Préférences de facturation");

/** Adresses d’entreprise (DB: public.company_addresses) */
export const companyAddressSchema = z.object({
  id: zUuid.optional().describe("Identifiant (UUID)"),
  company_id: zUuid.describe("Entreprise liée (FK)"),
  kind: companyAddressKindEnum.describe("Type d’adresse"),

  line1: zNonEmptyString.describe("Adresse (ligne 1)"),
  line2: z.string().optional().nullable().describe("Adresse (ligne 2)"),
  postal_code: z.string().optional().nullable().describe("Code postal"),
  city: z.string().optional().nullable().describe("Ville"),
  region: z.string().optional().nullable().describe("Région / État / Province"),
  // côté DB: text avec défaut 'FR'
  country: z.string().min(2).default("FR").describe("Pays (ISO-3166 alpha-2 de préférence)"),

  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Adresse d’entreprise");

/** Comptes bancaires d’entreprise (DB: public.company_bank_accounts) */
export const companyBankAccountSchema = z.object({
  id: zUuid.optional().describe("Identifiant (UUID)"),
  company_id: zUuid.describe("Entreprise liée (FK)"),
  label: zNonEmptyString.describe("Libellé (ex: Compte pro Crédit Agricole)"),
  iban: zIbanLike.describe("IBAN (validation légère)"),
  bic: zBicLike.describe("BIC (SWIFT) — validation légère"),
  display: z.boolean().default(true).describe("Afficher ces coordonnées sur les documents"),
  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Coordonnées bancaires d’entreprise");

/** Entreprise + détails liés (addresses, bank_accounts) */
export const companyWithDetailsSchema = z.object({
  company: companySchema.describe("Entreprise"),
  addresses: z.array(companyAddressSchema).describe("Adresses associées"),
  bank_accounts: z.array(companyBankAccountSchema).describe("Comptes bancaires associés"),
}).describe("Vue d’ensemble entreprise + détails");

// -------------------- Types TS associés --------------------

export type Company = z.infer<typeof companySchema>;
export type CompanyIdentity = z.infer<typeof companyIdentitySchema>;
export type CompanyContactBranding = z.infer<typeof companyContactBrandingSchema>;
export type CompanyBilling = z.infer<typeof companyBillingSchema>;
export type CompanyAddress = z.infer<typeof companyAddressSchema>;
export type CompanyAddressKind = z.infer<typeof companyAddressKindEnum>;
export type CompanyBankAccount = z.infer<typeof companyBankAccountSchema>;
export type CompanyWithDetails = z.infer<typeof companyWithDetailsSchema>;

// -------------------- Types FORM --------------------

export type CompanyFormValues = z.infer<typeof companySchema>;
export type CompanyAddressFormValues = z.infer<typeof companyAddressSchema>;
export type CompanyBankAccountFormValues = z.infer<typeof companyBankAccountSchema>;

// -------------------- Types LISTING --------------------

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

/** Tri de la liste d’entreprises */
export type CompanySort = {
  column: "name" | "vat_number" | "default_currency" | "vat_regime" | "created_at";
  dir: "asc" | "desc";
};

/** Paramètres de liste/recherche d’entreprises */
export type CompanyListParams = {
  page?: number;
  pageSize?: number;
  search?: string;

  /** Filtres mappables sur la table companies */
  vatRegime?: "normal" | "franchise_293B" | "other";
  hasVatNumber?: boolean;
  hasWebsite?: boolean;
  hasEmail?: boolean;

  dateFrom?: string; // ISO
  dateTo?: string;   // ISO
  signal?: AbortSignal;
  sort?: CompanySort;
};

// -------------------- Dialogs props --------------------

/** Props du composant CompanyCreateDialog */
export type CompanyCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyEditDialog */
export type CompanyEditProps = {
  editCompany: Company | null;
  setEditCompany: (company: Company | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyIdentityDialog */
export type CompanyIdentityProps = {
  editCompanyIdentity: CompanyIdentity | null;
  setEditCompanyIdentity: (identity: CompanyIdentity | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyContactBrandingDialog */
export type CompanyContactBrandingProps = {
  editCompanyContactBranding: CompanyContactBranding | null;
  setEditCompanyContactBranding: (contactBranding: CompanyContactBranding | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyBillingDialog */
export type CompanyBillingProps = {
  editCompanyBilling: CompanyBilling | null;
  setEditCompanyBilling: (billing: CompanyBilling | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyAddressesDialog */
export type CompanyAddressesProps = {
  company_id: string;
  editCompanyAddresses: CompanyAddress[] | null;
  setEditCompanyAddresses: (address: CompanyAddress[] | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyBankAccountsDialog */
export type CompanyBankAccountsProps = {
  company_id: string;
  editCompanyBankAccounts: CompanyBankAccount[] | null;
  setEditCompanyBankAccounts: (bankAccounts: CompanyBankAccount[] | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

/** Props du composant CompanyDeleteDialog */
export type CompanyDeleteProps = {
  deleteCompany: Company | null;
  setDeleteCompany: (company: Company | null) => void;
  setParams: React.Dispatch<React.SetStateAction<CompanyListParams>>;
};

export type CompanyDialogsProps =
  | ({ mode?: "create" } & CompanyCreateProps)
  | ({ mode: "edit" } & CompanyEditProps)
  | ({ mode: "editIdentity" } & CompanyIdentityProps)
  | ({ mode: "editContactBranding" } & CompanyContactBrandingProps)
  | ({ mode: "editBilling" } & CompanyBillingProps)
  | ({ mode: "editAddresses" } & CompanyAddressesProps)
  | ({ mode: "editBankAccounts" } & CompanyBankAccountsProps)
  | ({ mode: "delete" } & CompanyDeleteProps);
