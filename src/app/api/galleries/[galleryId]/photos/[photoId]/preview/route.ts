import { NextResponse } from "next/server";
import { PREVIEW_IMAGES_BUCKET } from "@/lib/photos/config";
import { getOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";

export async function GET(_: Request, { params }: { params: Promise<{ galleryId: string; photoId: string }> }) {
  const auth = await requireUserFromRequest();
  if (!auth) return new NextResponse(null, { status: 401 });
  const { galleryId, photoId } = await params;
  const photo = await getOwnedPhoto(auth.profile.id, galleryId, photoId);
  if (!photo?.thumbnail_storage_path || photo.processing_status !== "ready") return new NextResponse(null, { status: 404 });
  const { data, error } = await auth.supabase.storage.from(PREVIEW_IMAGES_BUCKET).createSignedUrl(photo.thumbnail_storage_path, 60);
  if (error || !data) return new NextResponse(null, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}
