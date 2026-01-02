import { describe, it, expect } from "vitest";
import { formatDateSafe, formatDateYMD } from "@/lib/utils";

describe("[UTILS / Dates] formatDateSafe", () => {
  it("returns dash when null", () => {
    expect(formatDateSafe(null, "dd/MM/yyyy")).toBe("–");
  });

  it("formats ISO date string", () => {
    expect(formatDateSafe("2025-12-31", "yyyy-MM-dd")).toBe("2025-12-31");
  });
});

describe("[UTILS / Dates] formatDateYMD", () => {
  it("returns empty string when null", () => {
    expect(formatDateYMD(null)).toBe("");
  });

  it("formats YYYY-MM-DD to dd/MM/yyyy", () => {
    expect(formatDateYMD("2025-12-31")).toBe("31/12/2025");
  });
});
