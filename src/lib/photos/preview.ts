/**
 * Chooses only controlled derivatives for display. A private original must
 * never be used as a visual fallback when a thumbnail is unavailable.
 */
export function selectControlledPreviewPath(input: {
  thumbnailStoragePath: string | null;
  previewStoragePath: string | null;
}) {
  return input.thumbnailStoragePath ?? input.previewStoragePath;
}
