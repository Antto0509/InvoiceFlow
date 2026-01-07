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
  searchCurrencies,
  listCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  bulkDeleteCurrencies,
} from "@/data/currencies.repository";

describe("[DATA / Currencies] currencies.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createResourceApiMock.mockReturnValue(apiMock);
    listMock.mockResolvedValue({ data: [], total: 0 });
    getMock.mockResolvedValue({ code: "EUR", name: "Euro", symbol: "€" });
  });

  it("makeCurrenciesApi() configures createResourceApi correctly", () => {
    // trigger at least one factory call
    getCurrency("EUR");

    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("currencies");
    expect(opts.select).toBe("*");
    expect(opts.sortableColumns).toEqual(
      expect.arrayContaining(["code", "name", "is_active", "created_at", "updated_at"]) 
    );
    expect(opts.searchColumns).toEqual(expect.arrayContaining(["code", "name", "symbol"]));
    expect(opts.primaryKey).toBe("code");
    expect(opts.conflictTarget).toBe("code");
  });

  it("searchCurrencies() passes query params and maps fields", async () => {
    listMock.mockResolvedValue({
      data: [
        { code: "EUR", name: "Euro", symbol: "€" },
        { code: "USD", name: "US Dollar", symbol: "$" },
      ],
      total: 2,
    });

    const out = await searchCurrencies({ q: "e", limit: 5 });

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 5,
        search: "e",
        sort: { column: "code", dir: "asc" },
      })
    );

    expect(out).toEqual([
      { code: "EUR", name: "Euro", symbol: "€" },
      { code: "USD", name: "US Dollar", symbol: "$" },
    ]);
  });

  it("listCurrencies() returns data with default paging/sort", async () => {
    listMock.mockResolvedValue({ data: [{ code: "EUR" }], total: 1 });

    const out = await listCurrencies();

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 100,
        sort: { column: "code", dir: "asc" },
      })
    );
    expect(out).toEqual([{ code: "EUR" }]);
  });

  it("CRUD wrappers delegate to ResourceApi", async () => {
    await getCurrency("EUR");
    expect(getMock).toHaveBeenCalledWith("EUR");

    await createCurrency({ code: "GBP", name: "Pound", symbol: "£" });
    expect(createMock).toHaveBeenCalledWith({ code: "GBP", name: "Pound", symbol: "£" });

    await updateCurrency("EUR", { name: "Euro+" });
    expect(updateMock).toHaveBeenCalledWith("EUR", { name: "Euro+" });

    await deleteCurrency("EUR");
    expect(removeMock).toHaveBeenCalledWith("EUR");

    bulkDeleteMock.mockResolvedValue(2);
    const n = await bulkDeleteCurrencies(["EUR", "USD"]);
    expect(bulkDeleteMock).toHaveBeenCalledWith(["EUR", "USD"]);
    expect(n).toBe(2);
  });
});
