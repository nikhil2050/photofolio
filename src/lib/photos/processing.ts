import sharp, { type Metadata } from "sharp";
import { PHOTO_UPLOAD_CONFIG } from "@/lib/photos/config";
import { hasExpectedFileExtension, mimeTypeFromImageSignature } from "@/lib/validation/photo";

export class InvalidPhotoError extends Error {}

export async function processPhoto(original: Uint8Array, declaredMimeType: string, fileName: string) {
  const detectedMimeType = mimeTypeFromImageSignature(original);
  if (!detectedMimeType || detectedMimeType !== declaredMimeType || !hasExpectedFileExtension(fileName, detectedMimeType)) {
    throw new InvalidPhotoError("The file type does not match the selected image.");
  }
  const image = sharp(original, { limitInputPixels: PHOTO_UPLOAD_CONFIG.maxInputPixels, failOn: "error" });
  let metadata: Metadata;
  try { metadata = await image.metadata(); } catch { throw new InvalidPhotoError("The selected file is not a readable image."); }
  if (!metadata.width || !metadata.height || !["jpeg", "png", "webp"].includes(metadata.format ?? "")) {
    throw new InvalidPhotoError("The selected file is not a supported image.");
  }
  const transform = (maxDimension: number) => sharp(original, { limitInputPixels: PHOTO_UPLOAD_CONFIG.maxInputPixels, failOn: "error" })
    .rotate()
    .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true })
    .webp({ quality: maxDimension === PHOTO_UPLOAD_CONFIG.previewMaxDimension ? 82 : 76 });
  const [preview, thumbnail] = await Promise.all([
    transform(PHOTO_UPLOAD_CONFIG.previewMaxDimension).toBuffer(),
    transform(PHOTO_UPLOAD_CONFIG.thumbnailMaxDimension).toBuffer(),
  ]);
  const outputMetadata = await sharp(preview).metadata();
  if (!outputMetadata.width || !outputMetadata.height) throw new InvalidPhotoError("The preview could not be generated.");
  return { preview, thumbnail, width: outputMetadata.width, height: outputMetadata.height };
}
