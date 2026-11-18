import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const validProfile = {
  displayName: "Aperture Studio",
  contactPhone: "+491234567890",
  avatarPath:
    "11111111-1111-4111-8111-111111111111/profile/avatar-22222222-2222-4222-8222-222222222222.jpg",
  bookingUrl: "https://example.com/book",
  bookingCtaLabel: "Check availability",
};

describe("profile validation", () => {
  it("accepts the permitted profile shape", () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it("rejects unsafe booking schemes and untrusted avatar paths", () => {
    expect(
      profileSchema.safeParse({
        ...validProfile,
        bookingUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({
        ...validProfile,
        avatarPath:
          "another-user/profile/avatar-22222222-2222-4222-8222-222222222222.jpg",
      }).success,
    ).toBe(false);
  });
});
