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

import {
  makeCompaniesApi,
  searchCompanies,
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  removeCompany,
  bulkDeleteCompanies,
  listCompanyAddresses,
  listCompanyBankAccounts,
  listCompanyMemberships,
  createCompanyAddress,
  updateCompanyAddress,
  removeCompanyAddress,
  createCompanyBankAccount,
  updateCompanyBankAccount,
  removeCompanyBankAccount,
  createCompanyMembership,
  updateCompanyMembership,
  removeCompanyMembership,
  getCompanyWithDetails,
} from "@/features/companies/data/companies.repository";

describe("[DATA / Companies] companies.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createResourceApiMock.mockReturnValue(apiMock);
    listMock.mockResolvedValue({ data: [], total: 0 });
    getMock.mockResolvedValue({ id: "co1", name: "ACME" });
  });

  it("makeCompaniesApi() configures createResourceApi and user scope", () => {
    makeCompaniesApi("user-1");
    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("companies");
    expect(opts.searchColumns).toEqual(
      expect.arrayContaining(["name", "siren", "siret", "vat_number", "website", "email"]) 
    );
    expect(opts.defaultFilters).toEqual({ user_id: { op: "eq", value: "user-1" } });
    expect(opts.protectedColumns).toEqual(["user_id"]);
  });

  it("searchCompanies() maps result and passes params", async () => {
    listMock.mockResolvedValue({
      data: [
        { id: "1", name: "A", vat_number: "FR..." },
        { id: "2", name: "B", vat_number: null },
      ],
    });

    const out = await searchCompanies({ q: "a", limit: 5 }, "u1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 5,
        search: "a",
        sort: { column: "name", dir: "asc" },
      })
    );

    expect(out).toEqual([
      { id: "1", name: "A", vat_number: "FR..." },
      { id: "2", name: "B", vat_number: null },
    ]);
  });

  it("listCompanies() builds filters and returns rows+total", async () => {
    listMock.mockResolvedValue({ data: [{ id: "co1" }], total: 10 });

    const out = await listCompanies({
      search: "acme",
      hasVatNumber: true,
      hasWebsite: false,
      hasEmail: true,
      vatRegime: "normal" as const,
      dateFrom: "2026-01-01",
      dateTo: "2026-01-31",
      sort: { column: "name", dir: "asc" },
    }, "u1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: { column: "name", dir: "asc" },
        filters: expect.objectContaining({
          vat_regime: { op: "eq", value: "normal" },
          vat_number: { op: "neq", value: null },
          website: { op: "eq", value: null },
          email: { op: "neq", value: null },
          created_at: { op: "lte", value: "2026-01-31" },
        }),
      })
    );

    expect(out.total).toBe(10);
    expect(out.rows).toEqual([{ id: "co1" }]);
  });

  it("CRUD wrappers delegate to api", async () => {
    await getCompany("co1", "u");
    expect(getMock).toHaveBeenCalledWith("co1");

    await createCompany({ name: "X" } as Record<string, unknown>, "u");
    expect(createMock).toHaveBeenCalledWith({ name: "X" });

    await updateCompany("co1", { name: "Y" } as Record<string, unknown>, "u");
    expect(updateMock).toHaveBeenCalledWith("co1", { name: "Y" });

    await removeCompany("co1", "u");
    expect(removeMock).toHaveBeenCalledWith("co1");

    bulkDeleteMock.mockResolvedValue(2);
    const n = await bulkDeleteCompanies(["a", "b"], "u");
    expect(bulkDeleteMock).toHaveBeenCalledWith(["a", "b"]);
    expect(n).toBe(2);
  });

  it("child resources lists call list with filters", async () => {
    await listCompanyAddresses("co1");
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { company_id: { op: "eq", value: "co1" } } })
    );

    await listCompanyBankAccounts("co1");
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { company_id: { op: "eq", value: "co1" } } })
    );

    await listCompanyMemberships("co1");
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { company_id: { op: "eq", value: "co1" } } })
    );
  });

  it("child CRUD delegates to create/update/remove", async () => {
    await createCompanyAddress({ line1: "x" } as Record<string, unknown>);
    expect(createMock).toHaveBeenCalledWith({ line1: "x" });

    await updateCompanyAddress("a", { line1: "y" } as Record<string, unknown>);
    expect(updateMock).toHaveBeenCalledWith("a", { line1: "y" });

    await removeCompanyAddress("a");
    expect(removeMock).toHaveBeenCalledWith("a");

    await createCompanyBankAccount({ label: "L" } as Record<string, unknown>);
    expect(createMock).toHaveBeenCalledWith({ label: "L" });

    await updateCompanyBankAccount("b", { label: "M" } as Record<string, unknown>);
    expect(updateMock).toHaveBeenCalledWith("b", { label: "M" });

    await removeCompanyBankAccount("b");
    expect(removeMock).toHaveBeenCalledWith("b");

    await createCompanyMembership({ role: "admin" } as Record<string, unknown>);
    expect(createMock).toHaveBeenCalledWith({ role: "admin" });

    await updateCompanyMembership("m1", { role: "user" } as Record<string, unknown>);
    expect(updateMock).toHaveBeenCalledWith("m1", { role: "user" });

    await removeCompanyMembership("m1");
    expect(removeMock).toHaveBeenCalledWith("m1");
  });

  it("getCompanyWithDetails() aggregates sub resources", async () => {
    getMock.mockResolvedValue({ id: "co1", name: "ACME" });
    listMock
      .mockResolvedValueOnce({ data: [{ id: "a1" }] }) // addresses
      .mockResolvedValueOnce({ data: [{ id: "b1" }] }) // bank accounts
      .mockResolvedValueOnce({ data: [{ id: "m1" }] }); // memberships

    const out = await getCompanyWithDetails("co1", "u");
    expect(out.company).toEqual({ id: "co1", name: "ACME" });
    expect(out.addresses).toEqual([{ id: "a1" }]);
    expect(out.bank_accounts).toEqual([{ id: "b1" }]);
    expect(out.memberships).toEqual([{ id: "m1" }]);
  });
});

