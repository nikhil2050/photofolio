/** Central limits keep browser hints and trusted server checks aligned. */
export const PHOTO_UPLOAD_CONFIG = {
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  maxBytes: 25 * 1024 * 1024,
  maxFilesPerBatch: 20,
  maxConcurrentUploads: 3,
  maxInputPixels: 25_000_000,
  previewMaxDimension: 2560,
  thumbnailMaxDimension: 640,
} as const;

export const ORIGINAL_PHOTOS_BUCKET = "original-photos";
export const PREVIEW_IMAGES_BUCKET = "preview-images";
