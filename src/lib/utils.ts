import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { toast } from "sonner";
import { NextResponse } from "next/server";
import { createClientServer } from "@/data/supabase";

import type { Locale } from "date-fns";
import type { Company } from "@/schemas/companies.schema";
import type { DocumentKind, DocumentStatus } from "@/features/documents";
import type { FilterOps, Filterable, SortSpec } from "@/lib/types";

import { MAX_REQ, WINDOW_MS } from "./constants";

// -------------------------------------------------------------------------------------
// Tailwind / classes utilitaires
// -------------------------------------------------------------------------------------

/**
 * Combine des classes CSS avec clsx et tailwind-merge.
 * @param inputs Classes CSS à combiner.
 * @return Chaîne de classes combinées.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -------------------------------------------------------------------------------------
// Helpers génériques
// -------------------------------------------------------------------------------------

/**
 * Crée une réponse d'erreur utilisateur standardisée.
 * @param status Statut HTTP de la réponse.
 * @param code Code d'erreur interne.
 * @param message Message d'erreur destiné à l'utilisateur.
 * @param traceId Identifiant de trace pour le suivi des erreurs.
 * @returns Réponse JSON standardisée.
 */
export function userError(
  status: number,
  code: string,
  message: string,
  traceId: string
) {
  return NextResponse.json(
    { ok: false, error: { code, message, traceId } },
    { status }
  );
}

/**
 * Parse de manière sécurisée une chaîne JSON.
 * @param input Chaîne JSON à parser.
 * @returns Objet parsé ou chaîne d'origine.
 */
export function safeJson<T = unknown>(input: string): T | string {
  try {
    return JSON.parse(input) as T;
  } catch {
    return input;
  }
}

/**
 * Génère un UUID sécurisé, ou un UUID nul en cas d'échec.
 * @return UUID sous forme de chaîne.
 */
export function safeRandomUUID(): string {
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
 * Vérifie si une valeur est un nombre fini.
 * @param v Valeur à vérifier.
 * @return true si c'est un nombre fini, false sinon.
 */
export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Arrondit un nombre à 2 décimales.
 * @param n Nombre à arrondir.
 * @return Nombre arrondi.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Vérifie si une URL est absolue.
 * @param url URL à vérifier.
 * @return true si l'URL est absolue, false sinon.
 */
export function isAbsoluteUrl(url?: string | null) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Vérifie si une valeur est un enregistrement (objet simple).
 * @param value Valeur à vérifier.
 * @returns true si c'est un enregistrement, false sinon.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Extrait un traceId d'une réponse d'erreur Brevo.
 * @param data Données de la réponse d'erreur.
 * @returns TraceId ou null s'il n'existe pas.
 */
export function extractTraceId(data: unknown): string | null {
  if (!isRecord(data)) return null;

  const error = isRecord(data.error) ? data.error : undefined;
  const details = isRecord(data.details) ? data.details : undefined;

  const tid =
    (typeof error?.traceId === "string" ? error.traceId : undefined) ??
    (typeof data.traceId === "string" ? data.traceId : undefined) ??
    (typeof details?.traceId === "string" ? details.traceId : undefined);

  return tid ?? null;
}

/**
 * Extrait un message d'erreur d'une réponse d'erreur Brevo.
 * @param data Données de la réponse d'erreur.
 * @returns Message d'erreur ou null s'il n'existe pas.
 */
export function extractErrorMessage(data: unknown): string | null {
  if (!isRecord(data)) return null;

  const error = isRecord(data.error) ? data.error : undefined;
  const details = isRecord(data.details) ? data.details : undefined;

  // cas classiques
  const raw =
    (typeof error?.message === "string" ? error.message : undefined) ??
    (typeof data.message === "string" ? data.message : undefined) ??
    (typeof data.error === "string" ? data.error : undefined) ??
    (typeof details?.message === "string" ? details.message : undefined) ??
    data.details;

  if (raw === undefined || raw === null || raw === "") return null;

  // Si c'est déjà une string => parfait
  if (typeof raw === "string") return raw;

  // Si c'est un objet => stringify lisible (et pas [object Object])
  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

// -------------------------------------------------------------------------------------
// Dates
// -------------------------------------------------------------------------------------

/**
 * Formate une date en toute sécurité.
 * @param date Date à formater.
 * @param formatStr Chaîne de formatage date-fns.
 * @param locale Locale optionnelle pour le formatage.
 * @return Date formatée ou "–".
 */
export function formatDateSafe(
  date: string | Date | null | undefined,
  formatStr: string,
  locale?: Locale
): string {
  if (!date) return "–";

  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, formatStr, { locale });
  } catch {
    return "–";
  }
}

/**
 * Formate une date YYYY-MM-DD en dd/MM/yyyy.
 * @param dateYmd Date au format YYYY-MM-DD.
 * @param locale Locale optionnelle pour le formatage.
 * @return Date formatée ou chaîne vide.
 */
export function formatDateYMD(dateYmd: string | null | undefined, locale?: Locale): string {
  if (!dateYmd) return "";

  const [y, m, d] = dateYmd.split("-").map((s) => Number(s));
  if (!y || !m || !d) return dateYmd;

  const jsDate = new Date(Date.UTC(y, m - 1, d));
  return format(jsDate, "dd/MM/yyyy", { locale });
}

// -------------------------------------------------------------------------------------
// Monétaire
// -------------------------------------------------------------------------------------

/**
 * Formate une valeur monétaire selon la locale et la devise.
 * @param value Valeur monétaire.
 * @param currency Devise (ex: "EUR", "USD").
 * @return Valeur formatée.
 */
export function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value || 0);
  } catch {
    const n = Number.isFinite(value) ? Number(value) : 0;
    return `${n.toFixed(2)} ${currency}`;
  }
}

// -------------------------------------------------------------------------------------
// Helpers PostgREST / filtrage Supabase
// -------------------------------------------------------------------------------------

/**
 * Échappe % et _ pour LIKE/ILIKE.
 * @param input Terme à échapper.
 * @return Terme échappé.
 */
function escapeLike(input: string): string {
  return input.replace(/[%_]/g, (m) => `\\${m}`);
}

/**
 * Construit un OR ILIKE multi-colonnes.
 * @param columns Colonnes à rechercher.
 * @param raw Terme de recherche brut.
 * @return Filtre ILIKE ou undefined si le terme est vide.
 */
export function buildOrIlike(columns: string[], raw: string): string | undefined {
  const term = escapeLike(raw.trim().replaceAll(",", " "));
  if (!term) return undefined;

  const pattern = `%${term}%`;
  return columns.map((c) => `${c}.ilike.${pattern}`).join(",");
}

/**
 * Valide une spec de tri contre la whitelist.
 * @param sort Spec de tri.
 * @param whitelist Colonnes autorisées.
 * @return Spec de tri validée ou undefined.
 */
export function ensureSortable(
  sort?: SortSpec,
  whitelist: string[] = []
): SortSpec | undefined {
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
 * Applique des filtres PostgREST-like à une requête.
 * @param req Requête à filtrer.
 * @param filters Dictionnaire de filtres à appliquer.
 * @return Requête filtrée.
 */
export function applyFilters<TReq>(
  req: TReq,
  filters?: Record<string, FilterOps | undefined>
): TReq {
  if (!filters) return req;

  // Travail sur une vue typée de la requête pour pouvoir chaîner les méthodes.
  let r = req as unknown as Filterable<TReq>;

  for (const [col, spec] of Object.entries(filters)) {
    if (!spec) continue;

    const { op, value } = spec as FilterOps & { value: unknown };
    if (value === undefined || value === null || value === "") continue;

    switch (op) {
      case "eq":
        r = r.eq(col, value);
        break;
      case "neq":
        r = r.neq(col, value);
        break;
      case "gt":
        r = r.gt(col, value);
        break;
      case "gte":
        r = r.gte(col, value);
        break;
      case "lt":
        r = r.lt(col, value);
        break;
      case "lte":
        r = r.lte(col, value);
        break;
      case "ilike":
        r = r.ilike(col, `%${escapeLike(String(value))}%`);
        break;
      case "in":
        r = r["in"](col, value as unknown[]);
        break;
    }
  }

  return r as unknown as TReq;
}

// -------------------------------------------------------------------------------------
// Helpers d'objets (cleanup)
// -------------------------------------------------------------------------------------

/**
 * Supprime les champs générés (total, subtotal, tax) d'une ligne d'objet.
 * @param row Ligne d'objet.
 * @return Ligne nettoyée.
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
 * @param rows Lignes d'objet.
 * @return Lignes nettoyées.
 */
export function stripGeneratedMany<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map(stripGenerated);
}

/**
 * Supprime les colonnes protégées d'un objet (mutation in-place).
 * @param input Objet à nettoyer.
 * @param protectedColumns Colonnes à supprimer.
 * @return L'objet nettoyé.
 */
export function stripProtected(
  input: Record<string, unknown>,
  protectedColumns?: string[]
) {
  const protectedCols = protectedColumns ?? [];
  for (const col of protectedCols) delete input[col];
  return input;
}

// -------------------------------------------------------------------------------------
// Formatters métier : entreprises / adresses / documents
// -------------------------------------------------------------------------------------

/**
 * Formate le régime de TVA d'une entreprise.
 * @param v Régime de TVA.
 * @return Libellé du régime de TVA.
 */
export function fmtVatRegime(v?: Company["vat_regime"] | null): string {
  if (!v) return "—";

  return v === "normal"
    ? "Régime normal"
    : v === "franchise_293B"
    ? "Franchise en base (art. 293 B)"
    : "Autre";
}

/**
 * Formate le type d'adresse.
 * @param kind Type d'adresse.
 * @return Libellé du type d'adresse.
 */
export function labelAddressKind(kind: string): string {
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
 * @param kind Type de document.
 * @return Libellé du type de document.
 */
export function labelDocKind(kind: DocumentKind | string): string {
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

/**
 * Map centrale des statuts possibles par type de document.
 * Utilisé pour le labelling.
 * 
 * DocumentKind -> DocumentStatus -> Label
 */
export const DOC_STATUS_BY_KIND: Record<
  DocumentKind,
  Partial<Record<DocumentStatus, string>>
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
 * @param kind Type de document.
 * @param status Statut du document.
 * @return Libellé du statut.
 */
export function labelDocStatus(
  kind: DocumentKind | string,
  status: DocumentStatus | string
): string {
  return (DOC_STATUS_BY_KIND as Record<string, Partial<Record<string, string>>>)[kind]?.[status] ?? status;
}

/**
 * Obtient la variante de bouton selon le statut du document.
 * @param status Statut du document.
 * @return "default" | "destructive" | "secondary" | "outline"
 */
export function getDocStatusVariant(
  status: DocumentStatus | string
): "default" | "destructive" | "secondary" | "outline" {
  const statusVariant: Record<string, "default" | "destructive" | "secondary" | "outline"> =
    {
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
 * @param id ID du document.
 * @param force Force le re-génération du PDF.
 * @return void
 */
export async function downloadDocumentPdf(id: string, force = false): Promise<void> {
  const q = new URLSearchParams({ redirect: "0", ttl: "300" });
  if (force) q.set("force", "1");

  const res = await fetch(`/api/documents/${id}/pdf?${q.toString()}`);

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
 * Affiche un message de succès toasté pour une action sur un document.
 * @param kind Type de document.
 * @param action Action réalisée.
 * @returns void
 */
export function toastSuccessMessage(kind: string, action: string): void {
  const kindLabel =
    kind === "invoice"
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

// -------------------------------------------------------------------------------------
// Emails
// -------------------------------------------------------------------------------------

/**
 * Valide une adresse email.
 * @param email Adresse email à valider.
 * @return true si l'email est valide, false sinon.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Met à jour un log d'email de manière sécurisée.
 * @param supabase Instance Supabase côté serveur.
 * @param emailLogId ID du log d'email à mettre à jour.
 * @param update Données de mise à jour.
 * @param fallback Données de repli en cas d'erreur (ex: uniquement le statut).
 * @returns void
 */
export async function safeUpdateEmailLog(
  supabase: ReturnType<typeof createClientServer>,
  emailLogId: string,
  update: Record<string, unknown>,
  fallback: Record<string, unknown> = {}
) {
  const { error } = await supabase.from("email_logs").update(update).eq("id", emailLogId);
  if (!error) return;

  console.error("[InvoiceFlow][EmailLog] safe_update_failed", {
    emailLogId,
    update,
    error,
  });

  // fallback minimal (ex: status seulement) si colonnes inconnues
  if (Object.keys(fallback).length) {
    await supabase.from("email_logs").update(fallback).eq("id", emailLogId);
  }
}

// -------------------------------------------------------------------------------------
// Réseau / IP / Rate limiting
// -------------------------------------------------------------------------------------

/**
 * Extrait l'adresse IP d'une requête.
 * @param req Requête entrante.
 * @return L'adresse IP du client.
 */
export function getIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();

  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Store in-memory des hits par IP.
 * ip -> timestamps (ms)
 */
const hits = new Map<string, number[]>();

/**
 * Applique une limitation de débit basée sur l'adresse IP.
 * @param ip Adresse IP du client.
 * @return Un objet indiquant si la requête est autorisée, le nombre de requêtes restantes, et le temps d'attente avant de réessayer si la limite est dépassée.
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


// -------------------------------------------------------------------------------------
// Helpers Brevo
// -------------------------------------------------------------------------------------

/**
 * Normalise une erreur Brevo en un format standardisé.
 * @param err Erreur à normaliser.
 * @returns Objet contenant le statut HTTP, le message et la charge utile de l'erreur.
 */
export function normalizeBrevoError(err: unknown): {
  status?: number;
  message: string;
  payload?: unknown;
} {
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    // ton wrapper BrevoApiError: { status, path, payload, message }
    if (typeof anyErr.status === "number") {
      return {
        status: anyErr.status,
        message: (anyErr.message as string) ?? "Brevo API error",
        payload: anyErr.payload,
      };
    }
    // fetch-like / generic
    if (typeof anyErr.message === "string") {
      return { message: anyErr.message, payload: anyErr };
    }
  }
  return { message: "Unknown error", payload: err };
}

/**
 * Mappe un statut d'erreur Brevo à un message utilisateur.
 * @param status Statut HTTP de l'erreur Brevo.
 * @returns Objet contenant le statut HTTP, le code d'erreur et le message utilisateur.
 */
export function mapBrevoToUserMessage(status?: number) {
  // Messages courts + actionnables, sans jargon
  switch (status) {
    case 400:
      return {
        http: 400,
        code: "EMAIL_INVALID",
        message:
          "Impossible d’envoyer l’email : certaines informations sont invalides (destinataire, expéditeur ou pièce jointe).",
      };
    case 401:
    case 403:
      return {
        http: 502,
        code: "EMAIL_PROVIDER_AUTH",
        message:
          "Le service d’envoi d’emails est mal configuré. Réessaie plus tard ou contacte le support.",
      };
    case 404:
      return {
        http: 502,
        code: "EMAIL_PROVIDER_NOT_FOUND",
        message:
          "Le service d’envoi d’emails ne répond pas correctement. Réessaie plus tard.",
      };
    case 408:
    case 504:
      return {
        http: 504,
        code: "EMAIL_PROVIDER_TIMEOUT",
        message:
          "Le service d’envoi d’emails met trop de temps à répondre. Réessaie dans quelques minutes.",
      };
    case 429:
      return {
        http: 429,
        code: "EMAIL_RATE_LIMIT",
        message:
          "Trop de tentatives d’envoi en peu de temps. Attends un moment puis réessaie.",
      };
    default:
      if (status && status >= 500) {
        return {
          http: 502,
          code: "EMAIL_PROVIDER_DOWN",
          message:
            "Le service d’envoi d’emails a un souci temporaire. Réessaie plus tard.",
        };
      }
      return {
        http: 500,
        code: "EMAIL_SEND_FAILED",
        message:
          "L’envoi de l’email a échoué. Réessaie, et si ça persiste contacte le support.",
      };
  }
}
