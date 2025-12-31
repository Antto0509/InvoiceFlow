import { createResourceApi } from "@/data/createResourceApi";
import type {
  Client,
  ClientAddress,
  ClientContact,
  ClientWithDetails,
  ClientListParams,
  ClientAddressListParams,
  ClientContactListParams,
  ClientListRow,
  ClientContactSort,
  ClientAddressSort,
} from "@/schemas/clients.schema";
import { SORTABLE_CLIENTS } from "@/lib/constants";

/* ---------------------------------- */
/*             Clients API            */
/* ---------------------------------- */

/**
 * Crée une instance de l’API Clients
 * @param companyId ID de la société (multi-tenant)
 * @returns ResourceApi<Client> instance
 */
export const makeClientsApi = (companyId?: string) =>
  createResourceApi<Client>({
    table: "clients",
    select:
      "id, company_id, membership_id, name, email, phone, notes, created_at, updated_at",
    sortableColumns: [...SORTABLE_CLIENTS],
    searchColumns: ["name", "email", "company"],
    // scope multi-tenant
    defaultFilters: companyId
      ? { company_id: { op: "eq", value: companyId } }
      : undefined,
    protectedColumns: [],
  });

/**
 * Recherche rapide (autocomplete)
 * @param param0 Paramètres de recherche
 * @param companyId ID de la société (multi-tenant)
 * @return Liste des clients (id, name, email)
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
 * Liste paginée des clients
 * @param params Liste des paramètres de filtrage, pagination, tri
 * @param companyId ID de la société (multi-tenant)
 * @return Liste des clients et total
 */
export async function listClients(
  params: Partial<ClientListParams> = {},
  companyId?: string
) {
  const {
    page = 1,
    pageSize = 20,
    search,
    name,
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
        ...(name ? { name: { op: "ilike", value: name } } : {}),
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

export const getClient = (id: string, companyId?: string) =>
  makeClientsApi(companyId).get(id);

export const createClient = (payload: Partial<Client>, companyId?: string) =>
  makeClientsApi(companyId).create(payload);

export const updateClient = (
  id: string,
  payload: Partial<Client>,
  companyId?: string
) => makeClientsApi(companyId).update(id, payload);

export const removeClient = (id: string, companyId?: string) =>
  makeClientsApi(companyId).remove(id);

export const bulkDeleteClients = (ids: string[], companyId?: string) =>
  makeClientsApi(companyId).bulkDelete(ids);

/* ---------------------------------- */
/*        Addresses & Contacts API    */
/* ---------------------------------- */

/** 
 * Crée une instance de l’API Adresses clients
 * @param clientId ID du client (filtrage par défaut)
 * @returns ResourceApi<ClientAddress> instance
 */
export const makeClientAddressesApi = (clientId?: string) =>
  createResourceApi<ClientAddress>({
    table: "client_addresses",
    select:
      "id, client_id, kind, line1, line2, postal_code, city, region, country, created_at, updated_at, client:clients(name)",
    sortableColumns: [
      "kind",
      "city",
      "postal_code",
      "region",
      "country",
      "created_at",
      "updated_at",
    ],
    searchColumns: ["line1", "city", "postal_code", "region", "country"],
    defaultFilters: clientId
      ? { client_id: { op: "eq", value: clientId } }
      : undefined,
  });

/**
 * Crée une instance de l’API Contacts clients
 * @param clientId ID du client (filtrage par défaut)
 * @returns ResourceApi<ClientContact> instance
 */
export const makeClientContactsApi = (clientId?: string) =>
  createResourceApi<ClientContact>({
    table: "client_contacts",
    select: "id, client_id, full_name, email, phone, role, created_at, updated_at, client:clients(name)",
    sortableColumns: [
      "full_name",
      "email",
      "phone",
      "role",
      "created_at",
      "updated_at",
    ],
    searchColumns: ["full_name", "email", "phone", "role"],
    defaultFilters: clientId
      ? { client_id: { op: "eq", value: clientId } }
      : undefined,
  });

/* ---------------------------------- */
/*      Lists (alignées clients)      */
/* ---------------------------------- */

/**
 * Liste paginée des adresses clients
 * @param params Liste des paramètres de filtrage, pagination, tri
 * @param clientId ID du client
 * @return Liste des adresses et total
 */
export async function listClientAddresses(
  params: Partial<ClientAddressListParams> = {},
  clientId?: string
) {
  const {
    page = 1,
    pageSize = 20,
    search,
    kind,
    city,
    country,
    sort = { column: "created_at", dir: "asc" as const } as ClientAddressSort,
    signal,
    dateFrom,
    dateTo,
  } = params as ClientAddressListParams;

  const api = makeClientAddressesApi(clientId);

  try {
    const { data, total } = await api.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(kind ? { kind: { op: "eq", value: kind } } : {}),
        ...(city ? { city: { op: "ilike", value: city } } : {}),
        ...(country ? { country: { op: "eq", value: country } } : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    const rows = (data ?? []).map((a: ClientAddress & { client?: { name?: string } }) => ({
      ...a,
      client_name: a.client?.name ?? null,
    }));

    return { rows, total };
  } catch (err) {
    console.error(
      "[ClientsApi:listClientAddresses] Failed",
      { params, clientId },
      err
    );
    throw err;
  }
}


/**
 * Liste paginée des contacts clients
 * @param params Liste des paramètres de filtrage, pagination, tri
 * @param clientId ID du client
 * @return Liste des contacts et total
 */
export async function listClientContacts(
  params: Partial<ClientContactListParams> = {},
  clientId?: string
) {
  const {
    page = 1,
    pageSize = 20,
    search,
    role,
    hasEmail,
    sort = { column: "created_at", dir: "asc" as const } as ClientContactSort,
    signal,
    dateFrom,
    dateTo,
  } = params as ClientContactListParams;

  const api = makeClientContactsApi(clientId);

  try {
    const { data, total } = await api.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(role ? { role: { op: "ilike", value: role } } : {}),
        ...(hasEmail != null
          ? hasEmail
            ? { email: { op: "neq", value: null } }
            : { email: { op: "eq", value: null } }
          : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    const rows = (data ?? []).map((c: ClientContact & { client?: { name?: string } }) => ({
      ...c,
      client_name: c.client?.name ?? null,
    }));

    return { rows, total };
  } catch (err) {
    console.error(
      "[ClientsApi:listClientContacts] Failed",
      { params, clientId },
      err
    );
    throw err;
  }
}

/* ---------------------------------- */
/*          CRUD Addresses            */
/* ---------------------------------- */

export const getClientAddress = (id: string) =>
  makeClientAddressesApi().get(id);

export const createClientAddress = (payload: Partial<ClientAddress>) =>
  makeClientAddressesApi().create(payload);

export const updateClientAddress = (
  id: string,
  payload: Partial<ClientAddress>
) => makeClientAddressesApi().update(id, payload);

export const removeClientAddress = (id: string) =>
  makeClientAddressesApi().remove(id);

/* ---------------------------------- */
/*          CRUD Contacts             */
/* ---------------------------------- */

export const getClientContact = (id: string) =>
  makeClientContactsApi().get(id);

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

export async function getClientWithDetails(
  id: string,
  companyId?: string
): Promise<ClientWithDetails> {
  try {
    const [client, addresses, contacts] = await Promise.all([
      getClient(id, companyId),
      listClientAddresses({ page: 1, pageSize: 100 }, id),
      listClientContacts({ page: 1, pageSize: 100 }, id),
    ]);

    return {
      client: client as Client,
      addresses: addresses.rows,
      contacts: contacts.rows,
    };
  } catch (err) {
    console.error(
      "[ClientsApi:getClientWithDetails] Failed",
      { id, companyId },
      err
    );
    throw err;
  }
}
