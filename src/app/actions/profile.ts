"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validation/profile";

export type ProfileFormState = { error?: string; success?: string };

export async function saveProfile(
  _: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    contactPhone: formData.get("contactPhone") || undefined,
    avatarPath: formData.get("avatarPath") || undefined,
    bookingUrl: formData.get("bookingUrl"),
    bookingCtaLabel: formData.get("bookingCtaLabel") || undefined,
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
  const { error } = await supabase.from("photographer_profiles").upsert(
    {
      user_id: user.id,
      display_name: parsed.data.displayName,
      whatsapp_number: parsed.data.contactPhone ?? null,
      avatar_path: parsed.data.avatarPath ?? null,
      booking_cta_url: parsed.data.bookingUrl ?? null,
      booking_cta_label: parsed.data.bookingCtaLabel || "Book a shoot",
    },
    { onConflict: "user_id" },
  );

  if (error)
    return { error: "We could not save your profile. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Your profile has been saved." };
}
