import { logger } from "@/lib/logging/logger";
import { ORIGINAL_PHOTOS_BUCKET, PREVIEW_IMAGES_BUCKET } from "@/lib/photos/config";
import { processPhoto, InvalidPhotoError } from "@/lib/photos/processing";
import { setPhotoFailed, setPhotoProcessing, setPhotoReady, type OwnedPhoto } from "@/lib/photos/repository";
import { createClient } from "@/lib/supabase/server";

export function derivativePaths(userId: string, galleryId: string, photoId: string) {
  const prefix = `${userId}/${galleryId}/${photoId}`;
  return { previewPath: `${prefix}/preview.webp`, thumbnailPath: `${prefix}/thumbnail.webp` };
}

/**
 * Originals stay untouched. This server-only operation reads one private
 * original under the photographer's RLS session, creates metadata-free WebP
 * derivatives, then makes the record ready only after both writes succeed.
 */
export async function createPhotoDerivatives(userId: string, photo: OwnedPhoto) {
  const supabase = await createClient();
  const paths = derivativePaths(userId, photo.gallery_id, photo.id);
  try {
    await setPhotoProcessing(photo.id);
    const { data: original, error: downloadError } = await supabase.storage
      .from(ORIGINAL_PHOTOS_BUCKET)
      .download(photo.original_storage_path);
    if (downloadError || !original) {
      return fail(photo.id, "original_unavailable", "The original upload could not be read.");
    }
    const bytes = new Uint8Array(await original.arrayBuffer());
    const derivatives = await processPhoto(bytes, photo.mime_type, photo.file_name);
    const [previewResult, thumbnailResult] = await Promise.all([
      supabase.storage.from(PREVIEW_IMAGES_BUCKET).upload(paths.previewPath, derivatives.preview, { contentType: "image/webp", upsert: true }),
      supabase.storage.from(PREVIEW_IMAGES_BUCKET).upload(paths.thumbnailPath, derivatives.thumbnail, { contentType: "image/webp", upsert: true }),
    ]);
    if (previewResult.error || thumbnailResult.error) throw new Error("derivative_write_failed");
    await setPhotoReady({ id: photo.id, previewPath: paths.previewPath, thumbnailPath: paths.thumbnailPath, width: derivatives.width, height: derivatives.height });
    return { ok: true as const };
  } catch (error) {
    await supabase.storage.from(PREVIEW_IMAGES_BUCKET).remove([paths.previewPath, paths.thumbnailPath]);
    if (error instanceof InvalidPhotoError) {
      await supabase.storage.from(ORIGINAL_PHOTOS_BUCKET).remove([photo.original_storage_path]);
      return fail(photo.id, "invalid_image", error.message);
    }
    logger.error("photos.processing_failed", {
      errorCode: "UNEXPECTED",
      operation: "photo_processing",
      // A short stage identifier is safe to log; raw provider errors are not.
      failureStage: error instanceof Error ? error.name : "unknown",
    });
    return fail(photo.id, "processing_failed", "We kept the original safely. You can retry processing.");
  }
}

async function fail(photoId: string, code: string, message: string) {
  await setPhotoFailed(photoId, code, message);
  return { ok: false as const, message };
}
