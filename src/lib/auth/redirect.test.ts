import { describe, expect, it } from "vitest";
import { safeInternalRedirect } from "./redirect";

describe("safeInternalRedirect", () => {
  it("keeps application-relative destinations", () => {
    expect(safeInternalRedirect("/profile")).toBe("/profile");
    expect(safeInternalRedirect("/dashboard?from=sign-in")).toBe(
      "/dashboard?from=sign-in",
    );
  });

  it("rejects external and malformed redirect destinations", () => {
    expect(safeInternalRedirect("https://attacker.example")).toBe("/dashboard");
    expect(safeInternalRedirect("//attacker.example")).toBe("/dashboard");
    expect(safeInternalRedirect("/\\attacker.example")).toBe("/dashboard");
    expect(safeInternalRedirect(null)).toBe("/dashboard");
  });
});
