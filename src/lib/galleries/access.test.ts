import { describe, expect, it } from "vitest";
import {
  createGalleryShareToken,
  hashGalleryPassword,
  verifyGalleryPassword,
  verifyGalleryShareToken,
} from "./access";

describe("gallery access secrets", () => {
  it("stores only a fixed-length hash for a generated share token", () => {
    const { token, tokenHash } = createGalleryShareToken();

    expect(token).toHaveLength(43);
    expect(tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(tokenHash).not.toContain(token);
    expect(verifyGalleryShareToken(token, tokenHash)).toBe(true);
    expect(verifyGalleryShareToken(`${token}x`, tokenHash)).toBe(false);
  });

  it("uses a fresh salt and rejects wrong or malformed password hashes", async () => {
    const firstHash = await hashGalleryPassword("a gallery password");
    const secondHash = await hashGalleryPassword("a gallery password");

    expect(firstHash).not.toBe(secondHash);
    await expect(
      verifyGalleryPassword("a gallery password", firstHash),
    ).resolves.toBe(true);
    await expect(
      verifyGalleryPassword("wrong password", firstHash),
    ).resolves.toBe(false);
    await expect(
      verifyGalleryPassword("a gallery password", "not-a-password-hash"),
    ).resolves.toBe(false);
  });
});
