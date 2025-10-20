import { createResourceApi } from "@/data/createResourceApi";
import type { Client, ClientListParams, ClientListRow } from "@/schemas/clients.schema";
import { SORTABLE_CLIENTS } from "@/lib/constants";

// ---- Clients API ----

/** API CRUD + liste générique pour clients */
export const makeClientsApi = (userId?: string) =>
  createResourceApi<Client>({
    table: "clients",
    select:
      "id, user_id, name, email, company, phone, address, notes, created_at, updated_at",
    sortableColumns: [...SORTABLE_CLIENTS],
    searchColumns: ["name", "email", "company"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
  });

/** Recherche rapide (autocomplete) */
export async function searchClients(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
): Promise<Array<{ id: string; name: string; email?: string | null }>> {
  const api = makeClientsApi(userId);
  const { data } = await api.list({
    page: 1,
    pageSize: limit,
    search: q,
    sort: { column: "name", dir: "asc" },
    signal,
  });
  return data.map((c) => ({ id: c.id, name: c.name, email: c.email ?? null }));
}

/** Liste paginée avec filtres (via l’API générique) */
export async function listClients(params: Partial<ClientListParams> = {}, userId?: string) {
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

  const { data, total } = await api.list({
    page,
    pageSize,
    search,
    sort,
    signal,
    filters: {
      ...(company ? { company: { op: "ilike", value: company } } : {}),
      ...(hasEmail ? { email: { op: "neq", value: null } } : {}),
      ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
      ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
    },
  });

  return { rows: data as ClientListRow[], total };
}

// ---- CRUD Clients
export const getClient = (id: string, userId?: string) => makeClientsApi(userId).get(id);
export const createClient = (payload: Partial<Client>, userId?: string) =>
  makeClientsApi(userId).create(payload);
export const updateClient = (id: string, payload: Partial<Client>, userId?: string) =>
  makeClientsApi(userId).update(id, payload);
export const removeClient = (id: string, userId?: string) => makeClientsApi(userId).remove(id);
export const bulkDeleteClients = (ids: string[], userId?: string) =>
  makeClientsApi(userId).bulkDelete(ids);
