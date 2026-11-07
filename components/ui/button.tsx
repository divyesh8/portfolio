"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-300 ease-[var(--ease-out-quint)] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "action-primary bg-[var(--button)] text-[var(--button-fg)] hover:bg-[var(--button-hover)]",
        outline:
          "border border-[var(--line-strong)] bg-[var(--panel)] text-[var(--fg)] hover:bg-[var(--panel-hover)] hover:border-[var(--fg-subtle)]",
        ghost:
          "text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--panel)]",
      },
      size: {
        sm: "h-11 px-4",
        md: "h-11 px-6",
        lg: "h-12 px-7 text-[15px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
