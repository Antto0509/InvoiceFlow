import "@testing-library/jest-dom";
import { afterAll, beforeAll, vi } from "vitest";

// Mock Next.js 'server-only' module
vi.mock("server-only", () => ({}));

// Suppress console output during tests
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
