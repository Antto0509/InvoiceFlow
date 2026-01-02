import { describe, it, expect, vi, beforeEach } from "vitest";

// ResourceApi mock (for list/get/create/update/remove/bulkDelete)
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

// Supabase client mock for getDocumentDetail + createDocumentWithLines
const mockFrom = vi.fn();
const sbMock = { from: mockFrom } as Record<string, unknown>;

vi.mock("@/data/supabase/client", () => ({
  createClient: () => sbMock,
}));

import {
  listDocuments,
  getDocumentDetail,
  createDocumentWithLines,
  getDocument,
  createDocument,
  updateDocument,
  removeDocument,
  bulkDeleteDocuments,
} from "@/features/documents/data/documents.repository";

describe("[DATA / Documents] documents.repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createResourceApiMock.mockReturnValue(apiMock);
    listMock.mockResolvedValue({ data: [], total: 0 });
    getMock.mockResolvedValue({ id: "d1", number: "2026-0001" });
  });

  it("makeDocumentListApi() applies user scope filter and sorts", async () => {
    await listDocuments({ page: 2, pageSize: 5, search: "ACME", sort: { column: "issue_date", dir: "desc" }, status: "paid", kind: "invoice", clientId: "c1", companyId: "co1", dateFrom: "2026-01-01", dateTo: "2026-01-31" }, "user-1");

    const listArgs = listMock.mock.calls[0]?.[0];
    expect(listArgs).toMatchObject({
      page: 2,
      pageSize: 5,
      search: "ACME",
      sort: { column: "issue_date", dir: "desc" },
    });
    expect(listArgs.filters).toEqual(
      expect.objectContaining({
        status: { op: "eq", value: "paid" },
        kind: { op: "eq", value: "invoice" },
        client_id: { op: "eq", value: "c1" },
        company_id: { op: "eq", value: "co1" },
        issue_date: { op: "lte", value: "2026-01-31" },
      })
    );
  });

  it("getDocumentDetail() selects with joins and returns shaped object", async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };
    mockFrom.mockReturnValue(selectChain);

    selectChain.maybeSingle.mockResolvedValue({
      data: {
        id: "d1",
        user_id: "u1",
        document_lines: [{ id: "l1" }],
        clients: { name: "Client 1", address: "x", company: "C" },
        companies: { id: "co1", name: "ACME" },
        client_id: "c1",
        number: "001",
      },
      error: null,
    });

    const out = await getDocumentDetail("d1", "u1");
    expect(mockFrom).toHaveBeenCalledWith("documents");
    expect(selectChain.select).toHaveBeenCalled();
    expect(selectChain.eq).toHaveBeenCalledWith("id", "d1");
    expect(out.id).toBe("d1");
    expect(out.lines).toEqual([{ id: "l1" }]);
    expect(out.client?.name).toBe("Client 1");
    expect(out.company?.name).toBe("ACME");
  });

  it("createDocumentWithLines() inserts doc then lines and returns id", async () => {
    // chain for documents: insert(...).select("id").single()
    const docAfterInsert = { single: vi.fn() };
    const docInsertChain = { select: vi.fn().mockReturnValue(docAfterInsert) };
    const docChain = {
      insert: vi.fn().mockReturnValue(docInsertChain),
      select: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn().mockReturnThis(),
    };

    // chain for document_lines: insert(...).select("id")
    const linesInsertReturn = { select: vi.fn().mockResolvedValue({ error: null }) };
    const lineChain = {
      insert: vi.fn().mockReturnValue(linesInsertReturn),
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === "documents") return docChain;
      if (table === "document_lines") return lineChain;
      return {} as Record<string, unknown>;
    });

    docAfterInsert.single.mockResolvedValue({ data: { id: "d1" }, error: null });

    const out = await createDocumentWithLines({ number: "n", lines: [{ description: "x" }] }, "u1");
    expect(docChain.insert).toHaveBeenCalled();
    expect(lineChain.insert).toHaveBeenCalled();
    expect(out).toEqual({ id: "d1" });
  });

  it("createDocument() can update pdf_url when generator provided", async () => {
    createMock.mockResolvedValue({ id: "d1" });
    updateMock.mockResolvedValue({ id: "d1", pdf_url: "/p.pdf" });

    const out = await createDocument({ number: "n" } as Record<string, unknown>, undefined, {
      generatePdf: async () => ({ path: "/p.pdf" }),
    });

    expect(createMock).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith("d1", { pdf_url: "/p.pdf" });
    expect(out).toEqual({ id: "d1", pdf_url: "/p.pdf" });
  });

  it("CRUD wrappers delegate to api", async () => {
    await getDocument("d1", "u");
    expect(getMock).toHaveBeenCalledWith("d1");

    await createDocument({ number: "n" } as Record<string, unknown>);
    expect(createMock).toHaveBeenCalled();

    await updateDocument("d1", { number: "m" } as Record<string, unknown>, "u");
    expect(updateMock).toHaveBeenCalledWith("d1", { number: "m" });

    await removeDocument("d1", "u");
    expect(removeMock).toHaveBeenCalledWith("d1");

    bulkDeleteMock.mockResolvedValue(2);
    const n = await bulkDeleteDocuments(["a", "b"], "u");
    expect(bulkDeleteMock).toHaveBeenCalledWith(["a", "b"]);
    expect(n).toBe(2);
  });
});
