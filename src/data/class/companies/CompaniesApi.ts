import { ResourceApi } from "../ResourceApi";
import type { Company } from "@/schemas/companies.schema";
import { SORTABLE_COMPANIES } from "@/lib/constants";
import type { FilterOps } from "@/lib/types";

/**
 * API dédiée à la table `companies`
 */
export class CompaniesApi extends ResourceApi<Company> {
  constructor(userId?: string) {
    super({
      table: "companies",
      select: "*",
      sortableColumns: [...SORTABLE_COMPANIES],
      searchColumns: [
        "name",
        "siren",
        "siret",
        "vat_number",
        "website",
        "email",
      ],
      defaultFilters: userId
        ? { user_id: { op: "eq", value: userId } }
        : undefined,
      protectedColumns: ["user_id"],
    });
  }

  /* ------------------------------------------------------------------ */
  /*                             Overrides                              */
  /* ------------------------------------------------------------------ */

  /**
   * Surcharge du create
   * (ex: forcer le `user_id` côté serveur plus tard)
   * @param payload Données de création
   * @returns Company créée
   */
  override async create(payload: Partial<Company>) {
    return super.create(payload);
  }

  /* ------------------------------------------------------------------ */
  /*                        Méthodes métier                             */
  /* ------------------------------------------------------------------ */

  /**
   * Recherche rapide pour autocomplete
   * @param q Terme de recherche
   * @param limit Nombre maximum de résultats
   * @param signal Signal d'annulation
   * @returns Liste des companies trouvées
   */
  async search(
    q?: string,
    limit = 20,
    signal?: AbortSignal
  ): Promise<Array<{ id: string; name: string; vat_number?: string | null }>> {
    const { data } = await this.list({
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
      .map((c) => ({
        id: c.id,
        name: c.name,
        vat_number: c.vat_number ?? null,
      }));
  }

  /**
   * Liste paginée avancée avec filtres métier
   * @param params Paramètres de la liste
   * @returns Liste des companies avec total
   */
  async listCompanies(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    hasVatNumber?: boolean;
    hasWebsite?: boolean;
    hasEmail?: boolean;
    vatRegime?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: { column: string; dir: "asc" | "desc" };
    signal?: AbortSignal;
  }) {
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
      sort = { column: "name", dir: "asc" },
      signal,
    } = params;

    const filters: Record<string, FilterOps> = {
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
    };

    return this.list({
      page,
      pageSize,
      search,
      sort,
      filters,
      signal,
    });
  }
}
