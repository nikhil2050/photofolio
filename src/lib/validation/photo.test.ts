import { describe, expect, it } from "vitest";
import {
  hasExpectedFileExtension,
  mimeTypeFromImageSignature,
  sanitizeDisplayFileName,
} from "./photo";

describe("photo upload validation", () => {
  it("recognises supported magic bytes without trusting a filename", () => {
    expect(
      mimeTypeFromImageSignature(new Uint8Array([0xff, 0xd8, 0xff, 0xdb])),
    ).toBe("image/jpeg");
    expect(mimeTypeFromImageSignature(new TextEncoder().encode("<svg"))).toBeNull();
    expect(hasExpectedFileExtension("wedding.jpg", "image/jpeg")).toBe(true);
    expect(hasExpectedFileExtension("payload.exe", "image/jpeg")).toBe(false);
  });

  it("removes control characters and path separators from display names", () => {
    expect(sanitizeDisplayFileName("../ ceremony\\photo\u0000.jpg")).toBe(
      ".. ceremonyphoto.jpg",
    );
  });
});
