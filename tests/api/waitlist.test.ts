import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * Helpers
 */
function makeReq(body: unknown, ip = "1.2.3.4") {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

async function readJson(res: Response) {
  const txt = await res.text();
  try {
    return txt ? JSON.parse(txt) : null;
  } catch {
    return txt;
  }
}

describe("[API] POST /api/waitlist", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules(); // IMPORTANT: reset module state (rate limit Map en mémoire)
    process.env.BREVO_API_KEY = "test_brevo_key";
    process.env.BREVO_WAITLIST_ID = "123";
  });

  afterEach(() => {
    delete process.env.BREVO_API_KEY;
    delete process.env.BREVO_WAITLIST_ID;
  });

  it("400 si email invalide", async () => {
    // Import après resetModules pour reset l'état interne (rate limit)
    const { POST } = await import("@/app/api/waitlist/route");

    const res = await POST(makeReq({ email: "nope" }));
    expect(res.status).toBe(400);

    const data = await readJson(res);
    expect(data).toEqual({ error: "Email invalide" });
  });

  it("204 si honeypot rempli (et ne contacte pas Brevo)", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/waitlist/route");

    const res = await POST(makeReq({ email: "test@site.com", company: "bot" }));
    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("500 si env Brevo manquante/mal configurée", async () => {
    process.env.BREVO_API_KEY = "";
    process.env.BREVO_WAITLIST_ID = "not-a-number";

    const { POST } = await import("@/app/api/waitlist/route");

    const res = await POST(makeReq({ email: "test@site.com", company: "" }));
    expect(res.status).toBe(500);

    const data = await readJson(res);
    expect(data).toEqual({ error: "Brevo mal configuré côté serveur" });
  });

  it("200 si Brevo OK (create/update contact)", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 201,
      text: async () => "",
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/waitlist/route");

    const res = await POST(makeReq({ email: "  Antoine@Example.COM ", company: "" }));
    expect(res.status).toBe(200);

    const data = await readJson(res);
    expect(data).toEqual({ ok: true });

    // Vérifie l’appel Brevo
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchMock.mock.calls[0];

    expect(url).toBe("https://api.brevo.com/v3/contacts");
    expect(opts.method).toBe("POST");
    expect(opts.headers["api-key"]).toBe("test_brevo_key");
    expect(opts.headers["Content-Type"]).toBe("application/json");

    const payload = JSON.parse(opts.body);
    expect(payload).toMatchObject({
      email: "antoine@example.com",
      listIds: [123],
      updateEnabled: true,
    });
  });

  it("502 si Brevo répond pas ok (remonte details)", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "brevo says nope",
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/waitlist/route");

    const res = await POST(makeReq({ email: "test@site.com", company: "" }));
    expect(res.status).toBe(502);

    const data = await readJson(res);
    expect(data).toEqual({ error: "Brevo error", details: "brevo says nope" });
  });

  it("429 après trop de requêtes sur la même IP (rate limit)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => "",
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/waitlist/route");

    const ip = "9.9.9.9";

    // On tente jusqu'à tomber sur 429 (max 50 pour éviter boucle infinie)
    let blocked: Response | null = null;

    for (let i = 1; i <= 50; i++) {
        const res = await POST(makeReq({ email: `t${i}@site.com`, company: "" }, ip));

        if (res.status === 429) {
        blocked = res;
        break;
        }

        expect(res.status).toBe(200);
    }

    expect(blocked).not.toBeNull();

    const data = await readJson(blocked!);
    expect(data).toEqual({ error: "Trop de tentatives. Reviens plus tard." });

    expect(blocked!.headers.get("Retry-After")).toBeTruthy();
    });

    it("rate limit isolé par IP (2 IP différentes)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => "",
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/waitlist/route");

    const ipA = "10.0.0.1";
    const ipB = "10.0.0.2";

    // On bloque IP A
    let blockedA: Response | null = null;

    for (let i = 1; i <= 50; i++) {
        const res = await POST(makeReq({ email: `a${i}@site.com`, company: "" }, ipA));
        if (res.status === 429) {
        blockedA = res;
        break;
        }
        expect(res.status).toBe(200);
    }

    expect(blockedA).not.toBeNull();

    // IP B doit passer
    const okB = await POST(makeReq({ email: "b1@site.com", company: "" }, ipB));
    expect(okB.status).toBe(200);
    });
});
