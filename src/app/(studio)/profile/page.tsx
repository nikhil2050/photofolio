import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";
import { PageHeader } from "@/components/ui/page-header";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Studio profile"
        title={
          profile?.setup_completed_at
            ? "Edit your photographer profile"
            : "Set up your photographer profile"
        }
        description="Add the details clients should see when they receive a gallery from you."
      />
      <ProfileForm profile={profile} />
    </div>
  );
}
