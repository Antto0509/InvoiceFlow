import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseUrl, supabaseKey } from "./const";

export const createClientMiddleware = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Met à jour la requête
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          // Et la réponse (celle qu’on return du middleware)
          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, {
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
              ...options,
            });
          });
        },
      },
    },
  );

  return { supabase, supabaseResponse };
};
