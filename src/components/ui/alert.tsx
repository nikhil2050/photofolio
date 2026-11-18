import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const styles = {
  info: "border-border text-foreground",
  success: "border-success/40 text-success",
  error: "border-destructive/40 text-destructive",
};
const icons = { info: Info, success: CheckCircle2, error: AlertCircle };

export function Alert({
  tone = "info",
  className,
  children,
}: {
  tone?: keyof typeof styles;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon = icons[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-control border bg-surface p-4 text-sm leading-6",
        styles[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
      {children}
    </div>
  );
}
