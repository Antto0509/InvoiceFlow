import { NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { createClientServer } from "@/data/supabase";
import { getOrCreateSignedDocumentPdfUrl } from "@/features/documents/hooks/signDocumentPdf";

export const runtime = "nodejs";

// Type pour le contexte avec les params
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const supabase = createClientServer();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Rate limit : 30 générations PDF par 5 minutes et par utilisateur
  if (!checkRateLimit(`pdf:${user.id}`, 30, 5 * 60 * 1000)) {
    return rateLimitResponse(300);
  }

  try {
    const { id } = await ctx.params;

    const urlObj = new URL(req.url);

    const force = urlObj.searchParams.get("force") === "1";
    const ttlParam = urlObj.searchParams.get("ttl");
    const redirect = urlObj.searchParams.get("redirect") !== "0"; // default true
    const expiresIn = Math.max(30, Math.min(3600, Number(ttlParam) || 300));

    const signedUrl = await getOrCreateSignedDocumentPdfUrl(id, {
      expiresIn,
      force,
    });

    if (redirect) {
      return NextResponse.redirect(signedUrl, { status: 302 });
    }

    return NextResponse.json({ url: signedUrl });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : typeof e === "string" ? e : String(e);

    const msg =
      errorMessage === "Unauthorized"
        ? "Non authentifié"
        : errorMessage === "Not found"
        ? "Document introuvable"
        : errorMessage === "Forbidden"
        ? "Accès interdit"
        : errorMessage || "Erreur génération/signature PDF";

    const code =
      msg === "Non authentifié"
        ? 401
        : msg === "Document introuvable"
        ? 404
        : msg === "Accès interdit"
        ? 403
        : 400;

    return NextResponse.json({ error: msg }, { status: code });
  }
}
