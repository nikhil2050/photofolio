import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-full bg-surface-muted px-2.5 text-xs font-semibold text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
