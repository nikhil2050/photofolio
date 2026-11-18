"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** A safe fallback for unexpected route rendering errors. */
export default function RootError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-card border border-border bg-surface p-8 text-center">
        <AlertCircle
          className="mx-auto text-destructive"
          size={30}
          aria-hidden="true"
        />
        <h1 className="mt-5 text-2xl font-semibold">
          Something needs another try
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          We could not load this part of your studio. Your saved work has not
          been changed.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
