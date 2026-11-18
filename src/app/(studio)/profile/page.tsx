import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  return (
    <div className="grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <p className="text-sm font-medium text-[var(--accent-strong)]">
          Studio profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Set up your photographer profile
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
          Keep it simple. These details will help your future client galleries
          feel like your own studio.
        </p>
        <div className="mt-8 max-w-xl">
          <ProfileForm profile={profile} userId={user.id} />
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-border bg-surface p-6">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Profile preview
        </p>
        <div className="mt-6 flex size-14 items-center justify-center rounded-full bg-surface-muted text-lg font-semibold text-[var(--accent-strong)]">
          {profile?.display_name?.slice(0, 1).toUpperCase() ?? "P"}
        </div>
        <p className="mt-4 text-lg font-semibold">
          {profile?.display_name ?? "Your studio name"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your client gallery identity
        </p>
        <button
          className="button button-secondary mt-6 w-full"
          type="button"
          disabled
        >
          {profile?.booking_cta_label ?? "Book a shoot"}
        </button>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Preview only. Client galleries are not available yet.
        </p>
      </aside>
    </div>
  );
}
