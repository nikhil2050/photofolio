import { createClient } from "@/lib/supabase/server";

/** Returns only the signed-in photographer's gallery total under RLS. */
export async function getGalleryCount(photographerProfileId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("galleries")
    .select("id", { count: "exact", head: true })
    .eq("photographer_profile_id", photographerProfileId);

  if (error) throw new Error("Unable to load gallery count.");
  return count ?? 0;
}
