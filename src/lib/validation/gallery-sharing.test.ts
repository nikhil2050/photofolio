import { describe, expect, it } from "vitest";
import { shareSettingsSchema } from "./gallery-sharing";

describe("share settings validation", () => {
  it("requires a password only for password-protected access", () => {
    expect(shareSettingsSchema.safeParse({ accessMode: "link" }).success).toBe(true);
    expect(shareSettingsSchema.safeParse({ accessMode: "password" }).success).toBe(false);
    expect(shareSettingsSchema.safeParse({ accessMode: "password", password: "eight-char" }).success).toBe(true);
  });
});
