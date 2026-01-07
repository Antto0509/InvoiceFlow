import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FilterOps, SortSpec } from "@/lib/types";
import { format, Locale } from "date-fns";
import { toast } from "sonner";
import { Company } from "@/features/companies/schemas/companies.schema";
import { Filterable } from "@/lib/types";
import { DocumentKind, DocumentStatus } from "@/features/documents";
import { MAX_REQ, WINDOW_MS } from "./constants";

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

export function formatDateYMD(dateYmd: string | null | undefined, locale?: Locale): string {
  if (!dateYmd) return "";
  // YYYY-MM-DD -> format fr
  const [y, m, d] = dateYmd.split("-").map((s) => Number(s));
  if (!y || !m || !d) return dateYmd;
  const jsDate = new Date(Date.UTC(y, m - 1, d));
  return format(jsDate, "dd/MM/yyyy", { locale });
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
export function labelDocKind(kind: DocumentKind | string) {
  switch (kind) {
    case "invoice":
      return "Facture";
    case "credit_note":
      return "Avoir";
    case "quote":
      return "Devis";
    case "proforma":
      return "Proforma";
    default:
      return "Document";
  }
}

/** Map centrale des statuts possibles par type de document */
export const DOC_STATUS_BY_KIND: Record<
  DocumentKind, Partial<Record<DocumentStatus, string>>
> = {
  invoice: {
    draft: "Brouillon",
    sent: "Envoyée",
    paid: "Payée",
    overdue: "En retard",
    void: "Annulée",
  },
  credit_note: {
    draft: "Brouillon",
    sent: "Envoyée",
    void: "Annulée",
  },
  quote: {
    draft: "Brouillon",
    sent: "Envoyé",
    accepted: "Accepté",
    declined: "Refusé",
    expired: "Expiré",
    void: "Annulé",
  },
  proforma: {
    draft: "Brouillon",
    sent: "Envoyée",
    void: "Annulée",
  },
};

/** 
 * Formate le statut d'un document selon son type.
 * @param kind Type de document
 * @param status Statut du document
 * @returns Chaîne formatée
 */
export function labelDocStatus(kind: DocumentKind | string, status: DocumentStatus | string) {
  return (DOC_STATUS_BY_KIND as Record<string, Partial<Record<string, string>>>)[kind]?.[status] ?? status;
}

/** 
 * Obtient la variante de bouton selon le statut du document.
 * @param status Statut du document
 * @returns Variante de bouton
 */
export function getDocStatusVariant(status: DocumentKind | string) {
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
 * @param force Forcer la regénération du PDF
 * @returns Promise résolue une fois l'ouverture initiée
 */
export async function downloadDocumentPdf(id: string, force = false) {
  const q = new URLSearchParams({ redirect: "0", ttl: "300" });
  if (force) q.set("force", "1");

  const res = await fetch(`/api/documents/${id}/pdf?` + q.toString());

  type PdfResponse = { url?: string } | Record<string, unknown>;

  let body: PdfResponse = {};
  try {
    body = (await res.json()) as PdfResponse;
  } catch {
    body = {};
  }

  if (!res.ok) {
    toast.error("Échec du téléchargement du PDF");
    return;
  }

  const url = (body as { url?: string }).url;
  if (!url || typeof url !== "string") {
    toast.error("URL signée manquante");
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

/** 
 * Vérifie si une valeur est un nombre fini.
 * @param v Valeur à vérifier
 * @returns Vrai si c'est un nombre fini, sinon faux
 */
export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** 
 * Arrondit un nombre à 2 décimales.
 * @param n Nombre à arrondir
 * @returns Nombre arrondi
 */
export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** 
 * Affiche un message de succès toasté pour une action sur un document.
 * @param kind Type de document
 * @param action Action réalisée
 */
export function toastSuccessMessage(kind: string, action: string) {
  const kindLabel = kind === "invoice"
    ? "Facture"
    : kind === "credit_note"
    ? "Note de crédit"
    : kind === "quote"
    ? "Devis"
    : kind === "proforma"
    ? "Facture proforma"
    : "Document";

  toast.success(`${kindLabel} ${action} avec succès`);
}

/** 
 * Valide une adresse email.
 * @param email Adresse email à valider
 * @returns Vrai si l'email est valide, sinon faux
 */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** 
 * Extrait l'adresse IP d'une requête.
 * @param req Requête entrante
 * @returns Adresse IP sous forme de chaîne
 */
export function getIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** 
 * Applique une limitation de débit basée sur l'adresse IP.
 */
const hits = new Map<string, number[]>(); // ip -> timestamps

/** 
 * Applique une limitation de débit basée sur l'adresse IP.
 * @param ip Adresse IP du client
 * @returns Objet avec le statut de la limitation
 */
export function rateLimit(ip: string) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const prev = hits.get(ip) ?? [];
  const next = prev.filter((t) => t > windowStart);
  next.push(now);
  hits.set(ip, next);

  const remaining = Math.max(0, MAX_REQ - next.length);
  const allowed = next.length <= MAX_REQ;

  const retryAfterSec = allowed ? 0 : Math.ceil((next[0] - windowStart) / 1000);

  return { allowed, remaining, retryAfterSec };
}