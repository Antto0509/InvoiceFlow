import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadDocumentPdf } from "@/lib/utils";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("[UTILS / downloadDocumentPdf] downloadDocumentPdf", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("opens url when API returns ok + url", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://example.com/file.pdf" }),
    } as Response);

    await downloadDocumentPdf("doc-1", false);

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/file.pdf",
      "_blank",
      "noopener,noreferrer"
    );
  });

  it("shows error toast when response not ok", async () => {
    const { toast } = await import("sonner");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    await downloadDocumentPdf("doc-1");

    expect(toast.error).toHaveBeenCalled();
  });
});
