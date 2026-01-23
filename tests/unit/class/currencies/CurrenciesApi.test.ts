import { describe, it, expect } from "vitest";
import { supabase } from "../supabase";
import { CurrenciesApi } from "@/data/class/currencies/CurrenciesApi";

describe("CurrenciesApi", () => {
  it("uses currencies table", async () => {
    const api = new CurrenciesApi();

    await api.list({ page: 1, pageSize: 10 });

    expect(supabase.__calls).toContainEqual({
      fn: "from",
      args: ["currencies"],
    });
  });

  it("orders by code asc on listAll()", async () => {
    const api = new CurrenciesApi();

    await api.listAll();

    expect(supabase.__calls).toContainEqual({
      fn: "order",
      args: ["code", { ascending: true }],
    });
  });
});
