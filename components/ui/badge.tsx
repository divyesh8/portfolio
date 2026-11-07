import * as React from "react";
import { cn } from "@/lib/utils";

/** Editorial mono chip used for tech stacks, languages and metadata. */
export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1",
        "font-mono text-[10px] font-medium uppercase tracking-[0.09em] text-[var(--fg-muted)]",
        "transition-colors duration-200 ease-[var(--ease-out-quint)]",
        className,
      )}
      {...props}
    />
  );
}
