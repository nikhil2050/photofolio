import Link from "next/link";
import { LegalLinks } from "@/components/layout/legal-links";
import { Alert } from "@/components/ui/alert";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <Link className="brand" href="/">
          Photofolio
        </Link>
        <p className="mt-12 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
          Legal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          {description}
        </p>
        <Alert className="mt-8" tone="info">
          <p>
            Phase 1 draft for product planning. It is not legal advice and must
            be completed and reviewed before public launch.
          </p>
        </Alert>
        <div className="mt-8 space-y-6 leading-7 text-muted-foreground">
          {children}
        </div>
        <footer className="mt-12 border-t border-border pt-6">
          <LegalLinks />
        </footer>
      </article>
    </main>
  );
}
