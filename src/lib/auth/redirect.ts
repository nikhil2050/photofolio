/**
 * Accept only application-relative redirect targets so an auth URL cannot send
 * a signed-in photographer to an attacker-controlled site.
 */
export function safeInternalRedirect(value: FormDataEntryValue | null) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/dashboard";
  }

  return value;
}
