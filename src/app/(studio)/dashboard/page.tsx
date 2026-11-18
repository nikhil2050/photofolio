import Link from "next/link";
import { Images, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getProfile } from "@/lib/profile/repository";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const isReady = Boolean(profile?.display_name);

  return (
    <div className="max-w-3xl">
      <p className="text-sm font-medium text-[var(--accent-strong)]">
        Studio overview
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {isReady
          ? `Welcome back, ${profile?.display_name}`
          : "Your studio starts here"}
      </h1>
      <p className="mt-3 max-w-xl leading-7 text-muted-foreground">
        Set up the essentials now so your studio is ready when private galleries
        arrive.
      </p>
      {!isReady ? (
        <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
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
          <Link className="button button-primary mt-6" href="/profile">
            Set up your profile
          </Link>
        </section>
      ) : null}
      <section className="mt-10 rounded-2xl border border-dashed border-border bg-surface-muted p-8 text-center sm:p-12">
        <Images
          className="mx-auto text-muted-foreground"
          size={30}
          aria-hidden="true"
        />
        <h2 className="mt-5 text-xl font-semibold">No galleries yet</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
          Gallery delivery is not available in this foundation phase. Your
          private image-storage infrastructure is being prepared for a secure
          future workflow.
        </p>
      </section>
    </div>
  );
}
