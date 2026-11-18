import { describe, expect, it } from "vitest";
import { gallerySchema, parseGalleryListFilters } from "./gallery";

describe("gallery validation", () => {
  it("accepts the short draft-gallery form and normalises optional values", () => {
    const result = gallerySchema.parse({
      title: "  Lena and Sam  ",
      clientName: "",
      description: "A quiet afternoon ceremony.",
      eventDate: "2026-12-18",
      location: "Berlin",
    });

    expect(result).toEqual({
      title: "Lena and Sam",
      clientName: undefined,
      description: "A quiet afternoon ceremony.",
      eventDate: "2026-12-18",
      location: "Berlin",
    });
  });

  it("rejects an empty title and an invalid event date", () => {
    const result = gallerySchema.safeParse({
      title: " ",
      clientName: "",
      description: "",
      eventDate: "2026-02-30",
      location: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("gallery list filters", () => {
  it("normalises search and rejects unsupported URL filter values", () => {
    expect(
      parseGalleryListFilters({
        q: "  Ana, Ben (wedding)  ",
        status: "unexpected",
        page: "-10",
      }),
    ).toEqual({
      search: "Ana Ben wedding",
      status: "all",
      page: 1,
    });
  });
});
