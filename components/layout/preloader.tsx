"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-media-query";

// A first-visit entrance cue leaves the page immediately readable and interactive.
export function Preloader() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem("dk-preloaded")) return;
      sessionStorage.setItem("dk-preloaded", "1");
    } catch {
      /* Allow the cue when storage is unavailable. */
    }
    setShow(true);
  }, [reduced]);
  return show && !reduced ? (
    <span
      aria-hidden
      className="entry-rule"
      onAnimationEnd={() => setShow(false)}
    />
  ) : null;
}
