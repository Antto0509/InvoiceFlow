import { createResourceApi } from "@/data/createResourceApi";
import type {
  Company,
  CompanyAddress,
  CompanyBankAccount,
  CompanyWithDetails,
  CompanyListParams,
} from "@/schemas/companies.schema";
import { SORTABLE_COMPANIES } from "@/lib/constants";


/* ---------------------------------- */
/*           Companies API            */
/* ---------------------------------- */

export const makeCompaniesApi = (userId?: string) =>
  createResourceApi<Company>({
    table: "companies",
    select:
      "*",
    sortableColumns: [...SORTABLE_COMPANIES],
    searchColumns: ["name", "siren", "siret", "vat_number", "website", "email"],
    defaultFilters: userId ? { user_id: { op: "eq", value: userId } } : undefined,
    protectedColumns: ["user_id"],
  });

/** Recherche rapide (autocomplete) */
export async function searchCompanies(
  { q, limit = 20, signal }: { q?: string; limit?: number; signal?: AbortSignal },
  userId?: string
): Promise<Array<{ id: string; name: string; vat_number?: string | null }>> {
  const api = makeCompaniesApi(userId);
  const { data } = await api.list({
    page: 1,
    pageSize: limit,
    search: q,
    sort: { column: "name", dir: "asc" },
    signal,
  });
  return data
    .filter(
      (c): c is Company & { id: string } =>
        typeof c.id === "string"
    )
    .map((c) => ({ id: c.id, name: c.name, vat_number: c.vat_number ?? null }));
}

/** Liste paginée avec filtres */
export async function listCompanies(params: Partial<CompanyListParams> = {}, userId?: string) {
  const {
    page = 1,
    pageSize = 20,
    search,
    hasVatNumber,
    hasWebsite,
    hasEmail,
    vatRegime,
    dateFrom,
    dateTo,
    sort = { column: "name", dir: "asc" as const },
    signal,
  } = params;

  const api = makeCompaniesApi(userId);

  const { data, total } = await api.list({
    page,
    pageSize,
    search,
    sort,
    signal,
    filters: {
      ...(vatRegime ? { vat_regime: { op: "eq", value: vatRegime } } : {}),
      ...(hasVatNumber != null
        ? hasVatNumber
          ? { vat_number: { op: "neq", value: null } }
          : { vat_number: { op: "eq", value: null } }
        : {}),
      ...(hasWebsite != null
        ? hasWebsite
          ? { website: { op: "neq", value: null } }
          : { website: { op: "eq", value: null } }
        : {}),
      ...(hasEmail != null
        ? hasEmail
          ? { email: { op: "neq", value: null } }
          : { email: { op: "eq", value: null } }
        : {}),
      ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
      ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      }
    });

  return { rows: data as Company[], total };
};

// CRUD Companies
export const getCompany = (id: string, userId?: string) => makeCompaniesApi(userId).get(id);
export const createCompany = (payload: Partial<Company>, userId?: string) =>
  makeCompaniesApi(userId).create(payload);
export const updateCompany = (id: string, payload: Partial<Company>, userId?: string) =>
  makeCompaniesApi(userId).update(id, payload);
export const removeCompany = (id: string, userId?: string) => makeCompaniesApi(userId).remove(id);
export const bulkDeleteCompanies = (ids: string[], userId?: string) =>
  makeCompaniesApi(userId).bulkDelete(ids);

/* ---------------------------------- */
/*   Company Addresses & Bank API     */
/* ---------------------------------- */

export const makeCompanyAddressesApi = () =>
  createResourceApi<CompanyAddress>({
    table: "company_addresses",
    select:
      "id, company_id, kind, line1, line2, postal_code, city, region, country, created_at, updated_at",
    // Pas de user_id sur cette table ? Si tu as un RLS par jointure côté DB, inutile ici.
    // Si tu as quand même un user_id en colonne : ajoute protectedColumns/defaultFilters
    sortableColumns: ["kind", "city", "country", "created_at", "updated_at"],
    searchColumns: ["line1", "line2", "city", "postal_code", "region", "country"],
  });

export const makeCompanyBankAccountsApi = () =>
  createResourceApi<CompanyBankAccount>({
    table: "company_bank_accounts",
    select: "id, company_id, label, iban, bic, display, created_at, updated_at",
    sortableColumns: ["label", "display", "created_at", "updated_at"],
    searchColumns: ["label", "iban", "bic"],
  });

// CRUD Addresses
export const listCompanyAddresses = (companyId: string) =>
  makeCompanyAddressesApi().list({
    page: 1,
    pageSize: 100,
    filters: { company_id: { op: "eq", value: companyId } },
    sort: { column: "created_at", dir: "asc" },
  });

export const createCompanyAddress = (payload: Partial<CompanyAddress>) =>
  makeCompanyAddressesApi().create(payload);
export const updateCompanyAddress = (
  id: string,
  payload: Partial<CompanyAddress>
) => makeCompanyAddressesApi().update(id, payload);
export const removeCompanyAddress = (id: string) =>
  makeCompanyAddressesApi().remove(id);

// CRUD Bank Accounts
export const listCompanyBankAccounts = (companyId: string) =>
  makeCompanyBankAccountsApi().list({
    page: 1,
    pageSize: 100,
    filters: { company_id: { op: "eq", value: companyId } },
    sort: { column: "created_at", dir: "asc" },
  });

export const createCompanyBankAccount = (
  payload: Partial<CompanyBankAccount>
) => makeCompanyBankAccountsApi().create(payload);

export const updateCompanyBankAccount = (
  id: string,
  payload: Partial<CompanyBankAccount>
) => makeCompanyBankAccountsApi().update(id, payload);

export const removeCompanyBankAccount = (id: string) =>
  makeCompanyBankAccountsApi().remove(id);

/* ---------------------------------- */
/*  Aggregation: company + détails    */
/* ---------------------------------- */

/**
 * Récupère une entreprise + adresses + comptes bancaires.
 * Remonte un objet typé `CompanyWithDetails`.
 */
export async function getCompanyWithDetails(
  id: string,
  userId?: string
): Promise<CompanyWithDetails> {
  const [company, { data: addresses }, { data: bankAccounts }] = await Promise.all([
    getCompany(id, userId),
    listCompanyAddresses(id),
    listCompanyBankAccounts(id),
  ]);

  return {
    company,
    addresses: addresses as CompanyAddress[],
    bank_accounts: bankAccounts as CompanyBankAccount[],
  };
}
