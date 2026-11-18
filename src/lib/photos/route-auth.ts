import { getProfile } from "@/lib/profile/repository";
import { createClient } from "@/lib/supabase/server";

/** Returns a server-verified user and completed profile for API route ownership checks. */
export async function requireUserFromRequest() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (error || typeof userId !== "string") return null;
  const profile = await getProfile(userId);
  if (!profile?.setup_completed_at) return null;
  return { supabase, userId, profile };
}
