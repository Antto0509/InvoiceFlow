import { createResourceApi } from "@/data/createResourceApi";
import type { InvoiceListParams, InvoiceListRow, InvoiceDetail, InvoiceDb, InvoiceSort } from "@/schemas/invoices.schema";
import type { Item } from "@/schemas/items.schema";
import { SORTABLE_INVOICES } from "@/lib/constants";
import { stripGenerated, stripGeneratedMany } from "@/lib/utils";
import { createClient } from "@/data/supabase/client";
import { ensurePdfForInvoice } from "../hooks/generateInvoicePdf";

/** mapping du tri UI -> tri PostgREST */
function mapSortForApi(sort?: InvoiceSort) {
  if (!sort) return undefined;
  if (sort.column === "client_name") {
    // on cible la colonne liée
    return { column: "client_name", dir: sort.dir, foreignTable: "clients" as const };
  }
  return sort;
}

/** API pour la liste (avec jointure + alias client_name) */
export const makeInvoicesListApi = (userId?: string) =>
  createResourceApi<InvoiceDb>({
    table: "invoices",
    // On récupère le nom du client et on l’ALIAS en client_name pour simplifier l’UI.
    // Astuce PostgREST: on sélectionne l'objet puis on mappe en TS.
    select: "id, number, issue_date, total, status, currency_code, clients(name)",
    // IMPORTANT: autoriser tri sur la jointure
    sortableColumns: [...SORTABLE_INVOICES, "client_name"],
    searchColumns: ["number", "client_name"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
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

/** Liste paginée */
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
    sort: mapSortForApi(sort), // <— mapping ici
    signal,
    filters: {
      ...(status && status !== "all" ? { status: { op: "eq", value: status } } : {}),
      ...(clientId ? { client_id: { op: "eq", value: clientId } } : {}),
      ...(dateFrom ? { issue_date: { op: "gte", value: dateFrom } } : {}),
      ...(dateTo ? { issue_date: { op: "lte", value: dateTo } } : {}),
    },
  });

  // TS-remap vers InvoiceListRow (aplatir le client)
  type JoinedInvoice = InvoiceDb & { clients?: { name?: string } };
  const rows: InvoiceListRow[] = (data as JoinedInvoice[]).map((r) => ({
    id: r.id,
    number: r.number,
    issue_date: r.issue_date,
    total: r.total,
    status: r.status,
    currency_code: r.currency_code,
    client_name: r.clients?.name ?? null,
  }));

  return { rows, total };
}

/** Détail pour édition: facture + items + client */
export async function getInvoiceDetail(id: string, userId?: string): Promise<InvoiceDetail> {
  const sb = createClient();

  // On prend la facture, ses items, et le client (id & name)
  // PostgREST: "clients(id,name)" depuis invoices.client_id -> clients.id
  const { data, error } = await sb
    .from("invoices")
    .select("*, items(*), clients:clients(id, name, address, company)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Invoice not found");

  // Sécurisation multi-tenant si nécessaire
  if (userId && data.user_id && data.user_id !== userId) {
    throw new Error("Forbidden");
  }

  const detail: InvoiceDetail = {
    ...(data as InvoiceDb),
    items: (data.items ?? []) as Item[],
    client: data.clients ? { id: data.client_id, name: data.clients.name, address: data.clients.address, company: data.clients.company } : null,
  };

  return detail;
}

/** Création avec items (inchangé) */
export async function createInvoiceWithItems(
  payload: Partial<InvoiceDb & { items?: Item[] }>,
  userId?: string
) {
  const sb = createClient();
  const { items, ...rawInvoice } = payload || {};
  const invoiceInsert = stripGenerated(rawInvoice as Record<string, unknown>);
  const invoiceToInsert = userId ? { ...invoiceInsert, user_id: userId } : invoiceInsert;

  const { data: inv, error: invErr } = await sb.from("invoices").insert(invoiceToInsert).select("id").single();
  if (invErr) throw invErr;

  if (!items?.length) return inv;

  const itemsClean = stripGeneratedMany(items as Item[]).map((it: Omit<Item, "total" | "subtotal" | "tax"> & { user_id?: string | null }) => ({
    ...it,
    invoice_id: inv.id,
    ...(userId ? { user_id: it.user_id ?? userId } : {}),
  })) as Array<Item & { invoice_id: string; user_id?: string }>;

  const { error: itemsErr } = await sb.from("items").insert(itemsClean).select("id");
  if (itemsErr) {
    await sb.from("invoices").delete().eq("id", inv.id);
    throw itemsErr;
  }
  return inv;
}

// CRUD simple
export const getInvoices = (id: string, userId?: string) => makeInvoicesListApi(userId).get(id);
export const createInvoice = async (
  payload: Partial<InvoiceDb & { items?: Item[] }>,
  userId?: string
) => {
  const invoice = await makeInvoicesListApi(userId).create(payload);
  if (!invoice?.id) throw new Error("Erreur lors de la création");

  try {
    const { path } = await ensurePdfForInvoice(invoice.id, { store: true });

    if (path) {
      await makeInvoicesListApi(userId).update(invoice.id, { pdf_url: path });
      return { ...invoice, pdf_url: path };
    }
  } catch (e) {
    console.error("PDF gen failed:", e);
  }

  return invoice;
};
export const updateInvoice = (id: string, payload: Partial<InvoiceDb & { items?: Item[] }>, userId?: string) =>
  makeInvoicesListApi(userId).update(id, payload);
export const removeInvoice = (id: string, userId?: string) => makeInvoicesListApi(userId).remove(id);
export const bulkDeleteInvoices = (ids: string[], userId?: string) => makeInvoicesListApi(userId).bulkDelete(ids);
