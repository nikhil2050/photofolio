import Link from "next/link";

export function LegalPage({
  title,
  children,
}: {
  title: string;
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
        <div className="mt-8 space-y-6 leading-7 text-muted-foreground">
          {children}
        </div>
      </article>
    </main>
  );
}
