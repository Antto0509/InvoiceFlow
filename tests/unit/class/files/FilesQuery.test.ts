import { describe, it, expect } from "vitest";
import { supabase } from "../supabase";
import { getFileWithDetails } from "@/data/class/files";

describe("FilesQuery", () => {
  it("fetches file and its first link", async () => {
    await getFileWithDetails("file-1");

    expect(supabase.__calls).toContainEqual({
      fn: "from",
      args: ["files"],
    });

    expect(supabase.__calls).toContainEqual({
      fn: "from",
      args: ["file_links"],
    });
  });
});
