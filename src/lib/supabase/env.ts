import { z } from "zod";
import { AppError } from "../errors/app-error";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(
    "NEXT_PUBLIC_SUPABASE_URL must be a valid URL.",
  ),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."),
});

/** Validates only variables explicitly safe to bundle in browser code. */
export function validatePublicEnv() {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path[0])),
    ]
      .filter((field): field is string => typeof field === "string")
      .join(", ");
    throw new AppError(
      "CONFIGURATION_INVALID",
      `Missing or invalid public configuration: ${fields}. Update .env.local or the deployment environment.`,
    );
  }

  return {
    url: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

export function getSupabaseEnv() {
  return validatePublicEnv();
}
