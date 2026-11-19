import { z } from "zod";

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .pipe(z.string().max(maximumLength).nullable());

export const photoMetadataSchema = z.object({
  altText: optionalText(500),
  caption: optionalText(1_000),
});

export const photoOrderSchema = z.object({
  photoIds: z
    .array(z.string().uuid())
    .min(1)
    .max(500)
    .refine((photoIds) => new Set(photoIds).size === photoIds.length, {
      message: "Each photograph can appear only once in the order.",
    }),
});

export const photoIdSchema = z.string().uuid();
