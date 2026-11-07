"use client";

import { useRef, type ComponentPropsWithRef } from "react";

// Some browsers send a click after selecting anchor text. Suppress only the
// release of that drag, so a fresh click or keyboard activation still follows it.
export function HeroLink({ children, ...props }: ComponentPropsWithRef<"a">) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <a
      {...props}
      draggable={false}
      onPointerDown={(event) => {
        start.current = { x: event.clientX, y: event.clientY };
        props.onPointerDown?.(event);
      }}
      onClick={(event) => {
        const from = start.current;
        start.current = null;
        const selection = window.getSelection();
        if (
          event.detail &&
          from &&
          Math.hypot(event.clientX - from.x, event.clientY - from.y) > 3 &&
          selection &&
          !selection.isCollapsed &&
          event.currentTarget.contains(selection.anchorNode)
        ) {
          event.preventDefault();
          return;
        }
        props.onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
