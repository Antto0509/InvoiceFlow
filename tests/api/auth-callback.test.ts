import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeReq(url: string) {
  return new Request(url, { method: "GET" });
}

describe("[API] GET /auth/callback", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("redirect vers /login?error=missing_code si pas de code", async () => {
    // mock supabase (même si pas utilisé dans ce cas)
    vi.mock("@/data/supabase/server", () => ({
      createClientServer: () => ({
        auth: { exchangeCodeForSession: vi.fn() },
      }),
    }));

    const { GET } = await import("@/app/api/auth/callback/route");

    const res = await GET(makeReq("http://localhost/auth/callback"));
    expect(res.status).toBe(307); // NextResponse.redirect default
    expect(res.headers.get("location")).toBe(
      "http://localhost/login?error=missing_code"
    );
  });

    it("redirect vers /login?error=... si exchangeCodeForSession renvoie une erreur", async () => {
    vi.resetModules();

    const exchange = vi.fn().mockResolvedValue({
        error: { message: "Invalid code" },
    });

    vi.doMock("@/data/supabase/server", () => ({
        createClientServer: () => ({
        auth: { exchangeCodeForSession: exchange },
        }),
    }));

    const { GET } = await import("@/app/api/auth/callback/route");

    const res = await GET(new Request("http://localhost/auth/callback?code=abc123"));

    expect(exchange).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
        "http://localhost/login?error=Invalid%20code"
    );
    });

    it("redirect vers /dashboard si exchangeCodeForSession OK", async () => {
    vi.resetModules();

    const exchange = vi.fn().mockResolvedValue({ error: null });

    vi.doMock("@/data/supabase/server", () => ({
        createClientServer: () => ({
        auth: { exchangeCodeForSession: exchange },
        }),
    }));

    const { GET } = await import("@/app/api/auth/callback/route");

    const res = await GET(new Request("http://localhost/auth/callback?code=abc123"));

    expect(exchange).toHaveBeenCalledWith("abc123");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/dashboard");
    });
});
