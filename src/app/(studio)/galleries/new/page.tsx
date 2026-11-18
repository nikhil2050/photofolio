import Link from "next/link";
import { GalleryForm } from "@/components/galleries/gallery-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";
import { redirect } from "next/navigation";

export default async function NewGalleryPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile?.setup_completed_at) redirect("/profile");

  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow="Gallery library"
        title="Create a gallery"
        description="Start with a few details. You can add photographs and sharing settings next."
        action={
          <Button asChild variant="ghost">
            <Link href="/galleries">Back to galleries</Link>
          </Button>
        }
      />
      <GalleryForm />
    </div>
  );
}
