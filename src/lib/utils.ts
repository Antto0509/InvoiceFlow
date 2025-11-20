import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FilterOps, SortSpec } from "@/lib/types";
import { format, Locale } from "date-fns";
import { toast } from "sonner";
import { Company } from "@/features/companies/schemas/companies.schema";
import { Filterable } from "@/lib/types";

/** 
 * Combine des classes CSS avec clsx et tailwind-merge.
 * @param inputs Classes CSS
 * @returns Chaîne de classes combinées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 
 * Formate une date en toute sécurité.
 * @param date Date à formater
 * @param formatStr Chaîne de format
 * @param locale Locale optionnelle
 * @returns Chaîne formatée ou "–" si la date est invalide
 */
export function formatDateSafe(date: string | Date | null | undefined, formatStr: string, locale?: Locale): string {
  if (!date) return "–";
  try {
    return format(typeof date === "string" ? new Date(date) : date, formatStr, { locale });
  } catch {
    return "–";
  }
}

/** 
 * Formate une valeur monétaire selon la locale et la devise.
 * @param value Valeur numérique
 * @param currency Code devise (ex: "EUR", "USD")
 * @returns Chaîne formatée
 */
export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value || 0);
  } catch {
    const n = Number.isFinite(value) ? Number(value) : 0;
    return `${n.toFixed(2)} ${currency}`;
  }
}

/**
 * Génère un UUID sécurisé, ou un UUID nul en cas d'échec.
 * @returns UUID sous forme de chaîne
 */
export function safeRandomUUID() {
  try {
    if (typeof crypto !== "undefined" && (crypto as Crypto | undefined)?.randomUUID) {
      return (crypto as Crypto).randomUUID();
    }
  } catch {
    // ignore
  }
  return "00000000-0000-0000-0000-000000000000";
}

/** 
 * Échappe % et _ pour LIKE/ILIKE. 
 * @param input Terme à échapper
 * @returns Terme échappé
 */
function escapeLike(input: string) {
  return input.replace(/[%_]/g, (m) => `\\${m}`);
}

/** 
 * Construit un OR ILIKE multi-colonnes.
 * @param columns Colonnes à interroger
 * @param raw Terme brut à rechercher
 * @returns Chaîne de requête OR ILIKE ou undefined si le terme est vide
 */
export function buildOrIlike(columns: string[], raw: string) {
  const term = escapeLike(raw.trim().replaceAll(",", " "));
  if (!term) return undefined;
  const pattern = `%${term}%`;
  return columns.map((c) => `${c}.ilike.${pattern}`).join(",");
}

/** 
 * Valide une spec de tri contre la whitelist. 
 * @param sort La spec de tri à valider
 * @param whitelist La liste blanche des colonnes autorisées
 * @returns La spec de tri validée ou undefined
 */
export function ensureSortable(sort?: SortSpec, whitelist: string[] = []): SortSpec | undefined {
  if (!sort) return undefined;
  if (!whitelist.includes(sort.column)) return undefined;
  return {
    column: sort.column,
    dir: sort.dir ?? "asc",
    foreignTable: sort.foreignTable,
    nulls: sort.nulls,
  };
}

/**
 * Supprime les champs générés (total, subtotal, tax) d'une ligne d'objet.
 * @param row Ligne d'objet à nettoyer
 * @returns Ligne sans les champs générés
 */
export function stripGenerated<T extends Record<string, unknown>>(row: T) {
  const { total: _total, subtotal: _subtotal, tax: _tax, ...rest } = row;
  void _total;
  void _subtotal;
  void _tax;
  return rest as Omit<T, "total" | "subtotal" | "tax">;
}

/** 
 * Supprime les champs générés (total, subtotal, tax) de plusieurs lignes d'objet.
 * @param rows Lignes d'objet à nettoyer
 * @returns Lignes sans les champs générés
 */
export function stripGeneratedMany<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map(stripGenerated);
}

/** 
 * Applique des filtres PostgREST-like à une requête.
 * @param req Requête à filtrer
 * @param filters Filtres à appliquer
 * @returns Requête filtrée
 */
export function applyFilters<TReq>(
  req: TReq,
  filters?: Record<string, FilterOps | undefined>
): TReq {
  if (!filters) return req;
  // Work on a typed view of the request to call PostgREST-like methods without using `any`.
  let r = req as unknown as Filterable<TReq>;
  for (const [col, spec] of Object.entries(filters)) {
    if (!spec) continue;
    const { op, value } = spec as FilterOps & { value: unknown };
    if (value === undefined || value === null || value === "") continue;
    switch (op) {
      case "eq":    r = r.eq(col, value); break;
      case "neq":   r = r.neq(col, value); break;
      case "gt":    r = r.gt(col, value); break;
      case "gte":   r = r.gte(col, value); break;
      case "lt":    r = r.lt(col, value); break;
      case "lte":   r = r.lte(col, value); break;
      case "ilike": r = r.ilike(col, `%${escapeLike(String(value))}%`); break;
      case "in":    r = r["in"](col, value as unknown[]); break;
    }
  }
  return r as unknown as TReq;
}

/** 
 * Supprime les colonnes protégées d'un objet.
 * @param input Objet à nettoyer
 * @param protectedColumns Colonnes à supprimer
 * @returns Objet sans les colonnes protégées
 */
export function stripProtected(input: Record<string, unknown>, protectedColumns?: string[]) {
  const protectedCols = protectedColumns ?? [];
  for (const col of protectedCols) delete input[col];
  return input;
}

/** 
 * Formate le régime de TVA d'une entreprise.
 * @param v Régime de TVA
 * @returns Chaîne formatée
 */
export function fmtVatRegime(v?: Company["vat_regime"] | null) {
  if (!v) return "—";
  return v === "normal"
    ? "Régime normal"
    : v === "franchise_293B"
    ? "Franchise en base (art. 293 B)"
    : "Autre";
}

/**
 * Formate le type d'adresse.
 * @param kind Type d'adresse
 * @returns Chaîne formatée
 */
export function labelAddressKind(kind: string) {
  switch (kind) {
    case "headquarters":
      return "Siège";
    case "billing":
      return "Facturation";
    case "shipping":
      return "Livraison";
    default:
      return "Autre";
  }
}

/** 
 * Formate le type de document.
 * @param kind Type de document
 * @returns Chaîne formatée
 */
export function labelDocKind(kind: string) {
  switch (kind) {
    case "invoice":
      return "Facture";
    case "credit_note":
      return "Avoir";
    case "quote":
      return "Devis";
    case "proforma":
      return "Proforma";
    case "contract":
      return "Contrat";
    default:
      return "Document";
  }
}

/** 
 * Formate le statut d'un document selon son type.
 * @param kind Type de document
 * @param status Statut du document
 * @returns Chaîne formatée
 */
export function labelDocStatus(kind: string, status: string) {
  const statusLabelByKind: Record<string, Record<string, string>> = {
    invoice: { draft: "Brouillon", sent: "Envoyée", paid: "Payée", overdue: "En retard", void: "Annulée" },
    credit_note: { draft: "Brouillon", sent: "Envoyée", void: "Annulée" },
    quote: { draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", declined: "Refusé", expired: "Expiré", void: "Annulé" },
    proforma: { draft: "Brouillon", sent: "Envoyée", void: "Annulée" }
  };
  return statusLabelByKind[kind]?.[status] ?? status;
}

/** 
 * Obtient la variante de bouton selon le statut du document.
 * @param status Statut du document
 * @returns Variante de bouton
 */
export function getDocStatusVariant(status: string) {
  const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
    paid: "default",
    accepted: "default",
    signed: "default",
    overdue: "destructive",
    declined: "destructive",
    expired: "destructive",
    draft: "secondary",
    sent: "outline",
  };
  return statusVariant[status] ?? "outline";
}

/**
 * Télécharge le PDF d'un document.
 * @param id Identifiant du document
 * @param force Forcer le téléchargement du PDF
 * @returns Promise résolue une fois le téléchargement initié
 */
export async function downloadDocumentPdf(id: string, force = false) {
  const q = new URLSearchParams({ redirect: "0", ttl: "300" });
  if (force) q.set("force", "1");

  const res = await fetch(`/api/documents/${id}/pdf?` + q.toString());

  type PdfResponse = { url?: string } | Record<string, unknown>;
  const body = (await res.json().catch((): PdfResponse => ({}))) as PdfResponse;

  if (!res.ok) return toast.error("Échec du téléchargement du PDF");
  if (!body?.url) return toast.error("URL signée manquante");
  window.location.assign(String((body as { url?: string }).url));
}