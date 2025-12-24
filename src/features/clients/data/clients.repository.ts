// Api Clients
import { createResourceApi } from "@/data/createResourceApi";
import type {
  Client,
  ClientAddress,
  ClientContact,
  ClientWithDetails,
  ClientListParams,
  ClientListRow,
  ClientContactSort,
  ClientAddressSort,
} from "@/schemas/clients.schema";
import { SORTABLE_CLIENTS } from "@/lib/constants";

/* ---------------------------------- */
/*             Clients API            */
/* ---------------------------------- */

export const makeClientsApi = (companyId?: string) =>
  createResourceApi<Client>({
    table: "clients",
    select:
      "id, company_id, membership_id, name, email, company, phone, address, notes, created_at, updated_at",
    sortableColumns: [...SORTABLE_CLIENTS],
    searchColumns: ["name", "email", "company"],
    // ✅ scope multi-tenant par company_id (pas membership_id)
    defaultFilters: companyId ? { company_id: { op: "eq", value: companyId } } : undefined,
    protectedColumns: [],
  });

/**
 * Recherche rapide (autocomplete)
 * @param q Terme de recherche
 * @param limit Nombre max de résultats
 * @param signal Signal d’abandon (optionnel)
 * @param companyId UUID de l’entreprise (optionnel, pour multi-tenant)
 * @returns Liste des clients trouvés
 */
export async function searchClients(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  companyId?: string
): Promise<Array<{ id: string; name: string; email?: string | null }>> {
  const api = makeClientsApi(companyId);

  try {
    const { data } = await api.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "name", dir: "asc" },
      signal,
    });

    return data
      .filter((c): c is Client & { id: string } => typeof c.id === "string")
      .map((c) => ({ id: c.id, name: c.name, email: c.email ?? null }));
  } catch (err) {
    console.error("[ClientsApi:searchClients] Failed", { q, limit, companyId }, err);
    throw err;
  }
}

/**
 * Liste paginée avec filtres
 * @param params ClientListParams partiels
 * @param companyId UUID de l’entreprise (optionnel, pour multi-tenant)
 * @returns Liste paginée des clients
 */
export async function listClients(params: Partial<ClientListParams> = {}, companyId?: string) {
  const {
    page = 1,
    pageSize = 20,
    search,
    company,
    hasEmail,
    sort = { column: "name", dir: "asc" as const },
    signal,
    dateFrom,
    dateTo,
  } = params;

  const api = makeClientsApi(companyId);

  try {
    const { data, total } = await api.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(company ? { company: { op: "ilike", value: company } } : {}),
        // ⚠️ si ton applyFilters ne gère pas "neq null" correctement,
        // remplace par un op dédié (is/isnot). Je laisse tel quel pour ne pas casser ton infra.
        ...(hasEmail != null
          ? hasEmail
            ? { email: { op: "neq", value: null } }
            : { email: { op: "eq", value: null } }
          : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    return { rows: data as ClientListRow[], total };
  } catch (err) {
    console.error("[ClientsApi:listClients] Failed", { params, companyId }, err);
    throw err;
  }
}

/* ---------------------------------- */
/*          CRUD Client Ops           */
/* ---------------------------------- */

// ✅ Tous les CRUD prennent désormais companyId (tenant scope)
export const getClient = (id: string, companyId?: string) => makeClientsApi(companyId).get(id);

export const createClient = (payload: Partial<Client>, companyId?: string) =>
  makeClientsApi(companyId).create(payload);

export const updateClient = (id: string, payload: Partial<Client>, companyId?: string) =>
  makeClientsApi(companyId).update(id, payload);

export const removeClient = (id: string, companyId?: string) => makeClientsApi(companyId).remove(id);

export const bulkDeleteClients = (ids: string[], companyId?: string) =>
  makeClientsApi(companyId).bulkDelete(ids);

/* ---------------------------------- */
/*        Additional Client Data      */
/* ---------------------------------- */

export const makeClientAddressesApi = () =>
  createResourceApi<ClientAddress>({
    table: "client_addresses",
    select:
      "id, client_id, kind, line1, line2, postal_code, city, region, country, created_at, updated_at",
    sortableColumns: ["kind", "city", "postal_code", "region", "country", "created_at", "updated_at"],
    searchColumns: ["line1", "city", "postal_code", "region", "country"],
  });

export const makeClientContactsApi = () =>
  createResourceApi<ClientContact>({
    table: "client_contacts",
    select: "id, client_id, full_name, email, phone, role, created_at, updated_at",
    sortableColumns: ["full_name", "email", "phone", "role", "created_at", "updated_at"],
    searchColumns: ["full_name", "email", "phone", "role"],
  });

/* --------- Helpers alignés sur l’API Companies --------- */

// CRUD Adresses (par client)
export const listClientAddresses = (clientId: string) =>
  makeClientAddressesApi().list({
    page: 1,
    pageSize: 100,
    filters: { client_id: { op: "eq", value: clientId } },
    sort: { column: "created_at", dir: "asc" } as ClientAddressSort,
  });

export const createClientAddress = (payload: Partial<ClientAddress>) =>
  makeClientAddressesApi().create(payload);

export const updateClientAddress = (id: string, payload: Partial<ClientAddress>) =>
  makeClientAddressesApi().update(id, payload);

export const removeClientAddress = (id: string) => makeClientAddressesApi().remove(id);

// CRUD Contacts (par client)
export const listClientContacts = (clientId: string) =>
  makeClientContactsApi().list({
    page: 1,
    pageSize: 100,
    filters: { client_id: { op: "eq", value: clientId } },
    sort: { column: "created_at", dir: "asc" } as ClientContactSort,
  });

export const createClientContact = (payload: Partial<ClientContact>) =>
  makeClientContactsApi().create(payload);

export const updateClientContact = (id: string, payload: Partial<ClientContact>) =>
  makeClientContactsApi().update(id, payload);

export const removeClientContact = (id: string) => makeClientContactsApi().remove(id);

/* ---------------------------------- */
/*        Client With Details         */
/* ---------------------------------- */

/**
 * Récupère un client avec ses adresses et contacts
 * @param id UUID du client
 * @param companyId UUID de l’entreprise (optionnel, pour multi-tenant)
 * @returns ClientWithDetails
 */
export async function getClientWithDetails(
  id: string,
  companyId?: string
): Promise<ClientWithDetails> {
  try {
    const [client, { data: addresses }, { data: contacts }] = await Promise.all([
      getClient(id, companyId),
      listClientAddresses(id),
      listClientContacts(id),
    ]);

    return {
      client: client as Client,
      addresses: addresses as ClientAddress[],
      contacts: contacts as ClientContact[],
    };
  } catch (err) {
    console.error("[ClientsApi:getClientWithDetails] Failed", { id, companyId }, err);
    throw err;
  }
}
