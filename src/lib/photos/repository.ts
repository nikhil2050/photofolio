import { AppError, type AppErrorCode } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";

export type OwnedPhoto = {
  id: string;
  gallery_id: string;
  original_storage_path: string;
  mime_type: "image/jpeg" | "image/png" | "image/webp";
  file_name: string;
  preview_storage_path: string | null;
  thumbnail_storage_path: string | null;
  processing_status: "pending" | "processing" | "ready" | "failed";
};

export async function createPendingPhoto(input: {
  id: string;
  galleryId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  originalStoragePath: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("photos").insert({
    id: input.id,
    gallery_id: input.galleryId,
    file_name: input.fileName,
    mime_type: input.mimeType,
    file_size_bytes: input.fileSizeBytes,
    original_storage_path: input.originalStoragePath,
    // A gallery has a unique (gallery_id, sort_order) constraint. A server-
    // generated slot prevents parallel uploads from all colliding at 0.
    sort_order: Math.floor(Math.random() * 2_000_000_000),
    processing_status: "pending",
  });
  if (error) throw photoError("photos.create_pending_failed", "PHOTO_CREATE_FAILED", error);
}

/** RLS and the profile-scoped join prevent URL IDs granting photo access. */
export async function getOwnedPhoto(profileId: string, galleryId: string, photoId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, gallery_id, original_storage_path, mime_type, file_name, preview_storage_path, thumbnail_storage_path, processing_status, galleries!inner(photographer_profile_id)")
    .eq("id", photoId)
    .eq("gallery_id", galleryId)
    .eq("galleries.photographer_profile_id", profileId)
    .maybeSingle();
  if (error) throw photoError("photos.read_failed", "PHOTO_UNAVAILABLE");
  return data as OwnedPhoto | null;
}

export async function setPhotoProcessing(photoId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("photos")
    .update({ processing_status: "processing", processing_error_code: null, processing_error_message: null })
    .eq("id", photoId);
  if (error) throw photoError("photos.set_processing_failed", "PHOTO_UPDATE_FAILED");
}

export async function setPhotoReady(input: { id: string; previewPath: string; thumbnailPath: string; width: number; height: number }) {
  const supabase = await createClient();
  const { error } = await supabase.from("photos").update({
    processing_status: "ready",
    preview_storage_path: input.previewPath,
    thumbnail_storage_path: input.thumbnailPath,
    width: input.width,
    height: input.height,
    processing_error_code: null,
    processing_error_message: null,
  }).eq("id", input.id);
  if (error) throw photoError("photos.set_ready_failed", "PHOTO_UPDATE_FAILED");
}

export async function setPhotoFailed(photoId: string, code: string, message: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("photos").update({
    processing_status: "failed", processing_error_code: code, processing_error_message: message,
  }).eq("id", photoId);
  if (error) logger.error("photos.set_failed_failed", { errorCode: "UNEXPECTED", operation: "photo_set_failed" });
}

export async function deleteOwnedPhoto(profileId: string, galleryId: string, photoId: string) {
  const photo = await getOwnedPhoto(profileId, galleryId, photoId);
  if (!photo) return null;
  const supabase = await createClient();
  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) throw photoError("photos.delete_failed", "PHOTO_DELETE_FAILED");
  return photo;
}

function photoError(event: string, code: AppErrorCode, providerError?: { code?: string }) {
  logger.error(event, {
    errorCode: code,
    operation: "photo_repository",
    providerCode: providerError?.code,
  });
  return new AppError(code, "We could not update this photograph. Please try again.");
}
