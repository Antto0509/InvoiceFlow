import { describe, it, expect } from "vitest";
import { buildOrIlike, ensureSortable } from "@/lib/utils";

describe("[UTILS / Filters] buildOrIlike", () => {
  it("returns undefined on empty", () => {
    expect(buildOrIlike(["name"], "   ")).toBeUndefined();
  });

  it("builds ilike OR query", () => {
    expect(buildOrIlike(["name", "email"], "antoine"))
      .toBe("name.ilike.%antoine%,email.ilike.%antoine%");
  });

  it("escapes % and _", () => {
    expect(buildOrIlike(["name"], "a%b_c"))
      .toBe("name.ilike.%a\\%b\\_c%");
  });
});

describe("[UTILS / Filters] ensureSortable", () => {
  it("rejects non-whitelisted column", () => {
    expect(ensureSortable({ column: "hack", dir: "asc" } as { column: string; dir: "asc" | "desc" | undefined }, ["name"])).toBeUndefined();
  });

  it("keeps allowed column", () => {
    expect(ensureSortable({ column: "name", dir: "desc" }, ["name"])).toEqual({
      column: "name",
      dir: "desc",
      foreignTable: undefined,
      nulls: undefined,
    });
  });
});
