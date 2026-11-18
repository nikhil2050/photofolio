import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("mb-2 block text-sm font-semibold", className)}
      {...props}
    />
  );
}

export function HelperText({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-2 text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export function ValidationMessage({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "border-l-3 border-destructive pl-3 text-sm leading-6 text-destructive",
        className,
      )}
      role="alert"
      {...props}
    />
  );
}

export function SuccessMessage({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "border-l-3 border-success pl-3 text-sm leading-6 text-success",
        className,
      )}
      role="status"
      {...props}
    />
  );
}
