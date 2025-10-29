import { z } from "zod";

// --- Clients (DB: public.clients) ---

/**
 * Schéma de validation pour les formulaires de client.
 */
export const clientFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().min(2, "Nom trop court"),
  email: z.email("Email invalide").optional().nullable(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

/**
 * Type des valeurs du formulaire de client.
 */
export type ClientFormValues = z.infer<typeof clientFormSchema>;

/**
 * Type des clients.
 */
export type Client = {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  address: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;   // timestamptz
  updated_at: string;   // timestamptz
};

/**
 * Type des lignes de client pour les listes.
 */
export type ClientListRow = {
  id: string;
  name: string | null | undefined; // garde souplesse pour select partiels
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  created_at: string;   // ISO "YYYY-MM-DDTHH:mm:ss.sssZ"
  updated_at: string;   // ISO "YYYY-MM-DDTHH:mm:ss.sssZ"
};

/**
 * Type des props pour le composant ClientsTable.
 */
export type ClientsTableProps = {
  data?: ClientListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: ClientSort;
  onSortChange?: (sort: ClientSort) => void;
  onEdit?: (item: ClientListRow) => void;
  onDelete?: (item: ClientListRow) => void;
};

/**
 * Type des paramètres pour les listes de clients.
 */
export type ClientListParams = {
  page: number;
  pageSize: number;
  search: string;
  company: string;
  hasEmail: boolean;
  sort: ClientSort;
  signal?: AbortSignal;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
};

/**
 * Type du tri pour les listes de clients.
 */
export type ClientSort = { column: "name" | "email" | "company" | "phone" | "address" | "created_at" | "updated_at"; dir: "asc" | "desc" };

// --- Dialogs Clients ---

/**
 * Type des props pour le composant ClientCreateDialog.
 */
export type ClientCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/**
 * Type des props pour le composant ClientEditDialog.
 */
export type ClientEditProps = {
  editClient: Client | null;
  setEditClient: (client: Client | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/**
 * Type des props pour le composant ClientDeleteDialog.
 */
export type ClientDeleteProps = {
  deleteClient: Client | null;
  setDeleteClient: (client: Client | null) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/**
 * Type des props pour le composant ClientDialogs.
 */
export type ClientDialogsProps =
  | ({ mode?: "create" } & ClientCreateProps)
  | ({ mode: "edit" } & ClientEditProps)
  | ({ mode: "delete" } & ClientDeleteProps);

// --- Client addresses (DB: public.client_addresses) ---

/** ENUM côté front aligné avec DB: client_address_kind */
export const clientAddressKindEnum = z.enum(["billing", "shipping", "other"]);

/** Schéma des adresses client */
export const clientAddressSchema = z.object({
  id: z.uuid().optional(),
  client_id: z.uuid(),
  kind: clientAddressKindEnum,               // "billing" | "shipping" | "other"
  line1: z.string().min(1, "L’adresse (ligne 1) est requise"),
  line2: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  country: z.string().min(2).default("FR"),
  created_at: z.string().optional(),         // timestamptz -> string
  updated_at: z.string().optional(),         // timestamptz -> string
});

/** Schéma pour formulaire d’adresse client (pratique côté UI) */
export const clientAddressFormSchema = clientAddressSchema.extend({
  id: z.uuid().optional(),
});

/** Types associés */
export type ClientAddressKind = z.infer<typeof clientAddressKindEnum>;
export type ClientAddress = z.infer<typeof clientAddressSchema>;
export type ClientAddressFormValues = z.infer<typeof clientAddressFormSchema>;

// --- Client contacts (DB: public.client_contacts) ---

/** Schéma des contacts client */
export const clientContactSchema = z.object({
  id: z.uuid().optional(),
  client_id: z.uuid(),
  full_name: z.string().min(2, "Nom trop court"),
  email: z.email("Email invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.string().optional().nullable(),          // ex: "DAF", "Responsable achats", etc.
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

/** Schéma pour formulaire de contact client */
export const clientContactFormSchema = clientContactSchema.extend({
  id: z.uuid().optional(),
});

/** Types associés */
export type ClientContact = z.infer<typeof clientContactSchema>;
export type ClientContactFormValues = z.infer<typeof clientContactFormSchema>;

// --- DTO pratique si tu charges un client avec ses détails (joins) ---

export const clientWithDetailsSchema = z.object({
  client: z.object({
    id: z.string(),
    user_id: z.string().nullable(),
    name: z.string(),
    email: z.string().nullable(),
    address: z.string().nullable(),
    company: z.string().nullable(),
    phone: z.string().nullable(),
    notes: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  addresses: z.array(clientAddressSchema),
  contacts: z.array(clientContactSchema),
});

export type ClientWithDetails = z.infer<typeof clientWithDetailsSchema>;
