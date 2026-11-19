import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { GalleryDetailsForm } from "@/components/galleries/gallery-details-form";
import { GalleryEditorNavigation } from "@/components/galleries/gallery-editor-navigation";
import { GalleryPhotoGrid } from "@/components/galleries/gallery-photo-grid";
import { GallerySharePanel } from "@/components/galleries/gallery-share-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SuccessMessage } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getGalleryPublishReadiness, getGallerySharingState, getOwnedGallery } from "@/lib/galleries/repository";
import { getProfile } from "@/lib/profile/repository";
import { listOwnedGalleryPhotos } from "@/lib/photos/repository";

export default async function GalleryCreatedPage({
  params,
  searchParams,
}: {
  params: Promise<{ galleryId: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ galleryId }, { created }, user] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const profile = await getProfile(user.id);
  if (!profile?.setup_completed_at) redirect("/profile");

  const [gallery, photos, sharing, readiness] = await Promise.all([
    getOwnedGallery(profile.id, galleryId),
    listOwnedGalleryPhotos(profile.id, galleryId),
    getGallerySharingState(profile.id, galleryId),
    getGalleryPublishReadiness(profile.id, galleryId),
  ]);
  if (!gallery) notFound();

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Gallery draft"
        title={gallery.title}
        description="This draft is private to your studio until you choose to publish it."
        action={
          <div className="flex flex-wrap gap-2"><Button asChild><a href="#upload-photos">Add photos</a></Button><Button asChild variant="ghost"><Link href="/galleries">Back to galleries</Link></Button></div>
        }
      />
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><GalleryEditorNavigation /><Badge className="bg-surface text-foreground">{gallery.status}</Badge></div>
      {created === "1" ? (
        <div className="mt-6 max-w-2xl"><SuccessMessage><span className="inline-flex items-center gap-2"><CircleCheck size={17} aria-hidden="true" /> Gallery created.</span></SuccessMessage></div>
      ) : null}
      <section id="details" className="mt-10" aria-labelledby="details-heading">
        <h2 id="details-heading" className="text-xl font-semibold">Details</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Describe the gallery for your client. Changes are saved only when you choose Save details.</p>
        <GalleryDetailsForm galleryId={gallery.id} details={{ title: gallery.title, clientName: gallery.client_name, description: gallery.description, eventDate: gallery.event_date, location: gallery.location }} />
      </section>
      <section id="photos" className="mt-12" aria-labelledby="photos-editor-heading">
        <h2 id="photos-editor-heading" className="sr-only">Photos</h2>
        <GalleryPhotoGrid key={photos.map((photo) => `${photo.id}:${photo.processing_status}:${photo.sort_order}`).join("|")} galleryId={gallery.id} initialPhotos={photos} coverPhotoId={gallery.cover_photo_id} />
      </section>
      {sharing && readiness ? <GallerySharePanel galleryId={gallery.id} initialState={sharing} readiness={readiness} /> : null}
    </div>
  );
}
