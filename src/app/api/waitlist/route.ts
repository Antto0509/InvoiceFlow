import { NextResponse } from "next/server";
import { isValidEmail, getIp, rateLimit, MAX_REQ } from "@/lib/index";

export async function POST(req: Request) {
  try {
    const ip = getIp(req);

    const body = (await req.json()) as { email?: string; company?: string };
    const email = (body.email ?? "").trim().toLowerCase();
    const honeypot = (body.company ?? "").trim();

    // Honeypot: si rempli -> on fait comme si c'était OK (pas d'info au bot)
    if (honeypot) {
      return new NextResponse(null, { status: 204 });
    }

    // Rate limit
    const rl = rateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Reviens plus tard." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rl.retryAfterSec),
            "X-RateLimit-Limit": String(MAX_REQ),
            "X-RateLimit-Remaining": String(rl.remaining),
          },
        }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const listId = Number(process.env.BREVO_WAITLIST_ID);

    if (!apiKey || !Number.isFinite(listId)) {
      return NextResponse.json(
        { error: "Brevo mal configuré côté serveur" },
        { status: 500 }
      );
    }

    // Create/update contact + add to list
    const r = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json(
        { error: "Brevo error", details: txt },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: true },
      {
        headers: {
          "X-RateLimit-Limit": String(MAX_REQ),
          "X-RateLimit-Remaining": String(rl.remaining),
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}