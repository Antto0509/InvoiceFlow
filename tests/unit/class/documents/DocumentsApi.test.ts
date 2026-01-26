import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { DocumentsApi } from "@/data/class/documents";

describe("DocumentsApi", () => {
  it("uses documents table", async () => {
    const api = new DocumentsApi();

    await api.list({ page: 1, pageSize: 10 });

    expect(supabaseMock.__calls).toContainEqual({
      fn: "from",
      args: ["documents"],
    });
  });
});