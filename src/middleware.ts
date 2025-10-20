import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/data/supabase/middleware";

export async function middleware(req: NextRequest) {
  const { supabase, supabaseResponse } = createClient(req);

  // Protection des routes /app
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirection depuis /login si l'utilisateur est déjà connecté
  if (req.nextUrl.pathname === "/login") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
