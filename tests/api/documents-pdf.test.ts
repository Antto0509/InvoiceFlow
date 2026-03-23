import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type PdfRouteCtx = { params: Promise<{ id: string }> };
type PdfRouteGet = (request: Request, ctx: PdfRouteCtx) => Promise<Response>;

function makeReq(url: string) {
  return new Request(url, { method: "GET" });
}

function makeCtx(id: string) {
  return { params: Promise.resolve({ id }) };
}

async function readJson(res: Response) {
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

/**
 * Charge la route en mockant le signer AVANT l'import (évite les soucis de hoisting)
 */
async function loadRouteWithSigner(
  signerImpl: (id: string, opts: { expiresIn: number; force: boolean }) => Promise<string>
) {
  vi.resetModules();

  const signer = vi.fn(signerImpl);

  vi.doMock("@/features/documents/hooks/signDocumentPdf", () => ({
    getOrCreateSignedDocumentPdfUrl: signer,
  }));

  vi.doMock("@/data/supabase/server", () => ({
    createClientServer: () => ({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "test-user" } },
          error: null,
        }),
      },
    }),
  }));

  const mod = (await import("@/app/api/documents/[id]/pdf/route")) as unknown as { GET: PdfRouteGet };
  return { GET: mod.GET, signer };
}

describe("[API] GET /api/documents/[id]/pdf", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirect 302 par défaut vers l’URL signée (redirect=true par défaut)", async () => {
    const { GET, signer } = await loadRouteWithSigner(async () => "https://signed.url/pdf");

    const res = await GET(makeReq("http://localhost/api/documents/123/pdf"), makeCtx("123"));

    expect(signer).toHaveBeenCalledWith("123", { expiresIn: 300, force: false });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://signed.url/pdf");
  });

  it("quand redirect=0 => retourne JSON { url }", async () => {
    const { GET } = await loadRouteWithSigner(async () => "https://signed.url/pdf");

    const res = await GET(
      makeReq("http://localhost/api/documents/123/pdf?redirect=0"),
      makeCtx("123")
    );

    expect(res.status).toBe(200);
    expect(await readJson(res)).toEqual({ url: "https://signed.url/pdf" });
  });

  it("force=1 => force=true envoyé au signer", async () => {
    const { GET, signer } = await loadRouteWithSigner(async () => "https://signed.url/pdf");

    await GET(
      makeReq("http://localhost/api/documents/123/pdf?force=1&redirect=0"),
      makeCtx("123")
    );

    expect(signer).toHaveBeenCalledWith("123", { expiresIn: 300, force: true });
  });

  it("ttl clamp: ttl trop petit => 30, ttl trop grand => 3600", async () => {
    const { GET, signer } = await loadRouteWithSigner(async () => "https://signed.url/pdf");

    await GET(makeReq("http://localhost/api/documents/123/pdf?ttl=1&redirect=0"), makeCtx("123"));
    expect(signer).toHaveBeenLastCalledWith("123", { expiresIn: 30, force: false });

    await GET(
      makeReq("http://localhost/api/documents/123/pdf?ttl=999999&redirect=0"),
      makeCtx("123")
    );
    expect(signer).toHaveBeenLastCalledWith("123", { expiresIn: 3600, force: false });
  });

  it("401 si signer throw 'Unauthorized'", async () => {
    const { GET } = await loadRouteWithSigner(async () => {
      throw new Error("Unauthorized");
    });

    const res = await GET(
      makeReq("http://localhost/api/documents/123/pdf?redirect=0"),
      makeCtx("123")
    );

    expect(res.status).toBe(401);
    expect(await readJson(res)).toEqual({ error: "Non authentifié" });
  });

  it("404 si signer throw 'Not found'", async () => {
    const { GET } = await loadRouteWithSigner(async () => {
      throw new Error("Not found");
    });

    const res = await GET(
      makeReq("http://localhost/api/documents/123/pdf?redirect=0"),
      makeCtx("123")
    );

    expect(res.status).toBe(404);
    expect(await readJson(res)).toEqual({ error: "Document introuvable" });
  });

  it("403 si signer throw 'Forbidden'", async () => {
    const { GET } = await loadRouteWithSigner(async () => {
      throw new Error("Forbidden");
    });

    const res = await GET(
      makeReq("http://localhost/api/documents/123/pdf?redirect=0"),
      makeCtx("123")
    );

    expect(res.status).toBe(403);
    expect(await readJson(res)).toEqual({ error: "Accès interdit" });
  });

  it("400 pour erreur inconnue (string ou Error)", async () => {
    const { GET } = await loadRouteWithSigner(async () => {
      throw "boom";
    });

    const res = await GET(
      makeReq("http://localhost/api/documents/123/pdf?redirect=0"),
      makeCtx("123")
    );

    expect(res.status).toBe(400);
    expect(await readJson(res)).toEqual({ error: "boom" });
  });
});
