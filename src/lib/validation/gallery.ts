import { z } from "zod";

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .pipe(z.string().max(maximumLength).optional());

const optionalDate = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? undefined : value))
  .pipe(z.iso.date("Choose a valid event date.").optional());

/** Validates the deliberately short first step of gallery creation. */
export const gallerySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a gallery title.")
    .max(160, "Keep the title to 160 characters or fewer."),
  clientName: optionalText(160),
  description: optionalText(2_000),
  eventDate: optionalDate,
  location: optionalText(160),
});

export type GalleryInput = z.infer<typeof gallerySchema>;

export const galleryStatusSchema = z.enum([
  "all",
  "draft",
  "published",
  "archived",
]);

export type GalleryStatusFilter = z.infer<typeof galleryStatusSchema>;

export type GalleryListFilters = {
  search: string;
  status: GalleryStatusFilter;
  page: number;
};

/**
 * Normalises URL filters before they reach PostgREST's filter syntax. The
 * search value is reduced to readable title/client characters so punctuation
 * cannot change the shape of the server-side filter expression.
 */
export function parseGalleryListFilters(input: {
  q?: string;
  status?: string;
  page?: string;
}): GalleryListFilters {
  const status = galleryStatusSchema.safeParse(input.status);
  const parsedPage = Number.parseInt(input.page ?? "1", 10);
  const search = (input.q ?? "")
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);

  return {
    search,
    status: status.success ? status.data : "all",
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
  };
}
