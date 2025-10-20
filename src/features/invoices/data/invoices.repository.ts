import { createResourceApi } from "@/data/createResourceApi";
import type { InvoiceListParams, InvoiceListRow, Invoice } from "@/schemas/invoices.schema";
import type { Item } from "@/schemas/items.schema";
import { SORTABLE_INVOICES } from "@/lib/constants";

// ---- Invoices API ----

/** API dédiée pour la liste (sélection + jointure client) */
const makeInvoicesListApi = (userId?: string) =>
  createResourceApi<InvoiceListRow>({
    table: "invoices",
    // jointure pour afficher le nom du client
    select: "id, number, issue_date, total, status, clients!inner(name)",
    sortableColumns: [...SORTABLE_INVOICES],
    // recherche sur numéro ET nom client
    searchColumns: ["number", "clients.name"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
  });

/** Recherche rapide (autocomplete) */
export async function searchInvoices(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
) : Promise<Array<{ id: string; number: string | null; issue_date: string }>> {
  const api = makeInvoicesListApi(userId);
  const { data } = await api.list({
    page: 1,
    pageSize: limit,
    search: q,
    sort: { column: "issue_date", dir: "desc" },
    signal,
  });
  return data.map((inv) => ({
    id: inv.id,
    number: inv.number,
    issue_date: inv.issue_date,
  }));
}

/** Liste paginée de factures (via API générique) */
export async function listInvoices(params: InvoiceListParams = {}, userId?: string) {
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    sort = { column: "issue_date", dir: "desc" as const },
    dateFrom,
    dateTo,
    clientId,
    signal,
  } = params;

  const api = makeInvoicesListApi(userId);

  const { data, total } = await api.list({
    page,
    pageSize,
    search,
    sort,
    signal,
    filters: {
      ...(status && status !== "all" ? { status: { op: "eq", value: status } } : {}),
      ...(clientId ? { client_id: { op: "eq", value: clientId } } : {}),
      ...(dateFrom ? { issue_date: { op: "gte", value: dateFrom } } : {}),
      ...(dateTo ? { issue_date: { op: "lte", value: dateTo } } : {}),
    },
  });

  return { rows: data as InvoiceListRow[], total };
}

// ---- CRUD Invoices
export const getInvoices = (id: string, userId?: string) => makeInvoicesListApi(userId).get(id);
export const createInvoice = (payload: Partial<Invoice & { items?: Item[] }>, userId?: string) =>
  makeInvoicesListApi(userId).create(payload);
export const updateInvoice = (id: string, payload: Partial<Invoice & { items?: Item[] }>, userId?: string) =>
  makeInvoicesListApi(userId).update(id, payload);
export const removeInvoice = (id: string, userId?: string) => makeInvoicesListApi(userId).remove(id);
export const bulkDeleteInvoices = (ids: string[], userId?: string) =>
  makeInvoicesListApi(userId).bulkDelete(ids);