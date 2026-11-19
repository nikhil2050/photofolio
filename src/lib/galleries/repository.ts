import { AppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";
import type {
  GalleryInput,
  GalleryListFilters,
} from "@/lib/validation/gallery";
import { createShareToken, hashGalleryPassword, hashShareToken } from "@/lib/galleries/share-security";
import type { AccessMode } from "@/lib/validation/gallery-sharing";

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

export type GallerySharingState = {
  status: "draft" | "published" | "archived";
  accessMode: AccessMode;
  publishedAt: string | null;
  hasShareLink: boolean;
  shareTokenVersion: number;
};

export type PublishReadiness = {
  canPublish: boolean;
  issues: string[];
  readyPhotoCount: number;
  processingPhotoCount: number;
  failedPhotoCount: number;
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

/** Reads only owner-safe sharing metadata; never return token or password hashes. */
export async function getGallerySharingState(profileId: string, galleryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .select("status, access_mode, published_at, share_token_hash, share_token_version")
    .eq("id", galleryId)
    .eq("photographer_profile_id", profileId)
    .maybeSingle();
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not load sharing settings.");
  if (!data) return null;
  return {
    status: data.status as GallerySharingState["status"],
    accessMode: data.access_mode as AccessMode,
    publishedAt: data.published_at as string | null,
    hasShareLink: Boolean(data.share_token_hash),
    shareTokenVersion: data.share_token_version as number,
  } satisfies GallerySharingState;
}

/** Publishing requirements are calculated from real private data, not UI state. */
export async function getGalleryPublishReadiness(profileId: string, galleryId: string): Promise<PublishReadiness | null> {
  const supabase = await createClient();
  const [{ data: gallery, error: galleryError }, { data: profile, error: profileError }, { data: photos, error: photosError }] = await Promise.all([
    supabase.from("galleries").select("title").eq("id", galleryId).eq("photographer_profile_id", profileId).maybeSingle(),
    supabase.from("photographer_profiles").select("display_name, whatsapp_number, booking_cta_url").eq("id", profileId).maybeSingle(),
    supabase.from("photos").select("processing_status").eq("gallery_id", galleryId),
  ]);
  if (galleryError || profileError || photosError) throw new AppError("GALLERY_UNAVAILABLE", "We could not check publishing readiness.");
  if (!gallery || !profile) return null;
  const statuses = (photos ?? []).map((photo) => photo.processing_status as string);
  const readyPhotoCount = statuses.filter((status) => status === "ready").length;
  const processingPhotoCount = statuses.filter((status) => status === "pending" || status === "processing").length;
  const failedPhotoCount = statuses.filter((status) => status === "failed").length;
  const issues: string[] = [];
  if (!gallery.title.trim()) issues.push("Add a gallery title.");
  if (readyPhotoCount === 0) issues.push("Add at least one processed photograph.");
  if (processingPhotoCount > 0) issues.push("Wait for all photographs to finish processing.");
  if (failedPhotoCount > 0) issues.push("Retry or remove failed photographs before publishing.");
  if (!profile.display_name?.trim()) issues.push("Add your studio display name in Profile.");
  if (!profile.whatsapp_number && !profile.booking_cta_url) issues.push("Add a WhatsApp number or booking link in Profile so clients can contact you.");
  return { canPublish: issues.length === 0, issues, readyPhotoCount, processingPhotoCount, failedPhotoCount };
}

export async function publishOwnedGallery(input: { profileId: string; galleryId: string; accessMode: AccessMode; password?: string }) {
  const readiness = await getGalleryPublishReadiness(input.profileId, input.galleryId);
  if (!readiness || !readiness.canPublish) return { readiness, shareToken: null };
  const supabase = await createClient();
  const { data: gallery, error: readError } = await supabase
    .from("galleries")
    .select("status, share_token_hash, share_token_version")
    .eq("id", input.galleryId)
    .eq("photographer_profile_id", input.profileId)
    .single();
  if (readError || !gallery) throw new AppError("GALLERY_UNAVAILABLE", "We could not publish this gallery.");
  // Only a hash is persisted, so an existing raw token cannot be recovered.
  // Preserve it on republish; the owner can explicitly rotate to get a new URL.
  const shareToken = gallery.share_token_hash ? null : createShareToken();
  const passwordHash = input.accessMode === "password" && input.password ? await hashGalleryPassword(input.password) : null;
  const { error } = await supabase.from("galleries").update({
    status: "published",
    access_mode: input.accessMode,
    password_hash: passwordHash,
    share_token_hash: shareToken ? hashShareToken(shareToken) : gallery.share_token_hash,
    share_token_version: shareToken ? (gallery.share_token_version as number) + 1 : gallery.share_token_version,
    published_at: new Date().toISOString(),
    archived_at: null,
  }).eq("id", input.galleryId).eq("photographer_profile_id", input.profileId);
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not publish this gallery.");
  return { readiness, shareToken };
}

export async function updateOwnedGalleryAccess(input: { profileId: string; galleryId: string; accessMode: AccessMode; password?: string }) {
  const supabase = await createClient();
  const passwordHash = input.accessMode === "password" && input.password ? await hashGalleryPassword(input.password) : null;
  const { data, error } = await supabase.from("galleries").update({
    access_mode: input.accessMode,
    password_hash: passwordHash,
  }).eq("id", input.galleryId).eq("photographer_profile_id", input.profileId).select("id").maybeSingle();
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not update sharing access.");
  return Boolean(data);
}

export async function rotateOwnedGalleryShareLink(profileId: string, galleryId: string) {
  const supabase = await createClient();
  const { data: gallery, error: readError } = await supabase.from("galleries").select("status, share_token_version").eq("id", galleryId).eq("photographer_profile_id", profileId).maybeSingle();
  if (readError) throw new AppError("GALLERY_UNAVAILABLE", "We could not rotate the share link.");
  if (!gallery || gallery.status !== "published") return null;
  const shareToken = createShareToken();
  const { error } = await supabase.from("galleries").update({ share_token_hash: hashShareToken(shareToken), share_token_version: (gallery.share_token_version as number) + 1 }).eq("id", galleryId).eq("photographer_profile_id", profileId);
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not rotate the share link.");
  return shareToken;
}

export async function unpublishOwnedGallery(profileId: string, galleryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("galleries").update({ status: "draft" }).eq("id", galleryId).eq("photographer_profile_id", profileId).select("id").maybeSingle();
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not disable sharing.");
  return Boolean(data);
}

export async function archiveOwnedGallery(profileId: string, galleryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("galleries").update({ status: "archived", share_token_hash: null, archived_at: new Date().toISOString() }).eq("id", galleryId).eq("photographer_profile_id", profileId).select("id").maybeSingle();
  if (error) throw new AppError("GALLERY_UNAVAILABLE", "We could not archive this gallery.");
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
