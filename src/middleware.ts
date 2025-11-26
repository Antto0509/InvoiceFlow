import { NextResponse, type NextRequest } from "next/server";
import { createClientMiddleware } from "@/data/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { supabase, supabaseResponse } = createClientMiddleware(req);
  const { pathname, search } = req.nextUrl;

  // On récupère l'utilisateur une seule fois
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1) Protection des routes /dashboard
  if (pathname.startsWith("/dashboard")) {
    // Si pas connecté -> on redirige vers /login avec redirectTo
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";

      const redirectTo = `${pathname}${search}`;
      url.searchParams.set("redirectTo", redirectTo);

      return NextResponse.redirect(url);
    }

    // Si connecté -> on mémorise la dernière page dashboard
    const res = supabaseResponse;
    const lastDashboardPath = `${pathname}${search || ""}`;

    res.cookies.set("lastDashboardPath", lastDashboardPath, {
      path: "/",        // dispo partout
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      httpOnly: false,  // tu peux mettre true si tu veux que ce soit only server
    });

    return res;
  }

  // 2) Pages d'auth : si déjà connecté, on redirige intelligemment
  const isAuthPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password";

  if (isAuthPage && user) {
    const redirectToParam = req.nextUrl.searchParams.get("redirectTo");
    const lastDashboardPath = req.cookies.get("lastDashboardPath")?.value;

    let target: string;

    if (redirectToParam && redirectToParam.startsWith("/")) {
      // Priorité à redirectTo si présent
      target = redirectToParam;
    } else if (
      lastDashboardPath &&
      lastDashboardPath.startsWith("/dashboard")
    ) {
      // Sinon, on utilise la dernière page dashboard visitée
      target = lastDashboardPath;
    } else {
      // Fallback
      target = "/dashboard";
    }

    return NextResponse.redirect(new URL(target, req.url));
  }

  // 3) Pour le reste, on laisse couler
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
