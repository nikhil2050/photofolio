import { cn } from "@/lib/utils/cn";

export function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-accent-strong",
        className,
      )}
      aria-label={`Avatar: ${initials}`}
    >
      {initials}
    </div>
  );
}
