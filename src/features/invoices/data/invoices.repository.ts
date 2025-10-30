import { createResourceApi } from "@/data/createResourceApi";
import type { InvoiceListParams, InvoiceListRow, InvoiceDetail, InvoiceDb } from "@/schemas/invoices.schema";
import type { Item } from "@/schemas/items.schema";
import { SORTABLE_INVOICES } from "@/lib/constants";
import { stripGenerated, stripGeneratedMany } from "@/lib/utils";
import { createClient } from "@/data/supabase/client";
import { ensurePdfForInvoice } from "../hooks/generateInvoicePdf";

/** API pour la liste (avec jointure + alias client_name) */
export const makeInvoicesListApi = (userId?: string) =>
  createResourceApi<InvoiceDb & { client_name: string | null }>({
    table: "invoices_with_client",
    select:
      "id, number, issue_date, total, status, currency_code, client_name, client_id, user_id",
    sortableColumns: [...SORTABLE_INVOICES, "client_name"],
    searchColumns: ["number", "client_name"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

export const makeInvoicesCrudApi = (userId?: string) =>
  createResourceApi<InvoiceDb>({
    table: "invoices",
    select: "*",
    sortableColumns: [...SORTABLE_INVOICES],
    searchColumns: ["number"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

/** Liste paginée */
export async function listInvoices(params: Partial<InvoiceListParams> = {}, userId?: string) {
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

  // ici les lignes sont déjà à plat
  return {
    rows: data as InvoiceListRow[],
    total,
  };
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
export const getInvoices = (id: string, userId?: string) => makeInvoicesCrudApi(userId).get(id);
export const createInvoice = async (
  payload: Partial<InvoiceDb & { items?: Item[] }>,
  userId?: string
) => {
  const invoice = await makeInvoicesCrudApi(userId).create(payload);
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
  makeInvoicesCrudApi(userId).update(id, payload);
export const removeInvoice = (id: string, userId?: string) => makeInvoicesCrudApi(userId).remove(id);
export const bulkDeleteInvoices = (ids: string[], userId?: string) => makeInvoicesCrudApi(userId).bulkDelete(ids);
