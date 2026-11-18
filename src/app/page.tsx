import Link from "next/link";
import {
  ArrowUpRight,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircle,
} from "lucide-react";
import { LegalLinks } from "@/components/layout/legal-links";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <span className="brand">Photofolio</span>
        <Button variant="secondary" size="small" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </header>
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <p className="mb-6 text-xs font-semibold tracking-[0.18em] text-[var(--accent-strong)] uppercase">
            For independent photographers
          </p>
          <h1 className="font-display text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
            Your work deserves more than a link.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            Create a studio presence designed for thoughtful delivery today and
            beautiful client galleries tomorrow.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button size="large" asChild>
              <Link href="/sign-up">
                Create your studio <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="secondary" size="large" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
        <div
          aria-label="Photofolio product preview"
          className="rounded-2xl border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(36,36,33,0.08)]"
        >
          <div className="rounded-xl bg-surface-muted p-6">
            <p className="text-sm font-semibold">
              Your studio, quietly present
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3" aria-hidden="true">
              <div className="h-28 rounded-control bg-surface" />
              <div className="h-28 rounded-control bg-border" />
              <div className="h-28 rounded-control bg-accent/40" />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <div>
                <p className="text-sm font-medium">Private client galleries</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Coming after your studio is ready
                </p>
              </div>
              <LockKeyhole size={20} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 lg:px-8">
          <Feature
            icon={<ImageIcon size={22} />}
            title="Set up your studio"
            description="Create your account and profile once, so your identity is ready for every future delivery."
          />
          <Feature
            icon={<LockKeyhole size={22} />}
            title="Deliver with care"
            description="Private originals and controlled previews are part of the foundation from day one."
          />
          <Feature
            icon={<MessageCircle size={22} />}
            title="Stay approachable"
            description="A future gallery will keep your contact and booking path close to the work."
          />
        </div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <span className="text-sm text-muted-foreground">
          Photofolio · Phase 1 foundation
        </span>
        <LegalLinks />
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-5 text-[var(--accent-strong)]" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
