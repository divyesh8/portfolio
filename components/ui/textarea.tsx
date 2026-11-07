import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full resize-y rounded-[3px] border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[15px] leading-relaxed text-[var(--fg)]",
      "placeholder:text-[var(--fg-subtle)]",
      "transition-colors duration-200 ease-[var(--ease-out-quint)]",
      "hover:border-[var(--line-strong)] focus:border-[var(--color-accent)] focus:bg-[var(--panel-hover)] focus:outline-none",
      "aria-[invalid=true]:border-[var(--color-accent)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
