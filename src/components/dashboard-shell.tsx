import Link from "next/link";
import { Camera, LayoutDashboard, Settings } from "lucide-react";
import { signOut } from "@/app/actions/auth";

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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link className="brand" href="/dashboard">
            Photofolio
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {displayName ?? "Your studio"}
            </span>
            <form action={signOut}>
              <button className="button button-ghost" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-border px-6 py-4 lg:min-h-[calc(100vh-65px)] lg:w-60 lg:border-r lg:border-b-0 lg:px-5 lg:py-8">
          <nav
            aria-label="Studio navigation"
            className="flex gap-2 lg:flex-col"
          >
            <Link className="nav-link" href="/dashboard">
              <LayoutDashboard size={18} aria-hidden="true" />
              Overview
            </Link>
            <Link className="nav-link" href="/profile">
              <Settings size={18} aria-hidden="true" />
              Profile
            </Link>
            <span
              className="nav-link cursor-not-allowed opacity-50"
              aria-disabled="true"
            >
              <Camera size={18} aria-hidden="true" />
              Galleries <span className="ml-auto text-xs">Soon</span>
            </span>
          </nav>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
