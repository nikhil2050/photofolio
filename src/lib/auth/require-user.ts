import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data: token, error } = await supabase.auth.getClaims();

  if (error || typeof token?.claims.sub !== "string") redirect("/sign-in");
  return { id: token.claims.sub };
}

/** Redirect signed-in people away from public authentication screens. */
export async function redirectIfAuthenticated() {
  const supabase = await createClient();
  const { data: token, error } = await supabase.auth.getClaims();

  if (!error && typeof token?.claims.sub === "string") redirect("/dashboard");
}
