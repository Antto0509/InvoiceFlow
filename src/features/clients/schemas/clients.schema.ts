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
  name: string;
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