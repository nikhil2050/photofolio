import { NextResponse } from "next/server";
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
  const supabase = await createClient();
  const { data: token, error: authError } = await supabase.auth.getClaims();
  const userId = token?.claims.sub;
  if (authError || typeof userId !== "string") {
    return NextResponse.json(
      { error: "Please sign in to upload an image." },
      { status: 401 },
    );
  }
  const formData = await request.formData();
  const image = formData.get("image");

  if (!(image instanceof File))
    return NextResponse.json(
      { error: "Choose an image to upload." },
      { status: 400 },
    );
  if (
    !PROFILE_IMAGE_MIME_TYPES.includes(
      image.type as (typeof PROFILE_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return NextResponse.json(
      { error: "Use a PNG, JPEG, or WebP image." },
      { status: 400 },
    );
  }
  if (image.size === 0 || image.size > MAX_PROFILE_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Choose an image smaller than 2 MB." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  if (!hasMatchingImageSignature(bytes, image.type)) {
    return NextResponse.json(
      { error: "The selected file is not a valid image." },
      { status: 400 },
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
  if (error)
    return NextResponse.json(
      { error: "Your logo could not be uploaded. Please try again." },
      { status: 500 },
    );

  return NextResponse.json({ path });
}
