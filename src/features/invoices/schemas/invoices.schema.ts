import { z } from "zod";
import { itemFormSchema } from "./items.schema";
import { DEFAULT_CURRENCY } from "@/lib/constants";
import { Item } from "./items.schema";

// --- Enums & Form ---

export const invoiceStatusEnum = z.enum(["draft", "sent", "paid", "overdue"] as const, {
  message: "Statut invalide",
});
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

/** Schéma du formulaire (ce que RHF manipule) */
export const invoiceFormSchema = z.object({
  id: z.uuid().optional(),
  client_id: z.uuid({ message: "Client invalide" }),
  number: z.string().optional().nullable(),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date d’émission invalide (YYYY-MM-DD)"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,"Date d’échéance invalide (YYYY-MM-DD)").optional().nullable(),
  currency_code: z.string().default(DEFAULT_CURRENCY),
  status: invoiceStatusEnum.default("draft"),
  items: z.array(itemFormSchema).min(1, "Ajoute au moins une ligne"),
  subtotal: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0).optional(),
  pdf_url: z.string().url().optional().nullable(),
  tax_rate: z.coerce.number().min(0).max(1).optional(),
});
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

// --- DB (table invoices “brute”) ---

export type InvoiceDb = {
  id: string;
  user_id: string | null;
  client_id: string | null;
  number: string | null;
  status: InvoiceStatus;
  issue_date: string;      // YYYY-MM-DD
  due_date: string | null; // YYYY-MM-DD
  currency_code: string | null; // default 'EUR'
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  pdf_url: string | null;
  created_at: string;      // timestamptz
  tax_rate: number | null;
};

// --- Pour la liste (table) ---

export type InvoiceListRow = {
  id: string;
  number: string | null;
  issue_date: string;
  total: number | null;
  status: InvoiceStatus;
  currency_code: string | null;
  /** nom du client (résolu via join), pratique pour l’affichage & tri */
  client_name: string | null;
};

// --- Pour l’édition / détails ---

export type InvoiceDetail = InvoiceDb & {
  client?: { id: string; name: string | null; address: string | null; company: string | null } | null;
  items: Item[];
};

// --- Params liste & tri ---

export type InvoiceListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: InvoiceStatus | "all";
  sort?: InvoiceSort;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  clientId?: string;
  signal?: AbortSignal;
};

/** On expose "client" côté UI, mais on le mappe vers `clients.name` côté requête */
export type InvoiceSort = {
  column: "client_name" | "issue_date" | "number" | "total" | "status";
  dir: "asc" | "desc";
};

// --- Props UI inchangées (juste InvoicesTable) ---
export interface InvoicesTableProps {
  data?: InvoiceListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: InvoiceSort;
  onSortChange?: (s: InvoiceSort) => void;
  onEdit?: (item: InvoiceListRow) => void;
  onDelete?: (item: InvoiceListRow) => void;
}


/**
 * Type des factures.
 */
export type Invoice = {
  id: string;
  user_id: string | null;
  client_id: string | null;
  number: string | null;
  status: InvoiceStatus;       // DB CHECK (draft|sent|paid|overdue)
  issue_date: string;          // date → string "YYYY-MM-DD"
  due_date: string | null;
  currency_code: string | null;     // default 'EUR'
  subtotal: number | null;     // numeric
  tax: number | null;          // numeric
  total: number | null;        // numeric
  pdf_url: string | null;
  created_at: string;          // timestamptz
  tax_rate: number | null;     // numeric
};

// --- Composants InvoicesTables ---

/**
 * Props pour le composant InvoicesTable.
 * 
 * @property data - Les données des lignes de facture.
 * @property loading - Indique si les données sont en cours de chargement.
 * @property onRowClick - Callback lorsqu'une ligne est cliquée, reçoit l'ID de la facture.
 * @property sort - L'état actuel du tri.
 * @property onSortChange - Callback lorsque le tri change, reçoit le nouvel état de tri.
 */
export interface InvoicesTableProps {
  data?: InvoiceListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: InvoiceSort;
  onSortChange?: (s: InvoiceSort) => void;
  onEdit?: (item: InvoiceListRow) => void;
  onDelete?: (item: InvoiceListRow) => void;
}

// --- Composants InvoiceModales ---

/**
 * Types des props pour les modales de gestion des factures.
 * 
 * @property isCreateOpen - Indique si la modale de création est ouverte.
 * @property setIsCreateOpen - Fonction pour ouvrir/fermer la modale de création.
 * @property creating - Indique si une création est en cours.
 * @property setCreating - Fonction pour définir l'état de création.
 * @property setParams - Fonction pour mettre à jour les paramètres de la liste des factures.
 */
export type InvoiceCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (v: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

/**
 * Types des props pour la modale d'édition de facture.
 * 
 * @property editInvoice - La facture à éditer.
 * @property setEditInvoice - Fonction pour définir la facture à éditer.
 * @property updating - Indique si une mise à jour est en cours.
 * @property setUpdating - Fonction pour définir l'état de mise à jour.
 * @property setParams - Fonction pour mettre à jour les paramètres de la liste des factures.
 */
export type InvoiceEditProps = {
  editInvoice: InvoiceDetail | null;
  setEditInvoice: (inv: InvoiceDetail | null) => void;
  updating?: boolean;
  setUpdating?: (v: boolean) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

/**
 * Types des props pour la modale de suppression de facture.
 * 
 * @property deleteInvoice - La facture à supprimer.
 * @property setDeleteInvoice - Fonction pour définir la facture à supprimer.
 * @property setParams - Fonction pour mettre à jour les paramètres de la liste des factures.
 */
export type InvoiceDeleteProps = {
  deleteInvoice: Invoice | null;
  setDeleteInvoice: (inv: Invoice | null) => void;
  setParams?: React.Dispatch<React.SetStateAction<InvoiceListParams>>;
};

/**
 * Types des props pour le composant InvoiceDialogs, qui regroupe les modales de création, édition et suppression.
 * 
 * @property mode - Le mode de la modale ("create", "edit" ou "delete").
 * @property ... - Les props spécifiques à chaque modale selon le mode.
 */
export type InvoiceDialogsProps =
  | ({ mode?: "create" } & InvoiceCreateProps)
  | ({ mode: "edit" } & InvoiceEditProps)
  | ({ mode: "delete" } & InvoiceDeleteProps);

/**
 * Type des données nécessaires pour générer le PDF d'une facture.
 */
export type InvoicePdfData = {
  number: string | null;
  issue_date: string;           // ISO
  due_date?: string | null;     // ISO
  currency_code: string | null;
  client: { name: string | null | undefined ; address?: string | null; company?: string | null };
  items: Array<{ description: string | null; qty: number | null; unit_price: number | null }>;
  subtotal: number | null;
  tax?: number | null;          // montant TVA
  total: number | null;
};