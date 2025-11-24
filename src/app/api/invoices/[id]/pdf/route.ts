import { NextResponse } from "next/server";
import { getOrCreateSignedInvoicePdfUrl } from "@/features/documents/hooks/signInvoicePdf";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;

    const urlObj = new URL(req.url);
    const force = urlObj.searchParams.get("force") === "1";
    const ttlParam = urlObj.searchParams.get("ttl");
    const redirect = urlObj.searchParams.get("redirect") !== "0"; // default true
    const expiresIn = Math.max(30, Math.min(3600, Number(ttlParam) || 300));

    const signedUrl = await getOrCreateSignedInvoicePdfUrl(id, { expiresIn, force });

    if (redirect) {
      return NextResponse.redirect(signedUrl, { status: 302 });
    }
    return NextResponse.json({ url: signedUrl });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : typeof e === "string" ? e : String(e);

    const msg =
      errorMessage === "Unauthorized" ? "Non authentifié"
      : errorMessage === "Not found" ? "Facture introuvable"
      : errorMessage || "Erreur génération/signature PDF";

    const code = msg === "Non authentifié" ? 401
               : msg === "Facture introuvable" ? 404
               : 400;

    return NextResponse.json({ error: msg }, { status: code });
  }
}