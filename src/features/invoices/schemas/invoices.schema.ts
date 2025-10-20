import { z } from "zod";
import { itemSchema } from "./items.schema";
import { DEFAULT_CURRENCY } from "@/lib/constants";

// --- Factures (DB: public.invoices) ---

/**
 * Enumération des statuts de facture.
 */
export const invoiceStatusEnum = z.enum(["draft", "sent", "paid", "overdue"] as const, {
  message: "Statut invalide",
});

/**
 * Type des statuts de facture.
 */
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

/**
 * Schéma de validation pour les formulaires de facture.
 */
export const invoiceFormSchema = z.object({
  id: z.uuid().optional(),
  client_id: z.uuid({ message: "Client invalide" }),
  number: z.string().optional().nullable(),
  issue_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date d’émission invalide (YYYY-MM-DD)"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date d’échéance invalide (YYYY-MM-DD)")
    .optional()
    .nullable(),
  currency: z.string().default(DEFAULT_CURRENCY),
  status: invoiceStatusEnum.default("draft"),
  items: z.array(itemSchema).min(1, "Ajoute au moins une ligne"),
  subtotal: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  total: z.coerce.number().min(0).optional(),
  pdf_url: z.url().optional().nullable(),
});

/**
 * Type des valeurs du formulaire de facture.
 */
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

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
  currency: string | null;     // default 'EUR'
  subtotal: number | null;     // numeric
  tax: number | null;          // numeric
  total: number | null;        // numeric
  pdf_url: string | null;
  created_at: string;          // timestamptz
};

/**
 * Type des lignes de facture pour les listes.
 */
export type InvoiceListRow = {
  id: string;
  number: string | null;
  issue_date: string; // ISO "YYYY-MM-DD"
  total: number | null;
  status: InvoiceStatus;
  clients: { name: string | null } | null;
};

/**
 * Paramètres pour la liste des factures.
 */
export type InvoiceListParams = {
  page?: number; // 1-based
  pageSize?: number;
  search?: string; // matches number or client name
  status?: InvoiceStatus | "all";
  sort?: InvoiceSort;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  clientId?: string;
  signal?: AbortSignal;
};

// --- Composants InvoicesTable ---

/**
 * Type pour le tri des factures.
 */
export type InvoiceSort = { column: "issue_date" | "number" | "total" | "status"; dir: "asc" | "desc" };

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
  editInvoice: Invoice | null;
  setEditInvoice: (inv: Invoice | null) => void;
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