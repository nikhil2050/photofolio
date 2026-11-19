import { NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logging/logger";
import { archiveOwnedGallery, publishOwnedGallery, rotateOwnedGalleryShareLink, unpublishOwnedGallery, updateOwnedGalleryAccess } from "@/lib/galleries/repository";
import { requireUserFromRequest } from "@/lib/photos/route-auth";
import { shareSettingsSchema, sharingActionSchema } from "@/lib/validation/gallery-sharing";

export async function POST(request: Request, { params }: { params: Promise<{ galleryId: string }> }) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();
  try {
    const auth = await requireUserFromRequest();
    if (!auth) return failure(requestId, "Please sign in to manage sharing.", 401);
    const { galleryId } = await params;
    const action = sharingActionSchema.safeParse(await request.json());
    if (!action.success) return failure(requestId, "Check the sharing settings and try again.", 400);

    if (action.data.action === "publish" || action.data.action === "update-access") {
      const settings = shareSettingsSchema.safeParse(action.data);
      if (!settings.success) return failure(requestId, settings.error.issues[0]?.message ?? "Check the sharing settings and try again.", 400);
      if (action.data.action === "publish") {
        const result = await publishOwnedGallery({ profileId: auth.profile.id, galleryId, ...settings.data });
        if (!result.readiness || !result.readiness.canPublish) {
          return NextResponse.json({ error: "This gallery needs attention before publishing.", readiness: result.readiness, requestId }, { status: 422, headers: { "x-request-id": requestId } });
        }
        return NextResponse.json({ status: "published", shareUrl: result.shareToken ? shareUrl(request, result.shareToken) : null, requestId }, { headers: { "x-request-id": requestId } });
      }
      const updated = await updateOwnedGalleryAccess({ profileId: auth.profile.id, galleryId, ...settings.data });
      if (!updated) return failure(requestId, "Gallery not found.", 404);
      return NextResponse.json({ status: "saved", requestId }, { headers: { "x-request-id": requestId } });
    }

    if (action.data.action === "rotate-link") {
      const shareToken = await rotateOwnedGalleryShareLink(auth.profile.id, galleryId);
      if (!shareToken) return failure(requestId, "Publish this gallery before rotating its link.", 422);
      return NextResponse.json({ status: "rotated", shareUrl: shareUrl(request, shareToken), requestId }, { headers: { "x-request-id": requestId } });
    }
    if (action.data.action === "unpublish") {
      const updated = await unpublishOwnedGallery(auth.profile.id, galleryId);
      if (!updated) return failure(requestId, "Gallery not found.", 404);
      return NextResponse.json({ status: "unpublished", requestId }, { headers: { "x-request-id": requestId } });
    }
    const updated = await archiveOwnedGallery(auth.profile.id, galleryId);
    if (!updated) return failure(requestId, "Gallery not found.", 404);
    return NextResponse.json({ status: "archived", requestId }, { headers: { "x-request-id": requestId } });
  } catch {
    logger.error("galleries.sharing_action_failed", { errorCode: "UNEXPECTED", operation: "gallery_sharing", requestId, route: "/api/galleries/:galleryId/sharing", status: 500 });
    return failure(requestId, "We could not update sharing. Please try again.", 500);
  }
}

function shareUrl(request: Request, token: string) {
  return new URL(`/g/${token}`, request.url).toString();
}

function failure(requestId: string, error: string, status: number) {
  return NextResponse.json({ error, requestId }, { status, headers: { "x-request-id": requestId } });
}
