import { NextResponse } from "next/server";
import { ORIGINAL_PHOTOS_BUCKET, PREVIEW_IMAGES_BUCKET } from "@/lib/photos/config";
import { deleteOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";

export async function DELETE(_: Request, { params }: { params: Promise<{ galleryId: string; photoId: string }> }) {
  const auth = await requireUserFromRequest();
  if (!auth) return new NextResponse(null, { status: 401 });
  const { galleryId, photoId } = await params;
  const photo = await deleteOwnedPhoto(auth.profile.id, galleryId, photoId);
  if (!photo) return new NextResponse(null, { status: 204 });
  // Storage cleanup is idempotent; deleting absent paths is safe after retries/cancellation.
  await Promise.all([
    auth.supabase.storage.from(ORIGINAL_PHOTOS_BUCKET).remove([photo.original_storage_path]),
    auth.supabase.storage.from(PREVIEW_IMAGES_BUCKET).remove([photo.preview_storage_path, photo.thumbnail_storage_path].filter((path): path is string => Boolean(path))),
  ]);
  return new NextResponse(null, { status: 204 });
}
