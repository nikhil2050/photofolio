import { createClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

/** Returns only the signed-in photographer's gallery total under RLS. */
export async function getGalleryCount(photographerProfileId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("galleries")
    .select("id", { count: "exact", head: true })
    .eq("photographer_profile_id", photographerProfileId);

  if (error) {
    logger.error("dashboard.gallery_count_failed", {
      errorCode: "GALLERY_COUNT_UNAVAILABLE",
      operation: "gallery_count",
    });
    throw new AppError(
      "GALLERY_COUNT_UNAVAILABLE",
      "We could not load your gallery count.",
    );
  }
  return count ?? 0;
}
