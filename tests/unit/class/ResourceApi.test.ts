import { describe, it, expect } from "vitest";
import { supabase } from "./supabase";
import { ResourceApi } from "@/data/class/ResourceApi";

describe("ResourceApi", () => {
  it("calls correct table on list()", async () => {
    const api = new ResourceApi({
      table: "test_table",
    });

    await api.list({ page: 1, pageSize: 10 });

    expect(supabase.__calls).toContainEqual({
      fn: "from",
      args: ["test_table"],
    });
  });

  it("applies filters correctly", async () => {
    const api = new ResourceApi({
      table: "items",
    });

    await api.list({
      filters: {
        status: { op: "eq", value: "active" },
      },
    });

    expect(supabase.__calls).toContainEqual({
      fn: "eq",
      args: ["status", "active"],
    });
  });
});
