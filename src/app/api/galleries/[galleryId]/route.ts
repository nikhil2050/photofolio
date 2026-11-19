import { NextResponse } from "next/server";
import { setOwnedGalleryCover, updateOwnedGallery } from "@/lib/galleries/repository";
import { createRequestId, logger } from "@/lib/logging/logger";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { galleryDetailsSchema } from "@/lib/validation/gallery";
import { photoIdSchema } from "@/lib/validation/photo-editor";

export async function PATCH(request: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  try {
    const auth = await requireUserFromRequest();
    if (!auth) return error(requestId, "Please sign in to edit this gallery.", 401);
    const { galleryId } = await params;
    const body = await request.json();
    if (body.action === "set-cover") {
      const photoId = body.photoId === null ? null : photoIdSchema.safeParse(body.photoId);
      if (photoId !== null && !photoId.success) return error(requestId, "Choose a valid cover photograph.", 400);
      const updated = await setOwnedGalleryCover(auth.profile.id, galleryId, photoId === null ? null : photoId.data);
      if (!updated) return error(requestId, "Cover photograph not found.", 404);
      return NextResponse.json({ status: "saved" }, { headers: { "x-request-id": requestId } });
    }
    const parsed = galleryDetailsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Check the highlighted gallery details and try again.",
          fieldErrors: parsed.error.flatten().fieldErrors,
          requestId,
        },
        { status: 400, headers: { "x-request-id": requestId } },
      );
    }
    const updated = await updateOwnedGallery(auth.profile.id, galleryId, parsed.data);
    if (!updated) return error(requestId, "Gallery not found.", 404);
    return NextResponse.json({ status: "saved" }, { headers: { "x-request-id": requestId } });
  } catch {
    logger.error("galleries.editor_update_failed", { errorCode: "UNEXPECTED", operation: "gallery_editor_update", requestId, route: "/api/galleries/:galleryId", status: 500 });
    return error(requestId, "We could not save this gallery. Please try again.", 500);
  }
}

function error(requestId: string, message: string, status: number) {
  return NextResponse.json({ error: message, requestId }, { status, headers: { "x-request-id": requestId } });
}
