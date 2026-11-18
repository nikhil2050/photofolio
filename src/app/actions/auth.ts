"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema } from "@/lib/validation/auth";

export type FormState = { error?: string; message?: string };

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signIn(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "We could not sign you in with those details." };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin ?? "http://localhost:3000"}/auth/confirm`,
    },
  });

  if (error)
    return {
      error: "We could not create your account. Try a different email address.",
    };
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
