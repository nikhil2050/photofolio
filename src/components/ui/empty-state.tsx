import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-dashed border-border bg-surface-muted p-8 text-center sm:p-12",
        className,
      )}
    >
      <Icon
        className="mx-auto text-muted-foreground"
        size={30}
        aria-hidden="true"
      />
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
