import Link from "next/link";
import { Images, RefreshCw } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getGalleryCount } from "@/lib/dashboard/repository";
import { getProfile } from "@/lib/profile/repository";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const user = await requireUser();
  let profile;
  let galleryCount: number;

  try {
    profile = await getProfile(user.id);
    galleryCount = profile ? await getGalleryCount(profile.id) : 0;
  } catch {
    return <DashboardLoadError />;
  }

  if (!profile?.setup_completed_at) redirect("/profile");

  const displayName = profile.display_name ?? "your studio";

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Studio overview"
        title="Your studio starts here"
        description={`Your profile is ready, ${displayName}. Create a gallery when you are ready to organise a client delivery.`}
      />
      {galleryCount === 0 ? (
        <FirstVisitState />
      ) : (
        <GallerySummary count={galleryCount} />
      )}
    </div>
  );
}

function FirstVisitState() {
  return (
    <>
      <EmptyState
        className="mt-10"
        icon={Images}
        title="Your first gallery starts here"
        description="Create a private draft, then add the photographs you want to share."
        action={
          <Button asChild>
            <Link href="/galleries/new">Create gallery</Link>
          </Button>
        }
      />
    </>
  );
}

function GallerySummary({ count }: { count: number }) {
  return (
    <Card className="mt-10">
      <CardContent>
        <p className="text-lg font-semibold">
          {count} {count === 1 ? "gallery is" : "galleries are"} saved to your
          studio.
        </p>
        <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
          Keep your client galleries organised in one calm, private workspace.
        </p>
        <Button className="mt-6" variant="secondary" asChild>
          <Link href="/galleries">View galleries</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardLoadError() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Studio overview"
        title="Your studio"
        description="We could not load your studio details right now."
      />
      <Alert className="mt-10" tone="error">
        <div>
          <p className="font-semibold">Try again in a moment.</p>
          <p className="mt-1">Your studio data has not been changed.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/dashboard">
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </Link>
          </Button>
        </div>
      </Alert>
    </div>
  );
}
