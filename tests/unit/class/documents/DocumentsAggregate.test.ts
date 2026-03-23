import { describe, it, expect, vi, beforeEach } from "vitest";
import { DocumentsAggregate } from "@/data/class/documents";
import { DocumentsApi } from "@/data/class/documents/DocumentsApi";
import { DocumentsListViewApi } from "@/data/class/documents/DocumentsListViewApi";
import { DocumentLinesApi } from "@/data/class/documents/DocumentLinesApi";

vi.mock("@/data/class/documents/DocumentsApi");
vi.mock("@/data/class/documents/DocumentsListViewApi");
vi.mock("@/data/class/documents/DocumentLinesApi");

type DocumentsApiGetResponse = Awaited<ReturnType<DocumentsApi["get"]>>;
type DocumentsApiCreateResponse = Awaited<ReturnType<DocumentsApi["create"]>>;
type DocumentsApiUpdateResponse = Awaited<ReturnType<DocumentsApi["update"]>>;
type DocumentLinesListByDocumentResponse = Awaited<
  ReturnType<DocumentLinesApi["listByDocument"]>
>;

describe("DocumentsAggregate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =====================
  // Lecture
  // =====================

  it("lists documents using list view", async () => {
    const listSpy = vi
      .spyOn(DocumentsListViewApi.prototype, "list")
      .mockResolvedValue({ data: [], page: 1, pageSize: 10, total: 0 });

    const aggregate = new DocumentsAggregate();
    await aggregate.list({ page: 1 });

    expect(listSpy).toHaveBeenCalledOnce();
    expect(listSpy).toHaveBeenCalledWith({ page: 1 });
  });

  it("gets a document by id", async () => {
    const getSpy = vi
      .spyOn(DocumentsApi.prototype, "get")
      .mockResolvedValue(
        ({ id: "doc-1" } as unknown) as DocumentsApiGetResponse
      );

    const aggregate = new DocumentsAggregate();
    const result = await aggregate.get("doc-1");

    expect(getSpy).toHaveBeenCalledWith("doc-1");
    expect(result?.id).toBe("doc-1");
  });

  it("gets document detail with lines", async () => {
    vi.spyOn(DocumentsApi.prototype, "get").mockResolvedValue(
      ({ id: "doc-1" } as unknown) as DocumentsApiGetResponse
    );

    vi.spyOn(DocumentLinesApi.prototype, "listByDocument").mockResolvedValue(
      ({ data: [{ id: "line-1" }], total: 1 } as unknown) as DocumentLinesListByDocumentResponse
    );

    const aggregate = new DocumentsAggregate();
    const result = await aggregate.getDetail("doc-1");

    expect(result).toEqual({
      id: "doc-1",
      lines: [{ id: "line-1" }],
    });
  });

  // =====================
  // Écriture
  // =====================

  it("creates a draft with lines", async () => {
    vi.spyOn(DocumentsApi.prototype, "create").mockResolvedValue(
      ({ id: "doc-1" } as unknown) as DocumentsApiCreateResponse
    );

    const upsertSpy = vi
      .spyOn(DocumentLinesApi.prototype, "upsert")
      .mockResolvedValue({ count: 1 });

    const aggregate = new DocumentsAggregate();

    const result = await aggregate.createDraftWithLines({
      lines: [{ description: "Line 1" }],
    });

    expect(result.id).toBe("doc-1");
    expect(upsertSpy).toHaveBeenCalledOnce();
  });

  it("finalizes a draft document", async () => {
    vi.spyOn(DocumentsApi.prototype, "get").mockResolvedValue(
      ({
        id: "doc-1",
        status: "draft",
        company_id: "company-1",
        kind: "invoice",
        issue_date: "2025-01-01",
      } as unknown) as DocumentsApiGetResponse
    );

    vi.spyOn(DocumentsApi.prototype, "generateNumber").mockResolvedValue({
      number_value: "42",
      number_readonly: "INV-2025-042",
    });

    const updateSpy = vi
      .spyOn(DocumentsApi.prototype, "update")
      .mockResolvedValue(
        ({ id: "doc-1" } as unknown) as DocumentsApiUpdateResponse
      );

    const aggregate = new DocumentsAggregate();
    await aggregate.finalizeDraft("doc-1");

    expect(updateSpy).toHaveBeenCalledWith("doc-1", {
      status: "finalized",
      number: "42",
      number_readonly: "INV-2025-042",
    });
  });

  it("refuses to finalize a non-draft document", async () => {
    vi.spyOn(DocumentsApi.prototype, "get").mockResolvedValue(
      ({
        id: "doc-1",
        status: "finalized",
      } as unknown) as DocumentsApiGetResponse
    );

    const aggregate = new DocumentsAggregate();

    await expect(
      aggregate.finalizeDraft("doc-1")
    ).rejects.toThrow("Document already finalized");
  });
});
