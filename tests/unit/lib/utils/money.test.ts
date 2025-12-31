import { describe, it, expect } from "vitest";
import { formatMoney, round2, isFiniteNumber } from "@/lib/utils";

describe("formatMoney", () => {
  it("formats currency", () => {
    const out = formatMoney(12.5, "EUR");
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("fallback if currency invalid", () => {
    expect(formatMoney(12.5, "XXX_INVALID")).toContain("XXX_INVALID");
  });
});

describe("round2", () => {
  it("rounds to 2 decimals", () => {
    expect(round2(1.005)).toBe(1); // JS classic (si tu veux 1.01 faut une autre strat)
    expect(round2(1.234)).toBe(1.23);
  });
});

describe("isFiniteNumber", () => {
  it("detects finite numbers", () => {
    expect(isFiniteNumber(10)).toBe(true);
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber("10")).toBe(false);
  });
});
