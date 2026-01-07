import { createResourceApi } from "@/data/createResourceApi";
import { Currency } from "@/schemas/currencies.schema";

/** API pour les devises */
const makeCurrenciesApi = () =>
  createResourceApi<Currency>({
    table: "currencies",
    select: "*",
    sortableColumns: ["code", "name", "is_active", "created_at", "updated_at"],
    searchColumns: ["code", "name", "symbol"],
    primaryKey: "code",
    conflictTarget: "code",
  });

export const currenciesApi = makeCurrenciesApi();

/** Recherche de devises */
export async function searchCurrencies(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal }
): Promise<Array<{ code: string; name: string; symbol: string }>> {
    const api = makeCurrenciesApi();
    const { data } = await api.list({
        page: 1,
        pageSize: limit,
        search: q,
        sort: { column: "code", dir: "asc" },
        signal,
    });
    return data.map((c) => ({ code: c.code, name: c.name, symbol: c.symbol }));
}

/** Liste paginée de toutes les devises */
export async function listCurrencies() {
  const api = makeCurrenciesApi();
  const { data } = await api.list({
    page: 1,
    pageSize: 100,
    sort: { column: "code", dir: "asc" },
  });
  return data;
}

// CRUD simple
export const getCurrency = (code: string) => makeCurrenciesApi().get(code);
export const createCurrency = (currency: Omit<Currency, "created_at" | "updated_at">) =>
  makeCurrenciesApi().create(currency);
export const updateCurrency = (code: string, currency: Partial<Omit<Currency, "code" | "created_at" | "updated_at">>) =>
  makeCurrenciesApi().update(code, currency);
export const deleteCurrency = (code: string) => makeCurrenciesApi().remove(code);
export const bulkDeleteCurrencies = (codes: string[]) => makeCurrenciesApi().bulkDelete(codes);