"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileFormState = { error?: string; success?: string };

export async function saveProfile(
  _: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const skipOptionalDetails = formData.get("intent") === "skip-optional";
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    contactPhone: skipOptionalDetails
      ? undefined
      : formData.get("contactPhone") || undefined,
    avatarPath: skipOptionalDetails
      ? undefined
      : formData.get("avatarPath") || undefined,
    bookingUrl: skipOptionalDetails ? undefined : formData.get("bookingUrl"),
    bookingCtaLabel: skipOptionalDetails
      ? undefined
      : formData.get("bookingCtaLabel") || undefined,
  });

  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const user = await requireUser();
  if (
    parsed.data.avatarPath &&
    !parsed.data.avatarPath.startsWith(`${user.id}/`)
  ) {
    return { error: "The uploaded logo could not be verified." };
  }
  const supabase = await createClient();
  const { data: existingProfile } = await supabase
    .from("photographer_profiles")
    .select("avatar_path")
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("photographer_profiles").upsert(
    {
      user_id: user.id,
      display_name: parsed.data.displayName,
      whatsapp_number: parsed.data.contactPhone ?? null,
      avatar_path: parsed.data.avatarPath ?? null,
      booking_cta_url: parsed.data.bookingUrl ?? null,
      booking_cta_label: parsed.data.bookingCtaLabel || "Check availability",
    },
    { onConflict: "user_id" },
  );

  if (error)
    return { error: "We could not save your profile. Please try again." };

  // Profile data is authoritative. A cleanup failure should not undo a save.
  if (
    existingProfile?.avatar_path &&
    existingProfile.avatar_path !== parsed.data.avatarPath
  ) {
    await supabase.storage
      .from("preview-images")
      .remove([existingProfile.avatar_path]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/dashboard");
}
