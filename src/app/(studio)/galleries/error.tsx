"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

export default function GalleriesError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow="Gallery library"
        title="Your galleries"
        description="We could not load your gallery library right now."
      />
      <Alert className="mt-10" tone="error">
        <div>
          <p className="font-semibold">Try again in a moment.</p>
          <p className="mt-1">Your saved galleries have not been changed.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={reset}>
              <RefreshCw size={16} aria-hidden="true" /> Try again
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
