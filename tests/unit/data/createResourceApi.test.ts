import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSupabaseMock } from "../../mocks/supabaseMock";
import type { FilterOps } from "@/lib/types";

// Mock createClient() utilisé dans ResourceApi
const supabaseMock = createSupabaseMock();

vi.mock("@/data/supabase/client", () => ({
  createClient: () => supabaseMock,
}));

// Mock logging (pas testé ici, withLogging=false par défaut)
vi.mock("@/data/logs", () => ({
  logAction: vi.fn(),
  viewCompanyID: vi.fn().mockResolvedValue(undefined),
}));

import { ResourceApi } from "@/data/class/ResourceApi";

type Row = {
  id: string;
  name?: string;
  email?: string;
  total?: number;
  subtotal?: number;
  tax?: number;
  secret?: string;
};
type PaymentAllocation = { payment_id: string; document_id: string };

type SupabaseMockCall = { fn: string; args: unknown[] };
const getCall = (fn: string) => supabaseMock.__calls.find((c) => c.fn === fn) as SupabaseMockCall | undefined;
const getCalls = (fn: string) => supabaseMock.__calls.filter((c) => c.fn === fn) as SupabaseMockCall[];

describe("[DATA] ResourceApi", () => {
  beforeEach(() => {
    supabaseMock.__resetCalls();
    supabaseMock.__setNextResult({ data: [], count: 0, error: null });
    supabaseMock.__setNextSingleResult({ data: null, error: null });
  });

  it("list() builds select + range + returns pagination", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id,name",
      sortableColumns: ["name", "created_at"],
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({
      data: [
        { id: "1", name: "A" },
        { id: "2", name: "B" },
      ],
      count: 42,
      error: null,
    });

    const res = await api.list({ page: 2, pageSize: 10 });

    expect(res.page).toBe(2);
    expect(res.pageSize).toBe(10);
    expect(res.total).toBe(42);
    expect(res.data).toHaveLength(2);

    // range: page2 size10 => from=10 to=19
    const rangeCall = getCall("range");
    expect(rangeCall?.args).toEqual([10, 19]);

    const selectCall = getCall("select");
    expect(selectCall?.args[0]).toBe("id,name");
  });

  it("list() applies default page/pageSize when omitted", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id,name",
    });

    supabaseMock.__setNextResult({
      data: [{ id: "1", name: "A" }],
      count: 1,
      error: null,
    });

    const res = await api.list();

    expect(res.page).toBe(1);
    expect(res.pageSize).toBe(20);
    expect(res.total).toBe(1);

    const rangeCall = getCall("range");
    expect(rangeCall?.args).toEqual([0, 19]);
  });

  it("list() applies search with OR ilike and safe sort", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id,name,email",
      sortableColumns: ["name"],
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({
      search: "antoine",
      sort: { column: "name", dir: "desc" },
    });

    const orCall = getCall("or");
    expect(orCall?.args[0]).toContain("name.ilike.%antoine%");
    expect(orCall?.args[0]).toContain("email.ilike.%antoine%");

    const orderCall = getCall("order");
    expect(orderCall?.args[0]).toBe("name");
    expect(orderCall?.args[1]).toMatchObject({ ascending: false });
  });

  it("list() ignores empty/blank search", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({ search: "   " });

    const orCall = getCall("or");
    expect(orCall).toBeUndefined();
  });

  it("get() uses simple PK by default (id)", async () => {
    const api = new ResourceApi<Row>({ table: "clients", select: "id,name" });

    supabaseMock.__setNextSingleResult({
      data: { id: "abc", name: "Client" },
      error: null,
    });

    const row = await api.get("abc");

    expect(row.id).toBe("abc");

    const eqCall = getCall("eq");
    expect(eqCall?.args).toEqual(["id", "abc"]);
  });

  it("get() uses customSelect when provided", async () => {
    const api = new ResourceApi<Row>({ table: "clients", select: "id,name,email" });

    supabaseMock.__setNextSingleResult({
      data: { id: "abc" },
      error: null,
    });

    await api.get("abc", "id");

    const selectCall = getCall("select");
    expect(selectCall?.args[0]).toBe("id");
  });

  it("get() supports composite PK and throws on wrong key array length", async () => {
    const api = new ResourceApi<PaymentAllocation>({
      table: "payment_allocations",
      primaryKey: ["payment_id", "document_id"],
    });

    await expect(api.get(["p1"])).rejects.toThrow(/Composite PK/);

    supabaseMock.__setNextSingleResult({
      data: { payment_id: "p1", document_id: "d1" },
      error: null,
    });

    await api.get(["p1", "d1"]);

    // eq called twice
    const eqCalls = getCalls("eq");
    expect(eqCalls.map((c) => c.args)).toEqual([
      ["payment_id", "p1"],
      ["document_id", "d1"],
    ]);
  });

  it("create() strips generated fields and protected columns before insert", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      protectedColumns: ["secret"],
    });

    supabaseMock.__setNextSingleResult({
      data: { id: "1", name: "X" },
      error: null,
    });

    await api.create({ name: "X", total: 123, secret: "NOPE" } as Row);

    const insertCall = getCall("insert");
    const inserted = (insertCall?.args[0] ?? {}) as Record<string, unknown>;

    // "secret" et champs générés ne doivent pas être passés
    expect(inserted["secret"]).toBeUndefined();
    expect(inserted["total"]).toBeUndefined();
    expect(inserted["name"]).toBe("X");
  });

  it("create() strips multiple generated fields (total/subtotal/tax)", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextSingleResult({
      data: { id: "1", name: "Gen" },
      error: null,
    });

    await api.create({ name: "Gen", total: 1, subtotal: 2, tax: 3 });

    const insertCall = getCall("insert");
    const inserted = (insertCall?.args[0] ?? {}) as Record<string, unknown>;

    expect(inserted["name"]).toBe("Gen");
    expect(inserted["total"]).toBeUndefined();
    expect(inserted["subtotal"]).toBeUndefined();
    expect(inserted["tax"]).toBeUndefined();
  });

  it("update() applies PK filter and strips generated fields", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id,name",
    });

    supabaseMock.__setNextSingleResult({
      data: { id: "1", name: "Y" },
      error: null,
    });

    await api.update("1", { name: "Y", total: 999 } as Row);

    const updateCall = getCall("update");
    const updated = (updateCall?.args[0] ?? {}) as Record<string, unknown>;
    expect(updated["total"]).toBeUndefined();
    expect(updated["name"]).toBe("Y");

    const eqCall = getCall("eq");
    expect(eqCall?.args).toEqual(["id", "1"]);
  });

  it("remove() deletes by PK", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextResult({ data: null, error: null });

    await api.remove("abc");

    const deleteCall = getCall("delete");
    expect(deleteCall).toBeTruthy();

    const eqCall = getCall("eq");
    expect(eqCall?.args).toEqual(["id", "abc"]);
  });

  it("bulkDelete() returns 0 when keys is empty and does not call in()", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    const count = await api.bulkDelete([]);
    expect(count).toBe(0);

    const inCall = getCall("in");
    expect(inCall).toBeUndefined();
  });

  it("bulkDelete() rejects composite PK", async () => {
    const api = new ResourceApi<PaymentAllocation>({
      table: "payment_allocations",
      primaryKey: ["payment_id", "document_id"],
    });

    await expect(api.bulkDelete(["x"])).rejects.toThrow(/PK composite/);
  });

  it("bulkDelete() uses delete({count:'exact'}) + in(pk, keys) and returns count", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextResult({ data: null, count: 3, error: null });

    const count = await api.bulkDelete(["a", "b", "c"]);
    expect(count).toBe(3);

    const deleteCall = getCall("delete");
    expect(deleteCall?.args[0]).toMatchObject({ count: "exact" });

    const inCall = getCall("in");
    expect(inCall?.args[0]).toBe("id");
    expect(inCall?.args[1]).toEqual(["a", "b", "c"]);
  });

  it("count() uses head select and applies search", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({ data: null, count: 7, error: null });

    const c = await api.count({ search: "antoine" });
    expect(c).toBe(7);

    const selectCall = getCall("select");
    expect(selectCall?.args[0]).toBe("*");
    expect(selectCall?.args[1]).toMatchObject({ head: true, count: "exact" });

    const orCall = getCall("or");
    expect(orCall?.args[0]).toContain("name.ilike.%antoine%");
    expect(orCall?.args[0]).toContain("email.ilike.%antoine%");
  });

  it("exists() selects pkSelect with head + limit(1) and returns boolean", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextResult({ data: null, count: 1, error: null });

    const filters: Record<string, FilterOps | undefined> = {
      name: { op: "ilike", value: "%a%" },
    };

    const ok = await api.exists(filters);
    expect(ok).toBe(true);

    const selectCall = getCall("select");
    expect(selectCall?.args[0]).toBe("id");
    expect(selectCall?.args[1]).toMatchObject({ head: true, count: "exact" });

    const limitCall = getCall("limit");
    expect(limitCall?.args[0]).toBe(1);
  });

  it("exists() returns false when count is 0", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextResult({ data: null, count: 0, error: null });

    const filters: Record<string, FilterOps | undefined> = {
      email: { op: "ilike", value: "%nope%" },
    };

    const ok = await api.exists(filters);
    expect(ok).toBe(false);
  });

  it("listAll() uses limit and safe sort", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      sortableColumns: ["name"],
    });

    supabaseMock.__setNextResult({
      data: [{ id: "1", name: "A" }],
      count: 1,
      error: null,
    });

    const { data: rows, truncated } = await api.listAll(50, { sort: { column: "name", dir: "asc" } });
    expect(rows).toHaveLength(1);
    expect(truncated).toBe(false);

    const limitCall = getCall("limit");
    expect(limitCall?.args[0]).toBe(50);

    const orderCall = getCall("order");
    expect(orderCall?.args[0]).toBe("name");
    expect(orderCall?.args[1]).toMatchObject({ ascending: true });
  });

  it("list() ignores unsafe sort column (not in sortableColumns)", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      sortableColumns: ["name"],
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({ sort: { column: "email", dir: "asc" } });

    const orderCall = getCall("order");
    expect(orderCall).toBeUndefined();
  });

  it("list() does not apply search when searchColumns is empty", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      searchColumns: [],
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({ search: "antoine" });

    const orCall = getCall("or");
    expect(orCall).toBeUndefined();
  });

  it("list() maps rows when mapRow is provided", async () => {
    const mapRow = vi.fn((r: unknown) => {
      const row = r as { id: string; name?: string };
      return { ...row, name: (row.name ?? "").toUpperCase() };
    });

    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id,name",
      mapRow,
    });

    supabaseMock.__setNextResult({
      data: [{ id: "1", name: "antoine" }],
      count: 1,
      error: null,
    });

    const res = await api.list();
    expect(res.data[0]?.name).toBe("ANTOINE");
    expect(mapRow).toHaveBeenCalledTimes(1);
  });

  it("upsertMany() uses conflictTarget or pkSelect", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      primaryKey: "id",
      conflictTarget: "id",
    });

    supabaseMock.__setNextResult({ data: [{ id: "1" }], error: null });

    await api.upsertMany([{ id: "1", total: 1 }]);

    const upsertCall = getCall("upsert");
    expect(upsertCall?.args[1]).toMatchObject({ onConflict: "id" });

    // fix: args are unknown -> narrow before indexing
    const payloads = upsertCall?.args[0] as unknown[] | undefined;
    const upsertPayload = (payloads?.[0] ?? {}) as Record<string, unknown>;
    expect(upsertPayload["total"]).toBeUndefined(); // stripGeneratedMany -> remove total/subtotal/tax
  });

  it("upsertMany() falls back to pkSelect when conflictTarget is omitted", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      primaryKey: "id",
    });

    supabaseMock.__setNextResult({ data: [{ id: "1" }], error: null });

    await api.upsertMany([{ id: "1", name: "A" }]);

    const upsertCall = getCall("upsert");
    expect(upsertCall?.args[1]).toMatchObject({ onConflict: "id" });
  });

  it("upsertMany() joins array conflictTarget into onConflict", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      primaryKey: "id",
      conflictTarget: ["email", "name"],
    });

    supabaseMock.__setNextResult({ data: [{ id: "1" }], error: null });

    await api.upsertMany([{ id: "1", email: "a@b.com", name: "A" }]);

    const upsertCall = getCall("upsert");
    expect(upsertCall?.args[1]).toMatchObject({ onConflict: "email,name" });
  });

  it("upsertMany() uses composite pkSelect when conflictTarget is omitted", async () => {
    const api = new ResourceApi<PaymentAllocation>({
      table: "payment_allocations",
      primaryKey: ["payment_id", "document_id"],
    });

    supabaseMock.__setNextResult({
      data: [{ payment_id: "p1", document_id: "d1" }],
      error: null,
    });

    await api.upsertMany([{ payment_id: "p1", document_id: "d1" }]);

    const upsertCall = getCall("upsert");
    expect(upsertCall?.args[1]).toMatchObject({ onConflict: "payment_id,document_id" });
  });

  // --- Additional tests (new) ---

  it("list() forwards countMode to select(..., {count})", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      select: "id",
      countMode: "estimated",
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({ page: 1, pageSize: 5 });

    const selectCall = getCall("select");
    expect(selectCall?.args[0]).toBe("id");
    expect(selectCall?.args[1]).toMatchObject({ count: "estimated" });
  });

  it("list() applies defaultFilters then q.filters", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      defaultFilters: {
        name: { op: "eq", value: "A" },
      },
    });

    supabaseMock.__setNextResult({ data: [], count: 0, error: null });

    await api.list({
      filters: {
        email: { op: "eq", value: "a@b.com" },
      },
    });

    const eqCalls = getCalls("eq");
    expect(eqCalls.map((c) => c.args)).toContainEqual(["name", "A"]);
    expect(eqCalls.map((c) => c.args)).toContainEqual(["email", "a@b.com"]);
  });

  it("get() applies defaultFilters in addition to PK filter", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      defaultFilters: {
        email: { op: "eq", value: "a@b.com" },
      },
    });

    supabaseMock.__setNextSingleResult({
      data: { id: "abc", email: "a@b.com" },
      error: null,
    });

    await api.get("abc");

    const eqCalls = getCalls("eq");
    // order: PK first (applyPkFilter), then defaultFilters
    expect(eqCalls.map((c) => c.args)).toEqual([
      ["id", "abc"],
      ["email", "a@b.com"],
    ]);
  });

  it("count() ignores empty/blank search", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({ data: null, count: 3, error: null });

    const c = await api.count({ search: "   " });
    expect(c).toBe(3);

    const orCall = getCall("or");
    expect(orCall).toBeUndefined();
  });

  it("exists() applies defaultFilters + provided filters", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      defaultFilters: {
        name: { op: "eq", value: "A" },
      },
    });

    supabaseMock.__setNextResult({ data: null, count: 1, error: null });

    const ok = await api.exists({
      email: { op: "eq", value: "a@b.com" },
    });

    expect(ok).toBe(true);

    const eqCalls = getCalls("eq");
    expect(eqCalls.map((c) => c.args)).toContainEqual(["name", "A"]);
    expect(eqCalls.map((c) => c.args)).toContainEqual(["email", "a@b.com"]);
  });

  it("exists() returns false when count is undefined/nullish", async () => {
    const api = new ResourceApi<Row>({ table: "clients" });

    supabaseMock.__setNextResult({ data: null, count: undefined, error: null });

    const ok = await api.exists({
      name: { op: "eq", value: "A" },
    });

    expect(ok).toBe(false);
  });

  it("listAll() applies search when searchColumns is provided", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      searchColumns: ["name", "email"],
    });

    supabaseMock.__setNextResult({ data: [], error: null });

    await api.listAll(10, { search: "antoine" });

    const orCall = getCall("or");
    expect(orCall?.args[0]).toContain("name.ilike.%antoine%");
    expect(orCall?.args[0]).toContain("email.ilike.%antoine%");
  });

  it("bulkDelete() applies defaultFilters to the delete query", async () => {
    const api = new ResourceApi<Row>({
      table: "clients",
      defaultFilters: {
        name: { op: "eq", value: "A" },
      },
    });

    supabaseMock.__setNextResult({ data: null, count: 2, error: null });

    const deleted = await api.bulkDelete(["1", "2"]);
    expect(deleted).toBe(2);

    const inCall = getCall("in");
    expect(inCall?.args[0]).toBe("id");
    expect(inCall?.args[1]).toEqual(["1", "2"]);

    const eqCalls = getCalls("eq");
    expect(eqCalls.map((c) => c.args)).toContainEqual(["name", "A"]);
  });
});
