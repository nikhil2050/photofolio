import { describe, expect, it } from "vitest";
import { selectControlledPreviewPath } from "./preview";

describe("selectControlledPreviewPath", () => {
  it("prefers a thumbnail but safely falls back to a controlled preview", () => {
    expect(selectControlledPreviewPath({ thumbnailStoragePath: "thumbnail.webp", previewStoragePath: "preview.webp" })).toBe("thumbnail.webp");
    expect(selectControlledPreviewPath({ thumbnailStoragePath: null, previewStoragePath: "preview.webp" })).toBe("preview.webp");
  });

  it("does not invent an image path when no controlled derivative exists", () => {
    expect(selectControlledPreviewPath({ thumbnailStoragePath: null, previewStoragePath: null })).toBeNull();
  });
});
