import { z } from "zod";
import { PHOTO_UPLOAD_CONFIG } from "../photos/config";

const supportedMimeTypes = PHOTO_UPLOAD_CONFIG.acceptedMimeTypes;

export const uploadIntentSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(supportedMimeTypes),
  fileSizeBytes: z.number().int().positive().max(PHOTO_UPLOAD_CONFIG.maxBytes),
});

export function sanitizeDisplayFileName(fileName: string) {
  const name = fileName
    .normalize("NFKC")
    .replace(/[\\/\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return name.slice(0, 255) || "untitled-image";
}

export function mimeTypeFromImageSignature(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg" as const;
  }
  const png = [137, 80, 78, 71, 13, 10, 26, 10];
  if (bytes.length >= 8 && png.every((byte, index) => bytes[index] === byte)) {
    return "image/png" as const;
  }
  if (
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp" as const;
  }
  return null;
}

export function hasExpectedFileExtension(fileName: string, mimeType: string) {
  const extension = fileName.toLowerCase().split(".").pop();
  return (
    (mimeType === "image/jpeg" && ["jpg", "jpeg"].includes(extension ?? "")) ||
    (mimeType === "image/png" && extension === "png") ||
    (mimeType === "image/webp" && extension === "webp")
  );
}

export function extensionForMimeType(mimeType: (typeof supportedMimeTypes)[number]) {
  return mimeType === "image/jpeg" ? "jpg" : mimeType.replace("image/", "");
}
