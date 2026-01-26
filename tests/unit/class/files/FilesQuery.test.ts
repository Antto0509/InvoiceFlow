import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { getFileWithDetails } from "@/data/class/files";

describe("FilesQuery", () => {
  it("fetches file and its first link", async () => {
    await getFileWithDetails("file-1");

    expect(supabaseMock.__calls).toContainEqual({
      fn: "from",
      args: ["files"],
    });

    expect(supabaseMock.__calls).toContainEqual({
      fn: "from",
      args: ["file_links"],
    });
  });
});
