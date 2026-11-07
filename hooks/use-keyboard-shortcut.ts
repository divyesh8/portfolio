"use client";

import { useEffect } from "react";

type Options = {
  /** Match Ctrl on Windows/Linux and Cmd on macOS. */
  meta?: boolean;
  shift?: boolean;
  /** Fire even while a text field has focus. Off by default. */
  allowInInput?: boolean;
};

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** Bind one keyboard shortcut for as long as the component is mounted. */
export function useKeyboardShortcut(
  key: string,
  handler: (event: KeyboardEvent) => void,
  { meta = false, shift = false, allowInInput = false }: Options = {},
) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (meta && !(event.metaKey || event.ctrlKey)) return;
      if (!meta && (event.metaKey || event.ctrlKey)) return;
      if (shift !== event.shiftKey) return;
      if (!allowInInput && isTypingTarget(event.target)) return;
      handler(event);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler, meta, shift, allowInInput]);
}
