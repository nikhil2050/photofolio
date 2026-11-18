import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CircleCheck, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuccessMessage } from "@/components/ui/form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getOwnedGallery } from "@/lib/galleries/repository";
import { getProfile } from "@/lib/profile/repository";

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

  const gallery = await getOwnedGallery(profile.id, galleryId);
  if (!gallery) notFound();

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Gallery draft"
        title={gallery.title}
        description="This draft is private to your studio until you choose to publish it."
        action={
          <Button asChild variant="ghost">
            <Link href="/galleries">Back to galleries</Link>
          </Button>
        }
      />
      <Card className="mt-10 max-w-2xl">
        <CardContent>
          {created === "1" ? (
            <SuccessMessage>
              <span className="inline-flex items-center gap-2">
                <CircleCheck size={17} aria-hidden="true" /> Gallery created.
              </span>
            </SuccessMessage>
          ) : null}
          <div className="mt-6 flex items-start gap-4">
            <Images
              className="mt-0.5 text-muted-foreground"
              size={24}
              aria-hidden="true"
            />
            <div>
              <h2 className="text-lg font-semibold">Ready for photographs</h2>
              <p className="mt-2 leading-7 text-muted-foreground">
                Photo upload and organisation are the next gallery workflow.
                This draft remains private while you prepare it.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
