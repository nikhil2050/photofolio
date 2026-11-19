import { NextResponse } from "next/server";
import { PREVIEW_IMAGES_BUCKET } from "@/lib/photos/config";
import { getOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { selectControlledPreviewPath } from "@/lib/photos/preview";

export async function GET(_: Request, { params }: { params: Promise<{ galleryId: string; photoId: string }> }) {
  const auth = await requireUserFromRequest();
  if (!auth) return new NextResponse(null, { status: 401 });
  const { galleryId, photoId } = await params;
  const photo = await getOwnedPhoto(auth.profile.id, galleryId, photoId);
  if (!photo || photo.processing_status !== "ready") {
    return new NextResponse(null, { status: 404 });
  }

  // Photos processed before thumbnails were introduced still have a private
  // preview. It is a safe controlled fallback; originals are never used here.
  const controlledPath = selectControlledPreviewPath({
    thumbnailStoragePath: photo.thumbnail_storage_path,
    previewStoragePath: photo.preview_storage_path,
  });
  if (!controlledPath) return new NextResponse(null, { status: 404 });

  const { data, error } = await auth.supabase.storage
    .from(PREVIEW_IMAGES_BUCKET)
    .createSignedUrl(controlledPath, 60);
  if (error || !data) return new NextResponse(null, { status: 500 });
  // Keep image bytes on Supabase's storage delivery path. The redirect is
  // short-lived and never exposes an original image URL.
  return NextResponse.redirect(data.signedUrl, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
