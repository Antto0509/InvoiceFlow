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
  makeFilesApi,
  makeFileTargetsApi,
  searchFiles,
  listFiles,
  getFile,
  createFile,
  updateFile,
  deleteFile,
  bulkDeleteFiles,
  getFileTarget,
  listFileTargetsByFile,
  createFileTarget,
  deleteFileTarget,
  getFileWithDetails,
} from "@/data/files.repository";

describe("[DATA / Files] files.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createResourceApiMock.mockReturnValue(apiMock);
    listMock.mockResolvedValue({ data: [], total: 0 });
    getMock.mockResolvedValue({ id: "f1", bucket: "b", path: "p" });
  });

  it("makeFilesApi() configures createResourceApi with table + defaultFilters", () => {
    makeFilesApi("user-1");
    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("files");
    expect(opts.select).toBe("*");
    expect(opts.sortableColumns).toEqual(
      expect.arrayContaining(["id", "user_id", "bucket", "path", "mime_type", "size_bytes", "created_at"]) 
    );
    expect(opts.searchColumns).toEqual(expect.arrayContaining(["bucket", "path", "mime_type"]));
    expect(opts.defaultFilters).toEqual({ user_id: { op: "eq", value: "user-1" } });
    expect(opts.protectedColumns).toEqual(["user_id"]);
  });

  it("makeFileTargetsApi() configures composite PK + conflictTarget", () => {
    makeFileTargetsApi();
    const opts = hoisted.createResourceApiMock.mock.calls.at(-1)?.[0] as Record<string, unknown>;
    expect(opts.table).toBe("file_links");
    expect(opts.primaryKey).toEqual(["file_id", "target_table", "target_id"]);
    expect(opts.conflictTarget).toEqual(["file_id", "target_table", "target_id"]);
  });

  it("searchFiles() passes query params and maps result", async () => {
    listMock.mockResolvedValue({
      data: [
        { id: "1", bucket: "b", path: "a", mime_type: "text/plain" },
        { id: "2", bucket: "b", path: "b", mime_type: null },
      ],
      total: 2,
    });

    const out = await searchFiles({ q: "b", limit: 3 }, "user-1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 3,
        search: "b",
        sort: { column: "created_at", dir: "desc" },
      })
    );

    expect(out).toEqual([
      { id: "1", bucket: "b", path: "a", mime_type: "text/plain" },
      { id: "2", bucket: "b", path: "b", mime_type: null },
    ]);
  });

  it("listFiles() builds filters and returns rows+total", async () => {
    listMock.mockResolvedValue({ data: [{ id: "1" }], total: 99 });

    const out = await listFiles({
      page: 2,
      pageSize: 10,
      search: "a",
      bucket: "b",
      mimeType: "image/png",
      dateFrom: "2026-01-01",
      dateTo: "2026-02-01",
      sort: { column: "created_at", dir: "asc" },
    }, "user-1");

    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        pageSize: 10,
        search: "a",
        sort: { column: "created_at", dir: "asc" },
        filters: expect.objectContaining({
          bucket: { op: "eq", value: "b" },
          mime_type: { op: "eq", value: "image/png" },
          created_at: { op: "lte", value: "2026-02-01" },
        }),
      })
    );

    expect(out.total).toBe(99);
    expect(out.rows).toEqual([{ id: "1" }]);
  });

  it("CRUD wrappers delegate to api", async () => {
    await getFile("1", "u");
    expect(getMock).toHaveBeenCalledWith("1");

    await createFile({ bucket: "b", path: "p", user_id: "u" });
    expect(createMock).toHaveBeenCalledWith({ bucket: "b", path: "p", user_id: "u" });

    await updateFile("1", { path: "x" }, "u");
    expect(updateMock).toHaveBeenCalledWith("1", { path: "x" });

    await deleteFile("1", "u");
    expect(removeMock).toHaveBeenCalledWith("1");

    bulkDeleteMock.mockResolvedValue(3);
    const n = await bulkDeleteFiles(["1", "2", "3"], "u");
    expect(bulkDeleteMock).toHaveBeenCalledWith(["1", "2", "3"]);
    expect(n).toBe(3);
  });

  it("file targets helpers call underlying api", async () => {
    await getFileTarget("f", "t", "id");
    expect(getMock).toHaveBeenCalledWith(["f", "t", "id"]);

    await listFileTargetsByFile("f");
    expect(listMock).toHaveBeenCalledWith(
      expect.objectContaining({ filters: { file_id: { op: "eq", value: "f" } } })
    );

    await createFileTarget({ file_id: "f", target_table: "document", target_id: "id" });
    expect(createMock).toHaveBeenCalledWith({ file_id: "f", target_table: "document", target_id: "id" });

    await deleteFileTarget("f", "t", "id");
    expect(removeMock).toHaveBeenCalledWith(["f", "t", "id"]);
  });

  it("getFileWithDetails() aggregates file + first target", async () => {
    getMock.mockResolvedValue({ id: "f1", bucket: "b", path: "p" });
    listMock.mockResolvedValue({ data: [{ file_id: "f1", target_table: "docs", target_id: "d1" }] });

    const out = await getFileWithDetails("f1");

    expect(out.id).toBe("f1");
    expect(out.target).toEqual({ file_id: "f1", target_table: "docs", target_id: "d1" });
  });
});
