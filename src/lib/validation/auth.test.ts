import { describe, expect, it } from "vitest";
import { credentialsSchema, signUpSchema } from "./auth";

describe("authentication validation", () => {
  it("accepts valid sign-in credentials", () => {
    expect(
      credentialsSchema.safeParse({
        email: "photographer@example.com",
        password: "eight-chars",
      }).success,
    ).toBe(true);
  });

  it("rejects weak passwords and invalid email addresses", () => {
    expect(
      credentialsSchema.safeParse({
        email: "not-an-email",
        password: "short",
      }).success,
    ).toBe(false);
  });

  it("requires matching password confirmation for sign-up", () => {
    const result = signUpSchema.safeParse({
      email: "photographer@example.com",
      password: "eight-chars",
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        "Passwords do not match.",
      );
    }
  });
});
