import { ResourceApi } from "../ResourceApi";
import type {
  Client,
  ClientListParams
} from "@/schemas/clients.schema";
import { SORTABLE_CLIENTS } from "@/lib/constants";

/**
 * API CRUD pour les clients (table)
 */
export class ClientsApi extends ResourceApi<Client> {
  constructor(companyId?: string) {
    super({
      table: "clients",
      select: "*",
      sortableColumns: [...SORTABLE_CLIENTS],
      searchColumns: ["name", "email", "company"],
      defaultFilters: companyId
        ? { company_id: { op: "eq", value: companyId } }
        : undefined,
    });
  }

  /**
   * Liste des clients
   * @param params Paramètres de liste
   * @returns Liste des clients
   */
  listClients(params: Partial<ClientListParams> = {}) {
    const {
      page = 1,
      pageSize = 20,
      search,
      name,
      hasEmail,
      sort = { column: "name", dir: "asc" },
      signal,
      dateFrom,
      dateTo,
    } = params;

    return this.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(name ? { name: { op: "ilike", value: name } } : {}),
        ...(hasEmail != null
          ? hasEmail
            ? { email: { op: "neq", value: null } }
            : { email: { op: "eq", value: null } }
          : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    }) as Promise<{ data: Partial<Client>[]; total: number }>;
  }

  /**
   * Recherche des clients
   * @param q Terme de recherche
   * @param limit Nombre maximum de résultats
   * @returns Liste des clients correspondant à la recherche
   */
  async search(q?: string, limit = 20) {
    const { data } = await this.list({
      page: 1,
      pageSize: limit,
      search: q,
      sort: { column: "name", dir: "asc" },
    });

    return (data ?? []).map((c) => ({
      id: c.id!,
      name: c.name,
      email: c.email ?? null,
    }));
  }
}
