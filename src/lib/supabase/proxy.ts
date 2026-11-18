import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

const protectedPaths = ["/dashboard", "/profile"];
const authPaths = ["/sign-in", "/sign-up"];

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function redirectWithSession(response: NextResponse, url: URL) {
  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  response.headers.forEach((value, name) => {
    redirectResponse.headers.set(name, value);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return response;
  }
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  // getClaims validates/refreshes the token. Do not trust getSession() for access control.
  const { data: token, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && typeof token?.claims.sub === "string";
  const { pathname } = request.nextUrl;

  if (
    protectedPaths.some((path) => matchesRoute(pathname, path)) &&
    !isAuthenticated
  ) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return redirectWithSession(response, signInUrl);
  }

  if (
    authPaths.some((path) => matchesRoute(pathname, path)) &&
    isAuthenticated
  ) {
    return redirectWithSession(response, new URL("/dashboard", request.url));
  }

  return response;
}
