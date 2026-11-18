import Link from "next/link";
import { Images, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isReady = Boolean(profile?.display_name);

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Studio overview"
        title={
          isReady
            ? `Welcome back, ${profile?.display_name}`
            : "Your studio starts here"
        }
        description="Set up the essentials now so your studio is ready when private galleries arrive."
      />
      {!isReady ? (
        <Card className="mt-10">
          <CardContent>
            <UserRound
              className="text-[var(--accent-strong)]"
              size={24}
              aria-hidden="true"
            />
            <h2 className="mt-5 text-lg font-semibold">
              Complete your photographer profile
            </h2>
            <p className="mt-2 max-w-lg leading-7 text-muted-foreground">
              Add the studio name clients should see, then optionally add a
              contact number and booking link.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/profile">Set up your profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
      <EmptyState
        className="mt-10"
        icon={Images}
        title="No galleries yet"
        description="Gallery delivery is not available in this foundation phase. Your private image-storage infrastructure is being prepared for a secure future workflow."
      />
    </div>
  );
}
