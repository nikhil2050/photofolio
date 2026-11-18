import { NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logging/logger";
import { createPhotoDerivatives } from "@/lib/photos/service";
import { getOwnedPhoto } from "@/lib/photos/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ galleryId: string; photoId: string }> }) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  try {
    const auth = await requireUserFromRequest();
    if (!auth) return error(requestId, "Please sign in to process photographs.", 401);
    const { galleryId, photoId } = await params;
    const photo = await getOwnedPhoto(auth.profile.id, galleryId, photoId);
    if (!photo) return error(requestId, "Photograph not found.", 404);
    const outcome = await createPhotoDerivatives(auth.userId, photo);
    if (!outcome.ok) return error(requestId, outcome.message, 422);
    return NextResponse.json({ photoId, status: "ready", previewUrl: `/api/galleries/${galleryId}/photos/${photoId}/preview` }, { headers: { "x-request-id": requestId } });
  } catch (caughtError) {
    logger.error("photos.complete_failed", {
      errorCode: "UNEXPECTED",
      operation: "photo_complete",
      requestId,
      route: "/api/galleries/:galleryId/photos/:photoId/complete",
      status: 500,
      failureStage: caughtError instanceof Error ? caughtError.name : "unknown",
    });
    return error(requestId, "We could not process this photograph. You can retry it.", 500);
  }
}
function error(requestId: string, message: string, status: number) { return NextResponse.json({ error: message, requestId }, { status, headers: { "x-request-id": requestId } }); }
