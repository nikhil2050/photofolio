import { NextResponse } from "next/server";
import { ORIGINAL_PHOTOS_BUCKET, PREVIEW_IMAGES_BUCKET } from "@/lib/photos/config";
import { deleteOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { updateOwnedPhotoMetadata } from "@/lib/photos/repository";
import { photoMetadataSchema } from "@/lib/validation/photo-editor";

export async function PATCH(request: Request, { params }: { params: Promise<{ galleryId: string; photoId: string }> }) {
  const auth = await requireUserFromRequest();
  if (!auth) return NextResponse.json({ error: "Please sign in to edit photographs." }, { status: 401 });
  const { galleryId, photoId } = await params;
  const parsed = photoMetadataSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the photo details and try again." }, { status: 400 });
  try {
    const updated = await updateOwnedPhotoMetadata(auth.profile.id, galleryId, photoId, parsed.data);
    if (!updated) return NextResponse.json({ error: "Photograph not found." }, { status: 404 });
    return NextResponse.json({ status: "saved" });
  } catch {
    return NextResponse.json({ error: "We could not save this photograph. Please try again." }, { status: 500 });
  }
}

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
