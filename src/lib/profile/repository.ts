import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

export type PhotographerProfile = {
  id: string;
  display_name: string | null;
  avatar_path: string | null;
  whatsapp_number: string | null;
  booking_cta_url: string | null;
  booking_cta_label: string;
  setup_completed_at: string | null;
};

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photographer_profiles")
    .select(
      "id, display_name, avatar_path, whatsapp_number, booking_cta_url, booking_cta_label, setup_completed_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    logger.error("profile.read_failed", {
      errorCode: "PROFILE_UNAVAILABLE",
      operation: "profile_read",
    });
    throw new AppError(
      "PROFILE_UNAVAILABLE",
      "We could not load your studio profile.",
    );
  }
  return data as PhotographerProfile | null;
}
