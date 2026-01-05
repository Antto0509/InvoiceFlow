import { NextResponse, type NextRequest } from "next/server";
import { createClientMiddleware } from "@/data/supabase/middleware";

const AUTH_PAGES = new Set(["/login", "/register", "/reset-password"]);
const MAINTENANCE_PATH = "/maintenance";

/** 
 * Flag simple : uniquement en prod + env activée
 * @return boolean
 */
function shouldHideAuthPages() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.HIDE_AUTH_PAGES_IN_PROD === "true"
  );
}

/**
 * Copie les cookies (notamment Supabase) de la réponse "source"
 * vers une nouvelle réponse (redirect/rewrite).
 * @param from La réponse source.
 * @param to La nouvelle réponse.
 * @return La nouvelle réponse avec les cookies copiés.
 */
function copyCookies(from: NextResponse, to: NextResponse) {
  for (const c of from.cookies.getAll()) {
    to.cookies.set(c);
  }
  return to;
}

export async function middleware(req: NextRequest) {
  const { supabase, supabaseResponse } = createClientMiddleware(req);
  const { pathname, search } = req.nextUrl;

  // On récupère l'utilisateur une seule fois
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hideAuth = shouldHideAuthPages();

  // 0) Ne jamais bloquer la page de maintenance (sinon boucle)
  if (pathname === MAINTENANCE_PATH) {
    return supabaseResponse;
  }

  // 1) Protection des routes /dashboard
  if (pathname.startsWith("/dashboard")) {
    // Si pas connecté -> en prod on camoufle (maintenance), sinon login normal
    if (!user) {
      const url = req.nextUrl.clone();

      if (hideAuth) {
        url.pathname = MAINTENANCE_PATH;
        // Optionnel: garder une trace de la route demandée
        url.searchParams.set("from", `${pathname}${search || ""}`);

        const res = NextResponse.redirect(url);
        return copyCookies(supabaseResponse, res);
      }

      // Mode dev/staging: on redirige vers /login avec redirectTo
      url.pathname = "/login";
      const redirectTo = `${pathname}${search}`;
      url.searchParams.set("redirectTo", redirectTo);

      const res = NextResponse.redirect(url);
      return copyCookies(supabaseResponse, res);
    }

    // Si connecté -> on mémorise la dernière page dashboard
    const res = supabaseResponse;
    const lastDashboardPath = `${pathname}${search || ""}`;

    res.cookies.set("lastDashboardPath", lastDashboardPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      httpOnly: false,
    });

    return res;
  }

  // 2) Camouflage des pages d’auth en prod (si pas connecté)
  if (hideAuth && AUTH_PAGES.has(pathname) && !user) {
    // REWRITE = garde l’URL (/login) mais affiche le contenu /maintenance
    const url = req.nextUrl.clone();
    url.pathname = MAINTENANCE_PATH;
    url.searchParams.set("from", `${pathname}${search || ""}`);

    const res = NextResponse.rewrite(url);
    return copyCookies(supabaseResponse, res);
  }

  // 3) Pages d'auth : si déjà connecté, on redirige intelligemment
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
      target = redirectToParam;
    } else if (lastDashboardPath && lastDashboardPath.startsWith("/dashboard")) {
      target = lastDashboardPath;
    } else {
      target = "/dashboard";
    }

    const res = NextResponse.redirect(new URL(target, req.url));
    return copyCookies(supabaseResponse, res);
  }

  // 4) Pour le reste, on laisse couler
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
