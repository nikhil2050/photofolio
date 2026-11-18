import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/profile";
  redirectTo.search = "";

  if (!code) return NextResponse.redirect(new URL("/sign-in", request.url));

  const response = NextResponse.redirect(redirectTo);
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) =>
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        ),
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error
    ? NextResponse.redirect(new URL("/sign-in", request.url))
    : response;
}
