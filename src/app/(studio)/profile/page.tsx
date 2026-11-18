import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return (
    <div className="grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <PageHeader
          eyebrow="Studio profile"
          title="Set up your photographer profile"
          description="Keep it simple. These details will help your future client galleries feel like your own studio."
        />
        <div className="mt-8 max-w-xl">
          <ProfileForm profile={profile} userId={user.id} />
        </div>
      </div>
      <Card className="h-fit">
        <CardContent>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Profile preview
          </p>
          <Avatar
            className="mt-6"
            initials={profile?.display_name?.slice(0, 1).toUpperCase() ?? "P"}
          />
          <p className="mt-4 text-lg font-semibold">
            {profile?.display_name ?? "Your studio name"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your client gallery identity
          </p>
          <Button
            className="mt-6 w-full"
            variant="secondary"
            type="button"
            disabled
          >
            {profile?.booking_cta_label ?? "Book a shoot"}
          </Button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Preview only. Client galleries are not available yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
