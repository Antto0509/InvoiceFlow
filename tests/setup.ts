import "@testing-library/jest-dom";
import { afterAll, beforeAll, vi } from "vitest";

// Silence les logs verbeux pendant les tests
beforeAll(() => {
  vi.spyOn(console, "group").mockImplementation(() => {});
  vi.spyOn(console, "groupEnd").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "debug").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
