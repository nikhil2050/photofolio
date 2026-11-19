import { describe, expect, it } from "vitest";
import { createShareToken, hashGalleryPassword, hashShareToken, verifyGalleryPassword } from "./share-security";

describe("gallery sharing security", () => {
  it("generates opaque tokens and persists deterministic hashes only", () => {
    const token = createShareToken();
    expect(token).toHaveLength(43);
    expect(hashShareToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(createShareToken()).not.toBe(token);
  });

  it("hashes and verifies a gallery password without retaining plaintext", async () => {
    const hash = await hashGalleryPassword("a-long-enough-password");
    expect(hash).toMatch(/^scrypt\$/);
    await expect(verifyGalleryPassword("a-long-enough-password", hash)).resolves.toBe(true);
    await expect(verifyGalleryPassword("incorrect-password", hash)).resolves.toBe(false);
  });
});
