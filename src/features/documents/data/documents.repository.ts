import { ResourceApi } from "@/data/class/ResourceApi";
import { isDev } from "@/lib/env";
import { logAction, viewCompanyID } from "@/data/logs";
import { createClient } from "@/data/supabase/client";
import { LogsStatus, LogsActionNature } from "@/features/activityLogs/schemas/logs.schema";
import { extractLogMetadata } from "@/lib/logs";
import { FilterOps, SORTABLE_DOCS } from "@/lib/index";
import { stripGenerated, stripGeneratedMany } from "@/lib/utils";
import type { Document, DocumentLine, DocumentListParams, DocumentListRow } from "@/schemas/documents.schema";

// ==============================================
// API liste + détail + création avec lignes
// ==============================================

/**
 * Liste des documents avec jointure client (pour l’affichage liste)
 * @param userId Optionnel : pour vérifier l’appartenance au user
 * @returns API liste des documents avec client
 */
const makeDocumentListApi = (userId?: string) =>
  new ResourceApi<Document & { client_name: string | null }>({
    table: "documents_with_client",
    select: "id, number, number_readonly, issue_date, total, status, currency_code, client_name, client_id, user_id, kind",
    sortableColumns: [...SORTABLE_DOCS],
    searchColumns: ["number", "client_name"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
    withLogging: true,
  });

/**
 * Liste des documents avec filtres, pagination, tri
 * @param params Paramètres de liste
 * @param userId Optionnel : pour vérifier l’appartenance au user
 * @returns Liste des documents + total
 */
const makeDocumentCrudApi = (userId?: string) =>
  new ResourceApi<Document>({
    table: "documents",
    select: "id, user_id, company_id, client_id, kind, status, number, issue_date, due_date, currency_code, fx_eur_per_unit_snapshot, subtotal, tax, total, total_eur, issue_year, sequence_number, number_readonly, reference_document_id, supply_date, payment_terms, penalty_rate, recovery_fee, purchase_order_number, notes_public, notes_private, pdf_url, created_at, updated_at",
    sortableColumns: [...SORTABLE_DOCS.filter((c) => c !== "client_name")],
    searchColumns: ["number"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
    withLogging: true,
  });

/**
 * Liste des documents avec filtres, pagination, tri
 * @param params Paramètres de liste
 * @param userId Optionnel : pour vérifier l’appartenance au user
 * @returns Liste des documents + total
 */
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

  const rows: DocumentListRow[] = (data as Array<
    Document & {
      client_name: string | null,
      email_sent: boolean
    }
  >).map((d) => ({
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
    email_sent: !!d.email_sent,
  }));

  return { rows, total };
}

/** 
 * Détail : document + lignes + client (pour l’éditeur) 
 * @param id ID du document
 * @param userId Optionnel : pour vérifier l’appartenance au user
 * @returns Document complet avec lignes et client
 */
export async function getDocumentDetail(id: string, userId?: string) {
  const sb = createClient();

  const { data, error } = await sb
    .from("documents")
    .select(
      [
        "*",
        "document_lines(*)",
        "clients:clients(id, name, address)",
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

/** 
 * Création document + lignes (transaction “pauvre” côté client) 
 * @param payload Document + lignes
 * @param userId Optionnel : ID du user
 * @returns Document créé (ID uniquement)
 */
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

  // Log manually since we bypassed ResourceApi
  await logAction({
    companyID: viewCompanyID({ table: "documents", objectID: doc.id }),
    action: "insert" as LogsActionNature,
    payload: {
      resource: "documents",
      action_nature: "insert",
      metadata: extractLogMetadata("documents", doc),
      data: doc,
    },
    status: "success" as LogsStatus,
  });

  return doc;
}

// ==============================================
// CRUD basique (sans lignes ni jointures)
// ==============================================

/** 
 * Récupération document simple (sans lignes)
 * @param id ID du document
 * @param userId Optionnel : ID du user
 * @returns Document
 */
export const getDocument = (id: string, userId?: string) => makeDocumentCrudApi(userId).get(id);

/** 
 * Création document + lignes (transaction “pauvre” côté client) 
 * @param payload Document + lignes
 * @param userId Optionnel : ID du user
 * @param opts Optionnel : options supplémentaires
 * @returns Document créé (ID uniquement)
 */
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
      if (isDev) console.error("PDF gen failed:", e);
    }
  }
  return doc;
};

/**
 * Mise à jour document + lignes
 * @param id ID du document
 * @param payload Document + lignes
 * @param userId Optionnel : ID du user
 * @returns Document mis à jour
 */
export const updateDocument = (
  id: string,
  payload: Partial<Document & { lines?: DocumentLine[] }>,
  userId?: string
) => makeDocumentCrudApi(userId).update(id, payload);

/** 
 * Suppression document
 * @param id ID du document
 * @param userId Optionnel : ID du user
 * @returns Document supprimé
 */
export const removeDocument = (id: string, userId?: string) => makeDocumentCrudApi(userId).remove(id);

/** 
 * Suppression multiple documents
 * @param ids IDs des documents
 * @param userId Optionnel : ID du user
 * @returns Documents supprimés
 */
export const bulkDeleteDocuments = (ids: string[], userId?: string) =>
  makeDocumentCrudApi(userId).bulkDelete(ids);
