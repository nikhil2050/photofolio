import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(z.url("Enter a complete URL, including https://.").optional());

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Use at least 2 characters.").max(80),
  contactPhone: z.string().trim().max(32).optional(),
  avatarPath: z.string().trim().max(500).optional(),
  bookingUrl: optionalUrl,
  bookingCtaLabel: z.string().trim().max(40).optional(),
});
