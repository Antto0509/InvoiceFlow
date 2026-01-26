import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { FileLinksApi } from "@/data/class/files";

describe("FileLinksApi", () => {
  it("filters by file_id on listByFile()", async () => {
    const api = new FileLinksApi();

    await api.listByFile("file-1");

    expect(supabaseMock.__calls).toContainEqual({
      fn: "eq",
      args: ["file_id", "file-1"],
    });
  });

  it("builds composite PK on get()", async () => {
    const api = new FileLinksApi();

    await api.get(["file-1", "documents", "doc-1"]);

    expect(supabaseMock.__calls).toEqual(
      expect.arrayContaining([
        { fn: "eq", args: ["file_id", "file-1"] },
        { fn: "eq", args: ["target_table", "documents"] },
        { fn: "eq", args: ["target_id", "doc-1"] },
      ])
    );
  });
});
