import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-12 w-full rounded-[3px] border border-[var(--line)] bg-[var(--panel)] px-4 text-[15px] text-[var(--fg)]",
      "placeholder:text-[var(--fg-subtle)]",
      "transition-colors duration-200 ease-[var(--ease-out-quint)]",
      "hover:border-[var(--line-strong)] focus:border-[var(--color-accent)] focus:bg-[var(--panel-hover)] focus:outline-none",
      "aria-[invalid=true]:border-[var(--color-accent)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
