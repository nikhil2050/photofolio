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
        description={`Your profile is ready, ${displayName}. When you create your first gallery, it will appear here.`}
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
        title="No galleries yet"
        description="Your first gallery will appear here when gallery delivery is available."
        action={
          <Button asChild>
            <Link href="/profile">Edit photographer profile</Link>
          </Button>
        }
      />
      <Card className="mt-8">
        <CardContent>
          <h2 className="text-lg font-semibold">What comes next</h2>
          <ol className="mt-5 grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
            <li>
              <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-foreground">
                1
              </span>
              Create a gallery
            </li>
            <li>
              <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-foreground">
                2
              </span>
              Share it with your client
            </li>
            <li>
              <span className="mb-2 flex size-7 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-foreground">
                3
              </span>
              Receive favourites and enquiries
            </li>
          </ol>
        </CardContent>
      </Card>
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
          Gallery management is not available in this foundation phase. You can
          still keep your studio details up to date.
        </p>
        <Button className="mt-6" variant="secondary" asChild>
          <Link href="/profile">Edit photographer profile</Link>
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
