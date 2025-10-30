import { z } from "zod";
import { itemFormSchema, Item } from "./items.schema";
import { DEFAULT_CURRENCY } from "@/lib/constants";

// --- Enums & Form ---

export const invoiceStatusEnum = z.enum(["draft", "sent", "paid", "overdue"] as const, {
  message: "Statut invalide",
});
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

/** Types de documents (DB: public.doc_kind) */
export const invoiceKindEnum = z.enum(["invoice", "credit_note", "proforma", "quote"] as const);
export type InvoiceKind = z.infer<typeof invoiceKindEnum>;

/**
 * Schéma du formulaire (ce que RHF manipule).
 * Ajouts : company_id, supply_date, payment terms/penalties, recovery_fee, notes, kind, reference_invoice_id.
 * On garde les champs calculés (subtotal/tax/total) en option.
 */
export const invoiceFormSchema = z.object({
  id: z.uuid().optional(),
  client_id: z.uuid({ message: "Client invalide" }),
  company_id: z.uuid().optional().nullable(),
  number: z.string().optional().nullable(),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date d’émission invalide (YYYY-MM-DD)"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date d’échéance invalide (YYYY-MM-DD)")
    .optional()
    .nullable(),
  supply_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de prestation invalide (YYYY-MM-DD)")
    .optional()
    .nullable(),

  currency_code: z.string().default(DEFAULT_CURRENCY),
  status: invoiceStatusEnum.default("draft"),
  kind: invoiceKindEnum.default("invoice"),
  reference_invoice_id: z.uuid().optional().nullable(),

  // Conditions & mentions
  payment_terms: z.string().optional().nullable(),
  penalty_rate: z.coerce.number().min(0).max(1).optional().nullable(), // ex: 0.12 = 12%/an
  recovery_fee: z.boolean().optional().nullable(),
  purchase_order_number: z.string().optional().nullable(),
  notes_public: z.string().optional().nullable(),
  notes_private: z.string().optional().nullable(),

  // Lignes
  items: z.array(itemFormSchema).min(1, "Ajoute au moins une ligne"),

  // Montants (optionnels – calculés côté DB)
  subtotal: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0).optional(),
  tax_rate: z.coerce.number().min(0).max(1).optional(),
  pdf_url: z.url().optional().nullable(),
});
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// --- DB (table invoices “brute”) ---
// Ajout des colonnes présentes en DB : company_id, issue_year, sequence_number, number_readonly,
// fx_eur_per_unit_snapshot, total_eur, updated_at, kind, reference_invoice_id, supply_date, …
// On garde les types string pour dates/timestamptz (cohérence front).

export type InvoiceDb = {
  id: string;
  user_id: string | null;
  client_id: string | null;
  company_id: string | null;
  number: string | null;                 // legacy manuel si utilisé
  number_readonly: string | null;        // GENERATED ALWAYS (YYYY-xxxxxx)
  sequence_number: number | null;
  issue_year: number | null;

  status: InvoiceStatus;
  kind: InvoiceKind;

  issue_date: string;                    // YYYY-MM-DD
  due_date: string | null;               // YYYY-MM-DD
  supply_date?: string | null;           // YYYY-MM-DD

  currency_code: string | null;          // default 'EUR'
  subtotal: number | null;
  tax: number | null;                    // GENERATED ALWAYS
  total: number | null;                  // GENERATED ALWAYS
  tax_rate: number | null;

  fx_eur_per_unit_snapshot: number | null;
  total_eur: number | null;

  payment_terms: string | null;
  penalty_rate: number | null;           // ex: 0.1200
  recovery_fee: boolean | null;
  purchase_order_number: string | null;
  notes_public: string | null;
  notes_private: string | null;

  pdf_url: string | null;
  reference_invoice_id: string | null;

  created_at: string;                    // timestamptz
  updated_at: string;                    // timestamptz
};

// --- Pour la liste (table) ---

export type InvoiceListRow = {
  id: string;
  number: string | null;                 // tu peux préférer number_readonly ici
  issue_date: string;
  total: number | null;
  status: InvoiceStatus;
  currency_code: string | null;
  client_name: string | null;            // via JOIN clients
  company_name?: string | null;          // via JOIN companies (optionnel à l’écran)
};

// --- Pour l’édition / détails ---

export type InvoiceDetail = InvoiceDb & {
  client?: { id: string; name: string | null; address: string | null; company: string | null } | null;
  company?: {
    id: string;
    name: string | null;
    vat_regime?: string | null;
    payment_terms?: string | null;
    penalty_rate?: number | null;
    recovery_fee_enabled?: boolean | null;
    default_currency?: string | null;
    logo_url?: string | null;
  } | null;
  items: Item[];
  // (Optionnel) si tu ajoutes un résumé TVA par taux :
  // taxes?: Array<{ tax_rate: number; base_amount: number; tax_amount: number }>;
};

// --- Params liste & tri ---

export type InvoiceListParams = {
  page: number;
  pageSize: number;
  search: string;
  status: InvoiceStatus | "all";
  sort: InvoiceSort;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  clientId?: string;
  companyId?: string;
  signal?: AbortSignal;
};

/** On expose "client" côté UI, mais on le mappe vers clients.name côté requête */
export type InvoiceSort = {
  column: "client_name" | "issue_date" | "number" | "total" | "status";
  dir: "asc" | "desc";
};

// --- Props UI (table + modales) ---

export interface InvoicesTableProps {
  data?: InvoiceListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: InvoiceSort;
  onSortChange?: (s: InvoiceSort) => void;
  onEdit?: (item: InvoiceListRow) => void;
  onDelete?: (item: InvoiceListRow) => void;
}

// Modales
export type InvoiceCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (v: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

export type InvoiceEditProps = {
  editInvoice: InvoiceDetail | null;
  setEditInvoice: (inv: InvoiceDetail | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

export type InvoiceDeleteProps = {
  deleteInvoice: InvoiceDb | null;
  setDeleteInvoice: (inv: InvoiceDb | null) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

export type InvoiceDialogsProps =
  | ({ mode?: "create" } & InvoiceCreateProps)
  | ({ mode: "edit" } & InvoiceEditProps)
  | ({ mode: "delete" } & InvoiceDeleteProps);

// --- PDF DTO ---

export type InvoicePdfData = {
  number: string | null;
  issue_date: string;           // ISO
  due_date?: string | null;     // ISO
  currency_code: string | null;
  client: { name: string | null | undefined; address?: string | null; company?: string | null };
  items: Array<{ description: string | null; qty: number | null; unit_price: number | null; unit?: string | null }>;
  subtotal: number | null;
  tax?: number | null;          // montant TVA
  total: number | null;
  // (optionnel) mentions
  notes_public?: string | null;
  payment_terms?: string | null;
  penalty_rate?: number | null;
  recovery_fee?: boolean | null;
};
