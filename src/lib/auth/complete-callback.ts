import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Establishes a cookie-backed session after a Supabase email confirmation.
 *
 * Supabase can return either a PKCE code or a token hash, depending on the
 * configured email template. Supporting both keeps confirmation reliable when
 * a project switches templates without opening a broader verification surface.
 */
export async function completeAuthCallback(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const successUrl = new URL("/profile", request.url);
  const failureUrl = new URL("/sign-in", request.url);
  failureUrl.searchParams.set("error", "confirmation");

  if (!code && !tokenHash) return NextResponse.redirect(failureUrl);

  const response = NextResponse.redirect(successUrl);
  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: "email" });

  return error ? NextResponse.redirect(failureUrl) : response;
}
