import Link from "next/link";
import { Camera, LayoutDashboard, Settings } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function DashboardShell({
  children,
  displayName,
}: {
  children: React.ReactNode;
  displayName: string | null;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-[var(--content-dashboard)] items-center justify-between px-6 lg:px-8">
          <Link className="brand" href="/dashboard">
            Photofolio
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {displayName ?? "Your studio"}
            </span>
            <form action={signOut}>
              <Button variant="ghost" size="small" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[var(--content-dashboard)] flex-col lg:flex-row">
        <aside className="border-b border-border px-6 py-4 lg:min-h-[calc(100vh-var(--header-height))] lg:w-[var(--sidebar-width)] lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
          <nav
            aria-label="Studio navigation"
            className="flex gap-2 lg:flex-col"
          >
            <Link className={navLinkClass} href="/dashboard">
              <LayoutDashboard size={18} aria-hidden="true" />
              Overview
            </Link>
            <Link className={navLinkClass} href="/profile">
              <Settings size={18} aria-hidden="true" />
              Profile
            </Link>
            <Link className={navLinkClass} href="/galleries">
              <Camera size={18} aria-hidden="true" />
              Galleries
            </Link>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}

const navLinkClass =
  "inline-flex min-h-11 items-center gap-2.5 rounded-control px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-3 focus-visible:outline-ring focus-visible:outline-offset-2";
