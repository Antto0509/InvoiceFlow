import { describe, it, expect } from "vitest";
import {
  zDateYMD,
  zDateISO,
  zCurrencyCode,
  zUuid,
  zNonNegative,
  zPositive,
  zNonEmptyString,
  zUrl,
  zEmail,
  zIbanLike,
  zBicLike,
  zMimeType,
  zFileSize,
} from "@/lib/zod";

import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

describe("[ZOD] helpers", () => {
  describe("zDateYMD", () => {
    it("accepts YYYY-MM-DD", () => {
      expect(zDateYMD.parse("2026-01-02")).toBe("2026-01-02");
    });

    it("rejects invalid formats", () => {
      expect(() => zDateYMD.parse("02/01/2026")).toThrow();
      expect(() => zDateYMD.parse("2026-1-2")).toThrow();
      expect(() => zDateYMD.parse("20260102")).toThrow();
    });
  });

  describe("zDateISO", () => {
    it("accepts ISO datetime with offset", () => {
      expect(zDateISO.parse("2026-01-02T10:30:00+01:00")).toBe(
        "2026-01-02T10:30:00+01:00"
      );
      expect(zDateISO.parse("2026-01-02T09:30:00Z")).toBe("2026-01-02T09:30:00Z");
    });

    it("rejects datetime without offset", () => {
      expect(() => zDateISO.parse("2026-01-02T10:30:00")).toThrow();
    });

    it("rejects non-datetime", () => {
      expect(() => zDateISO.parse("2026-01-02")).toThrow();
    });
  });

  describe("zCurrencyCode", () => {
    it("accepts 3 letters and uppercases", () => {
      expect(zCurrencyCode.parse("eur")).toBe("EUR");
      expect(zCurrencyCode.parse("Usd")).toBe("USD");
    });

    it("rejects non 3-letter codes", () => {
      expect(() => zCurrencyCode.parse("EURO")).toThrow();
      expect(() => zCurrencyCode.parse("EU")).toThrow();
      expect(() => zCurrencyCode.parse("12A")).toThrow();
    });
  });

  describe("zUuid", () => {
    it("accepts a v4 UUID", () => {
      expect(zUuid.parse("b3b2c1d0-1f2e-4a3b-9c8d-7e6f5a4b3c2d")).toBe(
        "b3b2c1d0-1f2e-4a3b-9c8d-7e6f5a4b3c2d"
      );
    });

    it("rejects invalid UUID", () => {
      expect(() => zUuid.parse("not-a-uuid")).toThrow();
      // v1-like format should also reject if strict v4
      expect(() => zUuid.parse("6ba7b810-9dad-11d1-80b4-00c04fd430c8")).toThrow();
    });
  });

  describe("zNonNegative", () => {
    it("coerces and accepts >= 0", () => {
      expect(zNonNegative.parse("0")).toBe(0);
      expect(zNonNegative.parse("10.5")).toBe(10.5);
    });

    it("rejects negative", () => {
      expect(() => zNonNegative.parse(-1)).toThrow();
      expect(() => zNonNegative.parse("-0.01")).toThrow();
    });
  });

  describe("zPositive", () => {
    it("coerces and accepts > 0", () => {
      expect(zPositive.parse("1")).toBe(1);
      expect(zPositive.parse(0.1)).toBe(0.1);
    });

    it("rejects 0 and negatives", () => {
      expect(() => zPositive.parse(0)).toThrow();
      expect(() => zPositive.parse("0")).toThrow();
      expect(() => zPositive.parse(-1)).toThrow();
    });
  });

  describe("zNonEmptyString", () => {
    it("accepts non-empty", () => {
      expect(zNonEmptyString.parse("ok")).toBe("ok");
    });

    it("rejects empty", () => {
      expect(() => zNonEmptyString.parse("")).toThrow();
    });
  });

  describe("zUrl", () => {
    it("accepts valid URL", () => {
      expect(zUrl.parse("https://example.com")).toBe("https://example.com");
    });

    it("rejects invalid URL", () => {
      expect(() => zUrl.parse("example.com")).toThrow();
      expect(() => zUrl.parse("not a url")).toThrow();
    });
  });

  describe("zEmail", () => {
    it("accepts valid email", () => {
      expect(zEmail.parse("antoine@example.com")).toBe("antoine@example.com");
    });

    it("rejects invalid email", () => {
      expect(() => zEmail.parse("antoine@")).toThrow();
      expect(() => zEmail.parse("antoine")).toThrow();
    });
  });

  describe("zIbanLike", () => {
    it("accepts IBAN-like", () => {
      // FR + 25 chars = 27 total (common)
      expect(zIbanLike.parse("FR1420041010050500013M02606")).toBe(
        "FR1420041010050500013M02606"
      );
    });

    it("rejects invalid IBAN-like", () => {
      expect(() => zIbanLike.parse("FR14")).toThrow();
      expect(() => zIbanLike.parse("fr1420041010050500013M02606")).toThrow(); // lowercases reject (regex expects A-Z)
    });
  });

  describe("zBicLike", () => {
    it("accepts BIC 8 and 11 chars", () => {
      expect(zBicLike.parse("DEUTDEFF")).toBe("DEUTDEFF");
      expect(zBicLike.parse("DEUTDEFF500")).toBe("DEUTDEFF500");
    });

    it("rejects invalid BIC-like", () => {
      expect(() => zBicLike.parse("DEUT")).toThrow();
      expect(() => zBicLike.parse("DEUTDEFF5000")).toThrow();
    });
  });

  describe("zMimeType", () => {
    it("accepts supported mime types", () => {
      // prend le premier type supporté pour éviter de hardcoder
      const ok = (SUPPORTED_FILE_TYPES as readonly string[])[0];
      expect(zMimeType.parse(ok)).toBe(ok);
    });

    it("rejects unsupported mime types", () => {
      expect(() => zMimeType.parse("application/x-evil")).toThrow();
    });
  });

  describe("zFileSize", () => {
    it("accepts a positive size <= MAX_FILE_SIZE_BYTES", () => {
      expect(zFileSize.parse(1)).toBe(1);
      expect(zFileSize.parse(MAX_FILE_SIZE_BYTES)).toBe(MAX_FILE_SIZE_BYTES);
    });

    it("rejects size <= 0", () => {
      expect(() => zFileSize.parse(0)).toThrow();
      expect(() => zFileSize.parse(-1)).toThrow();
    });

    it("rejects size > MAX_FILE_SIZE_BYTES", () => {
      expect(() => zFileSize.parse(MAX_FILE_SIZE_BYTES + 1)).toThrow();
    });
  });
});
