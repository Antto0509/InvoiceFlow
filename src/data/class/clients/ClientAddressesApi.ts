import { ResourceApi } from "../ResourceApi";
import type {
  ClientAddress,
  ClientAddressListParams,
  ClientAddressSort,
} from "@/schemas/clients.schema";

/**
 * API CRUD pour les adresses clients (table)
 */
export class ClientAddressesApi extends ResourceApi<ClientAddress> {
  constructor(clientId?: string) {
    super({
      table: "client_addresses",
      select: "id, client_id, kind, line1, line2, postal_code, city, region, country, created_at, updated_at, client:clients(name)",
      sortableColumns: [
        "kind",
        "city",
        "postal_code",
        "region",
        "country",
        "created_at",
        "updated_at",
      ],
      searchColumns: ["line1", "city", "postal_code", "region", "country"],
      defaultFilters: clientId
        ? { client_id: { op: "eq", value: clientId } }
        : undefined,
    });
  }

  /**
   * Liste des adresses clients
   * @param params Paramètres de liste
   * @returns Liste des adresses clients
   */
  async listAddresses(params: Partial<ClientAddressListParams> = {}) {
    const {
      page = 1,
      pageSize = 20,
      search,
      kind,
      city,
      country,
      sort = { column: "created_at", dir: "asc" } as ClientAddressSort,
      signal,
      dateFrom,
      dateTo,
    } = params;

    const { data, total } = await this.list({
      page,
      pageSize,
      search,
      sort,
      signal,
      filters: {
        ...(kind ? { kind: { op: "eq", value: kind } } : {}),
        ...(city ? { city: { op: "ilike", value: city } } : {}),
        ...(country ? { country: { op: "eq", value: country } } : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    const rows = (data ?? []).map((a: ClientAddress & { client?: { name: string } }) => ({
      ...a,
      client_name: a.client?.name ?? null,
    }));

    return { rows, total };
  }
}
