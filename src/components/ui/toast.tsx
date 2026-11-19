"use client";

import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] sm:right-6 sm:top-6" role="status" aria-live="polite">
      <div className="pointer-events-auto flex items-start gap-3 rounded-card border border-success/40 bg-surface p-4 text-sm leading-6 text-success shadow-floating">
        <CheckCircle2 className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
        <p className="min-w-0 flex-1">{message}</p>
        <Button type="button" size="icon" variant="ghost" className="-mr-2 -mt-2 size-10 text-muted-foreground" aria-label="Dismiss notification" onClick={onDismiss}>
          <X size={17} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
