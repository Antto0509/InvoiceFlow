import { z } from "zod";
import { itemSchema } from "./items";

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
  currency: z.string().default("EUR"),
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
  sort?: { column: "issue_date" | "number" | "total" | "status"; dir: "asc" | "desc" };
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
  clientId?: string;
};
