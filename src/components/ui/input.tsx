import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex min-h-11 w-full rounded-control border border-input bg-surface px-3 py-2 text-base outline-none placeholder:text-muted-foreground/70 focus-visible:ring-3 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
