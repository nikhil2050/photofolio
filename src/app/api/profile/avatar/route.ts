import { NextResponse } from "next/server";
import { createRequestId, logger } from "@/lib/logging/logger";
import { createClient } from "@/lib/supabase/server";
import {
  MAX_PROFILE_IMAGE_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
} from "@/lib/validation/profile";

const extensionForMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function hasMatchingImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }
  if (mimeType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes
        .slice(0, 8)
        .every(
          (byte, index) => byte === [137, 80, 78, 71, 13, 10, 26, 10][index],
        )
    );
  }
  return (
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  );
}

/** Checks profile uploads at a trusted server boundary before private storage. */
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? createRequestId();

  try {
    const supabase = await createClient();
    const { data: token, error: authError } = await supabase.auth.getClaims();
    const userId = token?.claims.sub;
    if (authError || typeof userId !== "string") {
      return errorResponse(
        requestId,
        "Please sign in to upload an image.",
        401,
      );
    }
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return errorResponse(requestId, "Choose an image to upload.", 400);
    }
    if (
      !PROFILE_IMAGE_MIME_TYPES.includes(
        image.type as (typeof PROFILE_IMAGE_MIME_TYPES)[number],
      )
    ) {
      return errorResponse(requestId, "Use a PNG, JPEG, or WebP image.", 400);
    }
    if (image.size === 0 || image.size > MAX_PROFILE_IMAGE_BYTES) {
      return errorResponse(
        requestId,
        "Choose an image smaller than 2 MB.",
        400,
      );
    }

    const bytes = new Uint8Array(await image.arrayBuffer());
    if (!hasMatchingImageSignature(bytes, image.type)) {
      return errorResponse(
        requestId,
        "The selected file is not a valid image.",
        400,
      );
    }

    const extension =
      extensionForMimeType[image.type as keyof typeof extensionForMimeType];
    const path = `${userId}/profile/avatar-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("preview-images")
      .upload(path, bytes, {
        contentType: image.type,
        upsert: false,
      });
    if (error) {
      logger.error("profile_avatar.storage_write_failed", {
        errorCode: "STORAGE_UNAVAILABLE",
        operation: "profile_avatar_upload",
        requestId,
        route: "/api/profile/avatar",
        status: 500,
      });
      return errorResponse(
        requestId,
        "Your logo could not be uploaded. Please try again.",
        500,
      );
    }

    return NextResponse.json(
      { path },
      { headers: { "x-request-id": requestId } },
    );
  } catch {
    logger.error("profile_avatar.unexpected_failure", {
      errorCode: "UNEXPECTED",
      operation: "profile_avatar_upload",
      requestId,
      route: "/api/profile/avatar",
      status: 500,
    });
    return errorResponse(
      requestId,
      "Your logo could not be uploaded. Please try again.",
      500,
    );
  }
}

function errorResponse(requestId: string, error: string, status: number) {
  return NextResponse.json(
    { error, requestId },
    { status, headers: { "x-request-id": requestId } },
  );
}
