import { createClient } from "@/lib/supabase/server";

export type PhotographerProfile = {
  display_name: string | null;
  avatar_path: string | null;
  whatsapp_number: string | null;
  booking_cta_url: string | null;
  booking_cta_label: string;
};

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photographer_profiles")
    .select(
      "display_name, avatar_path, whatsapp_number, booking_cta_url, booking_cta_label",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Unable to load your studio profile.");
  return data as PhotographerProfile | null;
}
