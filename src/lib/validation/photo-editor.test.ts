import { describe, expect, it } from "vitest";
import { photoMetadataSchema, photoOrderSchema } from "./photo-editor";

const firstPhotoId = "a6d1e204-a9e0-4a20-b4fd-8d0c4d3c6001";
const secondPhotoId = "b7d1e204-a9e0-4a20-b4fd-8d0c4d3c6002";

describe("photo editor validation", () => {
  it("normalises empty photo metadata to null", () => {
    expect(photoMetadataSchema.parse({ altText: "  ", caption: "  " })).toEqual({
      altText: null,
      caption: null,
    });
  });

  it("rejects a reorder request with duplicate photo IDs", () => {
    expect(
      photoOrderSchema.safeParse({ photoIds: [firstPhotoId, firstPhotoId] }).success,
    ).toBe(false);
    expect(
      photoOrderSchema.safeParse({ photoIds: [firstPhotoId, secondPhotoId] }).success,
    ).toBe(true);
  });
});
