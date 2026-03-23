import { ResourceApi } from "../ResourceApi";
import type {
  ClientContact,
  ClientContactListParams,
  ClientContactSort,
} from "@/schemas/clients.schema";

export class ClientContactsApi extends ResourceApi<ClientContact> {
  constructor(clientId?: string) {
    super({
      table: "client_contacts",
      select: "id, client_id, full_name, email, phone, role, created_at, updated_at, client:clients(name)",
      sortableColumns: [
        "full_name",
        "email",
        "phone",
        "role",
        "created_at",
        "updated_at",
      ],
      searchColumns: ["full_name", "email", "phone", "role"],
      defaultFilters: clientId
        ? { client_id: { op: "eq", value: clientId } }
        : undefined,
    });
  }

  /**
   * Liste des contacts clients
   * @param params Paramètres de liste
   * @returns Liste des contacts clients
   */
  async listContacts(params: Partial<ClientContactListParams> = {}) {
    const {
      page = 1,
      pageSize = 20,
      search,
      role,
      hasEmail,
      sort = { column: "created_at", dir: "asc" } as ClientContactSort,
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
        ...(role ? { role: { op: "ilike", value: role } } : {}),
        ...(hasEmail != null
          ? hasEmail
            ? { email: { op: "neq", value: null } }
            : { email: { op: "eq", value: null } }
          : {}),
        ...(dateFrom ? { created_at: { op: "gte", value: dateFrom } } : {}),
        ...(dateTo ? { created_at: { op: "lte", value: dateTo } } : {}),
      },
    });

    const rows = (data ?? []).map((c: ClientContact & { client?: { name: string } }) => ({
      ...c,
      client_name: c.client?.name ?? null,
    }));

    return { rows, total };
  }
}
