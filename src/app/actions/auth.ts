"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeInternalRedirect } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, signUpSchema } from "@/lib/validation/auth";

type AuthField = "email" | "password" | "confirmPassword";

export type FormState = {
  formError?: string;
  message?: string;
  fieldErrors?: Partial<Record<AuthField, string>>;
};

function parseSignIn(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

function parseSignUp(formData: FormData) {
  return signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
}

export async function signIn(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseSignIn(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { formError: "We could not sign you in with those details." };
  }

  revalidatePath("/", "layout");
  redirect(safeInternalRedirect(formData.get("next")));
}

export async function signUp(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = parseSignUp(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      },
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: `${origin ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return {
      formError: "We could not create your account. Please try again.",
    };
  }
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
