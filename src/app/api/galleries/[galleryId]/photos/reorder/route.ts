import { NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logging/logger";
import { reorderOwnedGalleryPhotos } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { photoOrderSchema } from "@/lib/validation/photo-editor";

export async function POST(request: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  try {
    const auth = await requireUserFromRequest();
    if (!auth) return response(requestId, "Please sign in to organise photographs.", 401);
    const { galleryId } = await params;
    const parsed = photoOrderSchema.safeParse(await request.json());
    if (!parsed.success) return response(requestId, "The photo order was not valid. Refresh and try again.", 400);
    const updated = await reorderOwnedGalleryPhotos(auth.profile.id, galleryId, parsed.data.photoIds);
    if (!updated) return response(requestId, "Gallery not found.", 404);
    return NextResponse.json({ status: "saved" }, { headers: { "x-request-id": requestId } });
  } catch {
    logger.error("photos.reorder_route_failed", { errorCode: "UNEXPECTED", operation: "photo_reorder", requestId, route: "/api/galleries/:galleryId/photos/reorder", status: 500 });
    return response(requestId, "We could not save the photo order. Refresh and try again.", 500);
  }
}

function response(requestId: string, error: string, status: number) {
  return NextResponse.json({ error, requestId }, { status, headers: { "x-request-id": requestId } });
}
