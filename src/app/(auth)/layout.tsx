import Link from "next/link";
import { LegalLinks } from "@/components/layout/legal-links";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <Link className="brand" href="/">
          Photofolio
        </Link>
        {children}
        <div className="mt-8 border-t border-border pt-5">
          <LegalLinks />
        </div>
      </section>
    </main>
  );
}
