// ============================================================================
// Clients — Schémas Zod + Types TS (InvoiceFlow)
// Organisation :
//   1) Imports (Zod, helpers)
//   2) Schéma de validation des clients
//   3) Schéma de validation des adresses de client
//   4) Schéma de validation des contacts de client
//   5) Schéma combiné client + détails (addresses, contacts)
// ============================================================================

import { z } from "zod";
import {
  zUuid,
  zDateISO,
  zEmail,
  zNonEmptyString,
} from "@/lib/zod";
import { ADDRESS_KINDS } from "@/lib/constants";

/** ENUM côté front aligné avec DB: client_address_kind */
export const clientAddressKindEnum = z.enum(ADDRESS_KINDS).describe("Type d’adresse du client");

// ---------------------------------------------------------------------------
// 2) Schémas — Clients
// ---------------------------------------------------------------------------

/**
 * Schéma DB des clients (DB: public.clients)
 * Note : timestamps en string ISO pour rester aligné Supabase.
 */
export const clientDbSchema = z.object({
  id: zUuid.describe("Identifiant client (UUID)"),
  // user_id: zUuid.nullable().describe("Propriétaire (auth.uid)"),
  company_id: zUuid.describe("Entreprise propriétaire (FK)"),
  membership_id: zUuid.nullable().describe("Membre propriétaire (FK)"),
  name: zNonEmptyString.min(2, "Nom trop court").describe("Nom/Raison sociale du client"),
  email: zEmail.nullable().optional().describe("Email de contact"),
  address: z.string().nullable().optional().describe("Adresse (texte libre)"),
  company: z.string().nullable().optional().describe("Société (si contact personne)"),
  phone: z.string().nullable().optional().describe("Téléphone"),
  notes: z.string().nullable().optional().describe("Notes internes"),
  created_at: zDateISO.describe("Création (ISO)"),
  updated_at: zDateISO.describe("Dernière modification (ISO)"),
}).describe("Client (enregistrement BDD)");

/**
 * Schéma formulaire client (UI)
 * Plus permissif sur id et timestamps; mêmes labels côté UI.
 */
export const clientFormSchema = clientDbSchema
  .omit({ id: true, membership_id: true, created_at: true, updated_at: true })
  .describe("Formulaire de création/édition de client");

// Types TS
export type Client = z.infer<typeof clientDbSchema>;
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// ---------------------------------------------------------------------------
// 3) Schémas — Client addresses (DB: public.client_addresses)
// ---------------------------------------------------------------------------

/** Schéma DB des adresses client */
export const clientAddressSchema = z.object({
  id: zUuid.optional().describe("Identifiant adresse (UUID)"),
  client_id: zUuid.describe("Client lié (FK)"),
  kind: clientAddressKindEnum.describe("Type d’adresse"),
  line1: zNonEmptyString.describe("Adresse (ligne 1)"),
  line2: z.string().nullable().optional().describe("Adresse (ligne 2)"),
  postal_code: z.string().nullable().optional().describe("Code postal"),
  city: z.string().nullable().optional().describe("Ville"),
  region: z.string().nullable().optional().describe("Région/État/Province"),
  country: z.string().min(2).default("FR").describe("Pays (ISO-3166 alpha-2 recommandé)"),
  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Adresse client");

/** Schéma formulaire d’adresse client (UI) */
export const clientAddressFormSchema = clientAddressSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ country: z.string().min(2) })
  .describe("Formulaire d’adresse client");

// Types TS
export type ClientAddressKind = z.infer<typeof clientAddressKindEnum>;
export type ClientAddress = z.infer<typeof clientAddressSchema>;
export type ClientAddressFormValues = z.infer<typeof clientAddressFormSchema>;

// ---------------------------------------------------------------------------
// 4) Schémas — Client contacts (DB: public.client_contacts)
// ---------------------------------------------------------------------------

/** Schéma DB des contacts client */
export const clientContactSchema = z.object({
  id: zUuid.optional().describe("Identifiant contact (UUID)"),
  client_id: zUuid.describe("Client lié (FK)"),
  full_name: zNonEmptyString.min(2, "Nom trop court").describe("Nom complet"),
  email: zEmail.nullable().optional().describe("Email du contact"),
  phone: z.string().nullable().optional().describe("Téléphone"),
  role: z.string().nullable().optional().describe('Fonction (ex: "DAF", "Achats")'),
  created_at: zDateISO.optional().describe("Création (ISO)"),
  updated_at: zDateISO.optional().describe("Dernière modification (ISO)"),
}).describe("Contact d’un client");

/** Schéma formulaire de contact client (UI) */
export const clientContactFormSchema = clientContactSchema
  .omit({ created_at: true, updated_at: true })
  .describe("Formulaire de contact client");

// Types TS
export type ClientContact = z.infer<typeof clientContactSchema>;
export type ClientContactFormValues = z.infer<typeof clientContactFormSchema>;

// ---------------------------------------------------------------------------
/** 5) DTO pratique : Client + adresses + contacts (joins) */
// ---------------------------------------------------------------------------

export const clientWithDetailsSchema = z.object({
  client: clientDbSchema.describe("Client"),
  addresses: z.array(clientAddressSchema).describe("Adresses associées"),
  contacts: z.array(clientContactSchema).describe("Contacts associés"),
}).describe("Client avec détails");

export type ClientWithDetails = z.infer<typeof clientWithDetailsSchema>;

// ---------------------------------------------------------------------------
// 6) Listing / Table / Params / Sort
// ---------------------------------------------------------------------------

/** Liste des clients pour tableau */
export type ClientListRow = {
  id: string;
  name: string | null | undefined; // souple si SELECT partiel
  email: string | null;
  phone: string | null;
  address: string | null;
  company: string | null;
  created_at: string;   // ISO
  updated_at: string;   // ISO
};

/** Tri des listes de clients */
export type ClientSort = {
  column:
    | "name"
    | "email"
    | "company"
    | "phone"
    | "address"
    | "created_at"
    | "updated_at";
  dir: "asc" | "desc";
};

/** Tri des listes d'adresses clients */
export type ClientAddressSort = {
  column: keyof ClientAddress;
  dir: "asc" | "desc";
};

/** Tri des listes de contacts clients */
export type ClientContactSort = {
  column: keyof ClientContact;
  dir: "asc" | "desc";
};

/** Paramètres des listes de clients */
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

/** Paramètres des listes d'adresses clients */
export type ClientAddressListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort: {
    column: keyof ClientAddress;
    dir: "asc" | "desc";
  };
};

/** Paramètres des listes de contacts clients */
export type ClientContactListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sort: {
    column: keyof ClientContact;
    dir: "asc" | "desc";
  };
};

/** Props du composant ClientsTable */
export type ClientsTableProps = {
  data?: ClientListRow[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: ClientSort;
  onSortChange?: (sort: ClientSort) => void;
  onEdit?: (item: ClientListRow) => void;
  onDelete?: (item: ClientListRow) => void;
};

/** Props du composant ClientAddressesTable */
export type ClientAddressesTableProps = {
  data?: ClientAddress[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: ClientAddressSort;
  onSortChange?: (sort: ClientAddressSort) => void;
  onEdit?: (item: ClientAddress) => void;
  onDelete?: (item: ClientAddress) => void;
};

/** Props du composant ClientContactsTable */
export type ClientContactsTableProps = {
  data?: ClientContact[];
  loading?: boolean;
  onRowClick?: (id: string) => void;
  sort?: ClientContactSort;
  onSortChange?: (sort: ClientContactSort) => void;
  onEdit?: (item: ClientContact) => void;
  onDelete?: (item: ClientContact) => void;
};

// ---------------------------------------------------------------------------
// Dialogs props
// ---------------------------------------------------------------------------

/** Props du composant ClientCreateDialog */
export type ClientCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/** Props du composant ClientAddressCreateDialog */
export type ClientAddressCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientAddressListParams>>;
};

/** Props du composant ClientContactCreateDialog */
export type ClientContactCreateProps = {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  creating: boolean;
  setCreating: (creating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientContactListParams>>;
};

/** Props du composant ClientEditDialog */
export type ClientEditProps = {
  editClient: Client | null;
  setEditClient: (client: Client | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/** Props du composant ClientAddressEditDialog */
export type ClientAddressEditProps = {
  editClientAddress: ClientAddress | null;
  setEditClientAddress: (clientAddress: ClientAddress | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientAddressListParams>>;
};

/** Props du composant ClientContactEditDialog */
export type ClientContactEditProps = {
  editClientContact: ClientContact | null;
  setEditClientContact: (clientContact: ClientContact | null) => void;
  updating: boolean;
  setUpdating: (updating: boolean) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientContactListParams>>;
};

/** Props du composant ClientDeleteDialog */
export type ClientDeleteProps = {
  deleteClient: Client | null;
  setDeleteClient: (client: Client | null) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientListParams>>;
};

/** Props du composant ClientAddressDeleteDialog */
export type ClientAddressDeleteProps = {
  deleteClientAddress: ClientAddress | null;
  setDeleteClientAddress: (clientAddress: ClientAddress | null) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientAddressListParams>>;
};

/** Props du composant ClientContactDeleteDialog */
export type ClientContactDeleteProps = {
  deleteClientContact: ClientContact | null;
  setDeleteClientContact: (clientContact: ClientContact | null) => void;
  setParams: React.Dispatch<React.SetStateAction<ClientContactListParams>>;
};

/** Props du composant ClientDialogs */
export type ClientDialogsProps =
  | ({ mode?: "create" } & ClientCreateProps)
  | ({ mode: "createAddress" } & ClientAddressCreateProps)
  | ({ mode: "createContact" } & ClientContactCreateProps)
  | ({ mode: "edit" } & ClientEditProps)
  | ({ mode: "editAddress" } & ClientAddressEditProps)
  | ({ mode: "editContact" } & ClientContactEditProps)
  | ({ mode: "delete" } & ClientDeleteProps)
  | ({ mode: "deleteAddress" } & ClientAddressDeleteProps)
  | ({ mode: "deleteContact" } & ClientContactDeleteProps);