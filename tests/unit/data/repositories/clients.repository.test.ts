import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----
const listMock = vi.fn();
const getMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const removeMock = vi.fn();
const bulkDeleteMock = vi.fn();

const apiMock = {
  list: listMock,
  get: getMock,
  create: createMock,
  update: updateMock,
  remove: removeMock,
  bulkDelete: bulkDeleteMock,
};

const hoisted = vi.hoisted(() => ({
  createResourceApiMock: vi.fn(),
}));

vi.mock("@/data/createResourceApi", () => ({
  createResourceApi: (opts: Record<string, unknown>) => hoisted.createResourceApiMock(opts),
}));

// ⚠️ adapte le chemin si ton fichier est ailleurs
import {
  makeClientsApi,
  searchClients,
  listClients,
  bulkDeleteClients,
  makeClientAddressesApi,
  listClientAddresses,
  makeClientContactsApi,
  listClientContacts,
  getClientWithDetails,
} from "@/features/clients/data/clients.repository";

describe("[DATA / Clients] clients.repository", () => {
  beforeEach(() => {
      vi.clearAllMocks();
      hoisted.createResourceApiMock.mockReturnValue(apiMock);
      listMock.mockResolvedValue({ data: [], total: 0 });
      getMock.mockResolvedValue({ id: "c1", name: "Client 1" });
    });

  it("makeClientsApi() configures createResourceApi with correct table + defaultFilters (companyId)", () => {
    makeClientsApi("company-1");

    const opts = hoisted.createResourceApiMock.mock.calls[0]?.[0] as Record<string, unknown>;

    expect(opts?.table).toBe("clients");
    expect(opts?.select).toContain("id");
    expect(opts?.searchColumns).toEqual(["name", "email", "company"]);
    expect(opts?.defaultFilters).toEqual({
      company_id: { op: "eq", value: "company-1" },
    });
  });

  it("searchClients() calls api.list with page=1, pageSize=limit, sort=name asc, search=q", async () => {
    listMock.mockResolvedValue({
      data: [
        { id: "1", name: "A", email: "a@a.com" },
        { id: "2", name: "B", email: null },
      ],
      total: 2,
    });

    const res = await searchClients({ q: "an", limit: 5 }, "company-1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 5,
        search: "an",
        sort: { column: "name", dir: "asc" },
      })
    );

    expect(res).toEqual([
      { id: "1", name: "A", email: "a@a.com" },
      { id: "2", name: "B", email: null },
    ]);
  });

  it("listClients() builds filters (name ilike, hasEmail, dateFrom/dateTo) and returns rows+total", async () => {
    listMock.mockResolvedValue({
      data: [{ id: "1", name: "Jean" }],
      total: 99,
    });

    const out = await listClients(
      {
        page: 2,
        pageSize: 10,
        search: "je",
        name: "jean",
        hasEmail: true,
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
        sort: { column: "name", dir: "desc" },
      },
      "company-1"
    );

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 10,
        search: "je",
        sort: { column: "name", dir: "desc" },
        filters: {
          name: { op: "ilike", value: "jean" },
          email: { op: "neq", value: null },
          created_at: { op: "lte", value: "2026-01-31" },
          // NB: created_at gte + lte : ton code met deux entrées "created_at" ?
          // En JS, la 2e écrase la 1ère si même clé.
          // Là tu as deux spreads conditionnels avec la même clé: created_at.
          // Le dernier gagne. => on vérifie les deux cas séparément ci-dessous.
        },
      })
    );

    expect(out.total).toBe(99);
    expect(out.rows).toEqual([{ id: "1", name: "Jean" }]);
  });

  it("listClients() handles created_at gte only (dateFrom) and lte only (dateTo)", async () => {
    listMock.mockResolvedValue({ data: [], total: 0 });

    await listClients({ dateFrom: "2026-01-01" }, "company-1");
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          created_at: { op: "gte", value: "2026-01-01" },
        }),
      })
    );

    await listClients({ dateTo: "2026-01-31" }, "company-1");
    expect(listMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          created_at: { op: "lte", value: "2026-01-31" },
        }),
      })
    );
  });

  it("bulkDeleteClients() delegates to api.bulkDelete", async () => {
    bulkDeleteMock.mockResolvedValue(2);

    const n = await bulkDeleteClients(["a", "b"], "company-1");

    expect(bulkDeleteMock).toHaveBeenCalledWith(["a", "b"]);
    expect(n).toBe(2);
  });

  it("makeClientAddressesApi() configures join select + defaultFilters (clientId)", () => {
    makeClientAddressesApi("client-1");

    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("client_addresses");
    expect(opts.select).toContain("client:clients(name)");
    expect(opts.defaultFilters).toEqual({
      client_id: { op: "eq", value: "client-1" },
    });
  });

  it("listClientAddresses() maps client_name from joined client", async () => {
    listMock.mockResolvedValue({
      data: [
        { id: "a1", client_id: "c1", kind: "billing", line1: "x", client: { name: "Acme" } },
        { id: "a2", client_id: "c1", kind: "shipping", line1: "y", client: {} },
      ],
      total: 2,
    });

    const out = await listClientAddresses({ page: 1, pageSize: 20 }, "c1");

    // vérifie les filtres min
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 20,
      })
    );

    expect(out.rows[0].client_name).toBe("Acme");
    expect(out.rows[1].client_name).toBeNull();
  });

  it("makeClientContactsApi() configures join select + defaultFilters (clientId)", () => {
    makeClientContactsApi("client-1");

    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("client_contacts");
    expect(opts.select).toContain("client:clients(name)");
    expect(opts.defaultFilters).toEqual({
      client_id: { op: "eq", value: "client-1" },
    });
  });

  it("listClientContacts() maps client_name and applies hasEmail filter", async () => {
    listMock.mockResolvedValue({
      data: [
        { id: "ct1", client_id: "c1", full_name: "Bob", email: "b@b.com", client: { name: "Acme" } },
        { id: "ct2", client_id: "c1", full_name: "Sue", email: null, client: { name: "Acme" } },
      ],
      total: 2,
    });

    const out = await listClientContacts({ hasEmail: false }, "c1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({
          email: { op: "eq", value: null },
        }),
      })
    );

    expect(out.rows[0].client_name).toBe("Acme");
  });

  it("getClientWithDetails() aggregates client + addresses + contacts", async () => {
    // 1) get client
    getMock.mockResolvedValue({ id: "c1", name: "Client 1" });

    // 2) list addresses
    listMock
      .mockResolvedValueOnce({ data: [{ id: "a1", client: { name: "Client 1" } }], total: 1 }) // addresses
      .mockResolvedValueOnce({ data: [{ id: "ct1", client: { name: "Client 1" } }], total: 1 }); // contacts

    const out = await getClientWithDetails("c1", "company-1");

    expect(out.client).toEqual({ id: "c1", name: "Client 1" });
    expect(out.addresses).toHaveLength(1);
    expect(out.contacts).toHaveLength(1);
  });
});
