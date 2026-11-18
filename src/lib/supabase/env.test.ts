import { describe, expect, it } from "vitest";
import { AppError } from "../errors/app-error";
import { validatePublicEnv } from "./env";

describe("public environment validation", () => {
  it("returns only valid browser-safe Supabase configuration", () => {
    expect(
      validatePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      }),
    ).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "publishable-key",
    });
  });

  it("fails without including a configuration value", () => {
    expect(() =>
      validatePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      }),
    ).toThrow(AppError);

    try {
      validatePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      });
    } catch (error) {
      expect(error).toMatchObject({ code: "CONFIGURATION_INVALID" });
      expect(error).toBeInstanceOf(AppError);
      expect((error as Error).message).not.toContain("not-a-url");
    }
  });
});
