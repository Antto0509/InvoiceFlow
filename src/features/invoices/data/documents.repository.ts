// documents.repository.ts
import { createResourceApi } from "@/data/createResourceApi";
import { createClient } from "@/data/supabase/client";
import { FilterOps, SORTABLE_DOCS } from "@/lib/index";
import { stripGenerated, stripGeneratedMany } from "@/lib/utils";
import type { Document, DocumentLine, DocumentListParams, DocumentListRow } from "@/schemas/documents.schema";

// ---- API “liste” : jointure client + alias client_name

const makeDocumentListApi = (userId?: string) =>
  createResourceApi<Document & { client_name: string | null }>({
    table: "documents_with_client",
    select: "id, number, number_readonly, issue_date, total, status, currency_code, client_name, client_id, user_id, kind",
    sortableColumns: [...SORTABLE_DOCS],
    searchColumns: ["number", "client_name"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

const makeDocumentCrudApi = (userId?: string) =>
  createResourceApi<Document>({
    table: "documents",
    select: "*",
    sortableColumns: [...SORTABLE_DOCS.filter((c) => c !== "client_name")],
    searchColumns: ["number"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

export async function listDocuments(params: Partial<DocumentListParams> = {}, userId?: string) {
  const {
    page = 1,
    pageSize = 20,
    search,
    status,
    kind = "all",
    sort = { column: "issue_date", dir: "desc" as const },
    dateFrom,
    dateTo,
    clientId,
    companyId,
    signal,
  } = params;

  const api = makeDocumentListApi(userId);

  const filters: Record<string, FilterOps> = {
    ...(status && status !== "all" ? { status: { op: "eq", value: status } } : {}),
    ...(kind && kind !== "all" ? { kind: { op: "eq", value: kind } } : {}),
    ...(clientId ? { client_id: { op: "eq", value: clientId } } : {}),
    ...(companyId ? { company_id: { op: "eq", value: companyId } } : {}),
    ...(dateFrom ? { issue_date: { op: "gte", value: dateFrom } } : {}),
    ...(dateTo ? { issue_date: { op: "lte", value: dateTo } } : {}),
  };

  const { data, total } = await api.list({
    page,
    pageSize,
    search,
    sort,
    signal,
    filters,
  });

  const rows : DocumentListRow[] = (data as Array<Document & { client_name: string | null }>).map((d) => ({
    id: d.id,
    number: d.number_readonly ?? d.number ?? null,
    issue_date: d.issue_date,
    total: d.total ?? null,
    status: d.status as string,
    currency_code: d.currency_code ?? null,
    client_name: d.client_name ?? null,
    client_id: d.client_id ?? null,
    user_id: d.user_id ?? null,
    kind: d.kind as string,
  }));

  return { rows, total };
}

/** Détail : document + lignes + client (pour l’éditeur) */
export async function getDocumentDetail(id: string, userId?: string) {
  const sb = createClient();

  const { data, error } = await sb
    .from("documents")
    .select(
      [
        "*",
        "document_lines(*)",
        "clients:clients(id, name, address, company)",
        "companies:companies(id, name, vat_regime, payment_terms, penalty_rate, recovery_fee_enabled, default_currency, logo_url)",
      ].join(",")
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Document not found");

  if (userId && data.user_id && data.user_id !== userId) {
    throw new Error("Forbidden");
  }

  return {
    ...(data as Document),
    lines: (data.document_lines ?? []) as DocumentLine[],
    client: data.clients
      ? {
          id: data.client_id,
          name: data.clients.name,
          address: data.clients.address,
          company: data.clients.company,
        }
      : null,
    company: data.companies ?? null,
  };
}

/** Création document + lignes (transaction “pauvre” côté client) */
export async function createDocumentWithLines(
  payload: Partial<Document & { lines?: Partial<DocumentLine>[] }>,
  userId?: string
) {
  const sb = createClient();
  const { lines, ...rawDoc } = payload || {};
  const docInsert = stripGenerated(rawDoc as Record<string, unknown>);
  const docToInsert = userId ? { ...docInsert, user_id: userId } : docInsert;

  const { data: doc, error: docErr } = await sb
    .from("documents")
    .insert(docToInsert)
    .select("id")
    .single();
  if (docErr) throw docErr;

  if (!lines?.length) return doc;

  const linesClean = stripGeneratedMany(lines as Partial<DocumentLine>[]).map(
    (ln) => ({
      ...ln,
      document_id: doc.id,
    })
  ) as Array<DocumentLine & { document_id: string }>;

  const { error: linesErr } = await sb.from("document_lines").insert(linesClean).select("id");
  if (linesErr) {
    await sb.from("documents").delete().eq("id", doc.id);
    throw linesErr;
  }

  return doc;
}

// CRUD simple
export const getDocument = (id: string, userId?: string) => makeDocumentCrudApi(userId).get(id);

export const createDocument = async (
  payload: Partial<Document & { lines?: DocumentLine[] }>,
  userId?: string,
  opts?: { generatePdf?: (docId: string) => Promise<{ path?: string | null }> } // injection optionnelle
) => {
  const doc = await makeDocumentCrudApi(userId).create(payload);
  if (!doc?.id) throw new Error("Erreur lors de la création");

  // Génération PDF optionnelle (si fournie)
  if (opts?.generatePdf) {
    try {
      const { path } = await opts.generatePdf(doc.id);
      if (path) {
        await makeDocumentCrudApi(userId).update(doc.id, { pdf_url: path });
        return { ...doc, pdf_url: path };
      }
    } catch (e) {
      console.error("PDF gen failed:", e);
    }
  }
  return doc;
};

export const updateDocument = (
  id: string,
  payload: Partial<Document & { lines?: DocumentLine[] }>,
  userId?: string
) => makeDocumentCrudApi(userId).update(id, payload);

export const removeDocument = (id: string, userId?: string) => makeDocumentCrudApi(userId).remove(id);

export const bulkDeleteDocuments = (ids: string[], userId?: string) =>
  makeDocumentCrudApi(userId).bulkDelete(ids);
