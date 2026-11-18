import { z } from "zod";

export const PROFILE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024;

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(
    z
      .url("Enter a complete URL, including https://.")
      .refine(
        (value) => value.startsWith("https://") || value.startsWith("http://"),
        "Use an http:// or https:// URL.",
      )
      .optional(),
  );

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Use at least 2 characters.").max(80),
  contactPhone: z
    .string()
    .trim()
    .regex(
      /^\+[1-9]\d{6,14}$/,
      "Use an international number, for example +491234567890.",
    )
    .optional(),
  avatarPath: z
    .string()
    .trim()
    .regex(
      /^[0-9a-f-]{36}\/profile\/avatar-[0-9a-f-]{36}\.(?:jpe?g|png|webp)$/,
      "The uploaded logo could not be verified.",
    )
    .optional(),
  bookingUrl: optionalUrl,
  bookingCtaLabel: z.string().trim().max(40).optional(),
});
