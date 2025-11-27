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
  ClientAddressSort
} from "@/schemas/clients.schema";
import { SORTABLE_CLIENTS } from "@/lib/constants";

/* ---------------------------------- */
/*             Clients API            */
/* ---------------------------------- */

export const makeClientsApi = (userId?: string) =>
  createResourceApi<Client>({
    table: "clients",
    select:
      "id, user_id, name, email, company, phone, address, notes, created_at, updated_at",
    sortableColumns: [...SORTABLE_CLIENTS],
    searchColumns: ["name", "email", "company"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

/** 
 * Recherche rapide (autocomplete) 
 * @param q Terme de recherche
 * @param limit Nombre max de résultats
 * @param signal Signal d’abandon (optionnel)
 * @param userId UUID de l’utilisateur (optionnel, pour multi-tenant)
 * @returns Liste des clients trouvés
 */
export async function searchClients(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
): Promise<Array<{ id: string; name: string; email?: string | null }>> {
  const api = makeClientsApi(userId);

  try {
    const { data } = await api.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "name", dir: "asc" },
      signal,
    });

    return data
      .filter(
        (c): c is Client & { id: string } =>
          typeof c.id === "string"
      )
      .map((c) => ({ id: c.id, name: c.name, email: c.email ?? null }));
  } catch (err) {
    console.error(
      "[ClientsApi:searchClients] Failed",
      { q, limit, userId },
      err
    );
    throw err;
  }
}

/** 
 * Liste paginée avec filtres 
 * @param params ClientListParams partiels
 * @param userId UUID de l’utilisateur (optionnel, pour multi-tenant)
 * @returns Liste paginée des clients
 */
export async function listClients(
  params: Partial<ClientListParams> = {},
  userId?: string
) {
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

  const api = makeClientsApi(userId);

  try {
    const { data, total } = await api.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(company
          ? { company: { op: "ilike", value: company } } // ou `%${company}%` selon ton createResourceApi
          : {}),
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
    console.error(
      "[ClientsApi:listClients] Failed",
      { params, userId },
      err
    );
    throw err;
  }
}

/* ---------------------------------- */
/*          CRUD Client Ops           */
/* ---------------------------------- */

export const getClient = (id: string, userId?: string) =>
  makeClientsApi(userId).get(id);

export const createClient = (payload: Partial<Client>, userId?: string) =>
  makeClientsApi(userId).create(payload);

export const updateClient = (id: string, payload: Partial<Client>, userId?: string) =>
  makeClientsApi(userId).update(id, payload);

export const removeClient = (id: string, userId?: string) =>
  makeClientsApi(userId).remove(id);

export const bulkDeleteClients = (ids: string[], userId?: string) =>
  makeClientsApi(userId).bulkDelete(ids);

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
    select:
      "id, client_id, full_name, email, phone, role, created_at, updated_at",
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

export const updateClientAddress = (
  id: string,
  payload: Partial<ClientAddress>
) => makeClientAddressesApi().update(id, payload);

export const removeClientAddress = (id: string) =>
  makeClientAddressesApi().remove(id);

// CRUD Contacts (par client)
export const listClientContacts = (clientId: string) =>
  makeClientContactsApi().list({
    page: 1,
    pageSize: 100,
    filters: { client_id: { op: "eq", value: clientId } },
    sort: { column: "created_at", dir: "asc" } as ClientContactSort
  });

export const createClientContact = (payload: Partial<ClientContact>) =>
  makeClientContactsApi().create(payload);

export const updateClientContact = (
  id: string,
  payload: Partial<ClientContact>
) => makeClientContactsApi().update(id, payload);

export const removeClientContact = (id: string) =>
  makeClientContactsApi().remove(id);

/* ---------------------------------- */
/*        Client With Details         */
/* ---------------------------------- */

/** 
 * Récupère un client avec ses adresses et contacts 
 * @param id UUID du client
 * @param userId UUID de l’utilisateur (optionnel, pour multi-tenant)
 * @returns ClientWithDetails
 */
export async function getClientWithDetails(
  id: string,
  userId?: string
): Promise<ClientWithDetails> {
  try {
    const [client, { data: addresses }, { data: contacts }] = await Promise.all([
      getClient(id, userId),
      listClientAddresses(id),
      listClientContacts(id),
    ]);

    return {
      client: client as Client,
      addresses: addresses as ClientAddress[],
      contacts: contacts as ClientContact[],
    };
  } catch (err) {
    console.error(
      "[ClientsApi:getClientWithDetails] Failed",
      { id, userId },
      err
    );
    throw err;
  }
}
