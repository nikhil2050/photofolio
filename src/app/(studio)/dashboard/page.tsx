import { Images } from "lucide-react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isReady = Boolean(profile?.setup_completed_at);

  if (!isReady) redirect("/profile");

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
      <EmptyState
        className="mt-10"
        icon={Images}
        title="No galleries yet"
        description="Gallery delivery is not available in this foundation phase. Your private image-storage infrastructure is being prepared for a secure future workflow."
      />
    </div>
  );
}
