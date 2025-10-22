import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SortSpec } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value || 0);
  } catch {
    const n = Number.isFinite(value) ? Number(value) : 0;
    return `${n.toFixed(2)} ${currency}`;
  }
}

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

/** Échappe % et _ pour LIKE/ILIKE. */
export function escapeLike(input: string) {
  return input.replace(/[%_]/g, (m) => `\\${m}`);
}

/** Construit un OR ILIKE multi-colonnes. */
export function buildOrIlike(columns: string[], raw: string) {
  const term = escapeLike(raw.trim().replaceAll(",", " "));
  if (!term) return undefined;
  const pattern = `%${term}%`;
  return columns.map((c) => `${c}.ilike.${pattern}`).join(",");
}

/** Valide une spec de tri contre la whitelist. */
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

export function stripGenerated<T extends Record<string, unknown>>(row: T) {
  const { total: _total, subtotal: _subtotal, tax: _tax, ...rest } = row;
  void _total;
  void _subtotal;
  void _tax;
  return rest as Omit<T, "total" | "subtotal" | "tax">;
}

export function stripGeneratedMany<T extends Record<string, unknown>>(rows: T[]) {
  return rows.map(stripGenerated);
}