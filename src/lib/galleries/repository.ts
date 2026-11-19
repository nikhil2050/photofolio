import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";
import type {
  GalleryInput,
  GalleryListFilters,
} from "@/lib/validation/gallery";

const GALLERY_PAGE_SIZE = 24;

export type GalleryListItem = {
  id: string;
  title: string;
  client_name: string | null;
  status: "draft" | "published" | "archived";
  updated_at: string;
  cover_photo_id: string | null;
  ready_photo_count: number;
};

export type GalleryListResult = {
  galleries: GalleryListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type OwnedGallery = Pick<
  GalleryListItem,
  "id" | "title" | "client_name" | "status" | "updated_at" | "cover_photo_id"
> & {
  description: string | null;
  event_date: string | null;
  location: string | null;
};

/**
 * Reads a photographer's library under the existing gallery RLS policy. The
 * profile ID comes from the signed-in user's profile, never from URL input.
 */
export async function listGalleries(
  photographerProfileId: string,
  filters: GalleryListFilters,
): Promise<GalleryListResult> {
  const supabase = await createClient();
  const start = (filters.page - 1) * GALLERY_PAGE_SIZE;
  const end = start + GALLERY_PAGE_SIZE - 1;
  let query = supabase
    .from("galleries")
    .select("id, title, client_name, status, updated_at, cover_photo_id", {
      count: "exact",
    })
    .eq("photographer_profile_id", photographerProfileId)
    .order("updated_at", { ascending: false })
    .range(start, end);

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    query = query.or(`title.ilike.${pattern},client_name.ilike.${pattern}`);
  }

  const { data, error, count } = await query;
  if (error) {
    logger.error("galleries.list_failed", {
      errorCode: "GALLERIES_UNAVAILABLE",
      operation: "gallery_list",
    });
    throw new AppError(
      "GALLERIES_UNAVAILABLE",
      "We could not load your galleries.",
    );
  }

  const galleries = (data ?? []) as Omit<
    GalleryListItem,
    "ready_photo_count"
  >[];
  const galleryIds = galleries.map((gallery) => gallery.id);
  const readyPhotoCounts = await getReadyPhotoCounts(galleryIds);

  return {
    galleries: galleries.map((gallery) => ({
      ...gallery,
      ready_photo_count: readyPhotoCounts.get(gallery.id) ?? 0,
    })),
    totalCount: count ?? 0,
    page: filters.page,
    pageSize: GALLERY_PAGE_SIZE,
  };
}

/** Creates a private draft for the authenticated photographer's own profile. */
export async function createDraftGallery(
  photographerProfileId: string,
  input: GalleryInput,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .insert({
      photographer_profile_id: photographerProfileId,
      title: input.title,
      client_name: input.clientName ?? null,
      description: input.description ?? null,
      event_date: input.eventDate ?? null,
      location: input.location ?? null,
      status: "draft",
      visibility: "private",
    })
    .select("id")
    .single();

  if (error || !data) {
    logger.error("galleries.create_failed", {
      errorCode: "GALLERY_CREATE_FAILED",
      operation: "gallery_create",
    });
    throw new AppError(
      "GALLERY_CREATE_FAILED",
      "We could not create your gallery. Please try again.",
    );
  }

  return data.id as string;
}

/** Fetches one gallery only when it remains visible through photographer RLS. */
export async function getOwnedGallery(
  photographerProfileId: string,
  galleryId: string,
): Promise<OwnedGallery | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .select(
      "id, title, client_name, status, updated_at, cover_photo_id, description, event_date, location",
    )
    .eq("id", galleryId)
    .eq("photographer_profile_id", photographerProfileId)
    .maybeSingle();

  if (error) {
    logger.error("galleries.read_failed", {
      errorCode: "GALLERY_UNAVAILABLE",
      operation: "gallery_read",
    });
    throw new AppError(
      "GALLERY_UNAVAILABLE",
      "We could not load this gallery.",
    );
  }

  return data as OwnedGallery | null;
}

/** Updates only editor fields; ownership is enforced again by RLS and profile ID. */
export async function updateOwnedGallery(
  photographerProfileId: string,
  galleryId: string,
  input: GalleryInput,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .update({
      title: input.title,
      client_name: input.clientName ?? null,
      description: input.description ?? null,
      event_date: input.eventDate ?? null,
      location: input.location ?? null,
    })
    .eq("id", galleryId)
    .eq("photographer_profile_id", photographerProfileId)
    .select("id")
    .maybeSingle();
  if (error) {
    logger.error("galleries.update_failed", { errorCode: "GALLERY_UNAVAILABLE", operation: "gallery_update" });
    throw new AppError("GALLERY_UNAVAILABLE", "We could not save this gallery.");
  }
  return Boolean(data);
}

export async function setOwnedGalleryCover(
  photographerProfileId: string,
  galleryId: string,
  photoId: string | null,
) {
  const supabase = await createClient();
  if (photoId) {
    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .select("id")
      .eq("id", photoId)
      .eq("gallery_id", galleryId)
      .eq("processing_status", "ready")
      .maybeSingle();
    if (photoError) throw new AppError("PHOTO_UNAVAILABLE", "We could not update the cover photograph.");
    if (!photo) return false;
  }
  const { data, error } = await supabase
    .from("galleries")
    .update({ cover_photo_id: photoId })
    .eq("id", galleryId)
    .eq("photographer_profile_id", photographerProfileId)
    .select("id")
    .maybeSingle();
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not update the cover photograph.");
  return Boolean(data);
}

async function getReadyPhotoCounts(galleryIds: string[]) {
  if (galleryIds.length === 0) return new Map<string, number>();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("gallery_id")
    .in("gallery_id", galleryIds)
    .eq("processing_status", "ready");

  if (error) {
    logger.error("galleries.ready_photo_count_failed", {
      errorCode: "GALLERIES_UNAVAILABLE",
      operation: "gallery_ready_photo_count",
    });
    throw new AppError(
      "GALLERIES_UNAVAILABLE",
      "We could not load your galleries.",
    );
  }

  return (data ?? []).reduce((counts, photo) => {
    const galleryId = photo.gallery_id as string;
    counts.set(galleryId, (counts.get(galleryId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export { GALLERY_PAGE_SIZE };
