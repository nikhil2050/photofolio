import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return (
    <DashboardShell displayName={profile?.display_name ?? null}>
      {children}
    </DashboardShell>
  );
}
