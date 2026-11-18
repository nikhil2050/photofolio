import { NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logging/logger";
import { ORIGINAL_PHOTOS_BUCKET } from "@/lib/photos/config";
import { createPendingPhoto, deleteOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { getOwnedGallery } from "@/lib/galleries/repository";
import { uploadIntentSchema, extensionForMimeType, sanitizeDisplayFileName } from "@/lib/validation/photo";

export async function POST(request: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  try {
    const auth = await requireUserFromRequest();
    if (!auth) return error(requestId, "Please sign in to upload photographs.", 401);
    const { galleryId } = await params;
    if (!(await getOwnedGallery(auth.profile.id, galleryId))) return error(requestId, "Gallery not found.", 404);
    const parsed = uploadIntentSchema.safeParse(await request.json());
    if (!parsed.success) return error(requestId, "Choose a JPEG, PNG, or WebP image smaller than 25 MB.", 400);
    const photoId = crypto.randomUUID();
    const input = parsed.data;
    const originalPath = `${auth.userId}/${galleryId}/${photoId}/original.${extensionForMimeType(input.mimeType)}`;
    await createPendingPhoto({ id: photoId, galleryId, fileName: sanitizeDisplayFileName(input.fileName), mimeType: input.mimeType, fileSizeBytes: input.fileSizeBytes, originalStoragePath: originalPath });
    const { data, error: signingError } = await auth.supabase.storage.from(ORIGINAL_PHOTOS_BUCKET).createSignedUploadUrl(originalPath);
    if (signingError || !data) {
      await deleteOwnedPhoto(auth.profile.id, galleryId, photoId);
      return error(requestId, "We could not prepare your upload. Please try again.", 500);
    }
    // This short-lived URL only permits writing this random private object once.
    return NextResponse.json({ photoId, uploadUrl: data.signedUrl }, { headers: { "x-request-id": requestId } });
  } catch {
    logger.error("photos.upload_intent_failed", { errorCode: "UNEXPECTED", operation: "photo_upload_intent", requestId, route: "/api/galleries/:galleryId/photos/upload-intent", status: 500 });
    return error(requestId, "We could not prepare your upload. Please try again.", 500);
  }
}

function error(requestId: string, message: string, status: number) {
  return NextResponse.json({ error: message, requestId }, { status, headers: { "x-request-id": requestId } });
}
