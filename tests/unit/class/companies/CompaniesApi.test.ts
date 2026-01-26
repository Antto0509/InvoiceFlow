import { describe, it, expect } from "vitest";
import { supabaseMock } from "../supabase";
import { CompaniesApi } from "@/data/class/companies";

describe("CompaniesApi", () => {
  it("uses companies table", async () => {
    const api = new CompaniesApi();

    await api.list({ page: 1, pageSize: 10 });

    expect(supabaseMock.__calls).toContainEqual({
      fn: "from",
      args: ["companies"],
    });
  });
});
    