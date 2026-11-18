"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createDraftGallery } from "@/lib/galleries/repository";
import { getProfile } from "@/lib/profile/repository";
import { gallerySchema } from "@/lib/validation/gallery";

type GalleryFieldName =
  "title" | "clientName" | "description" | "eventDate" | "location";

export type GalleryFormState = {
  fieldErrors?: Partial<Record<GalleryFieldName, string>>;
  formError?: string;
};

/**
 * Creates a draft from server-validated form values. The photographer profile
 * is resolved from the signed-in identity, so a browser cannot create a
 * gallery for another studio by submitting a different owner ID.
 */
export async function createGallery(
  _: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const parsed = gallerySchema.safeParse({
    title: formData.get("title"),
    clientName: formData.get("clientName"),
    description: formData.get("description"),
    eventDate: formData.get("eventDate"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { fieldErrors: getFieldErrors(parsed.error.issues) };
  }

  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.setup_completed_at) {
    return {
      formError: "Finish your photographer profile before creating a gallery.",
    };
  }

  let galleryId: string;
  try {
    galleryId = await createDraftGallery(profile.id, parsed.data);
  } catch {
    return { formError: "We could not create your gallery. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/galleries");
  redirect(`/galleries/${galleryId}?created=1`);
}

function getFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): GalleryFormState["fieldErrors"] {
  return issues.reduce<Partial<Record<GalleryFieldName, string>>>(
    (errors, issue) => {
      const field = issue.path[0];
      if (
        typeof field === "string" &&
        [
          "title",
          "clientName",
          "description",
          "eventDate",
          "location",
        ].includes(field) &&
        !errors[field as GalleryFieldName]
      ) {
        errors[field as GalleryFieldName] = issue.message;
      }
      return errors;
    },
    {},
  );
}
