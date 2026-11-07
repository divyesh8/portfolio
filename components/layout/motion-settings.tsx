"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-media-query";

export function MotionSettings({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const preventCopy = (event: Event) => {
      event.preventDefault();
    };
    const preventSelect = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      event.preventDefault();
    };
    const preventCopyShortcuts = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "c" || key === "x") {
        event.preventDefault();
      } else if (
        key === "a" &&
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
      ) {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", preventCopy, true);
    document.addEventListener("cut", preventCopy, true);
    document.addEventListener("dragstart", preventCopy, true);
    document.addEventListener("selectstart", preventSelect, true);
    document.addEventListener("keydown", preventCopyShortcuts, true);

    return () => {
      document.removeEventListener("copy", preventCopy, true);
      document.removeEventListener("cut", preventCopy, true);
      document.removeEventListener("dragstart", preventCopy, true);
      document.removeEventListener("selectstart", preventSelect, true);
      document.removeEventListener("keydown", preventCopyShortcuts, true);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reduced ? "off" : "on";
    if (reduced) return;

    const syncVisibility = () =>
      root.toggleAttribute("data-page-hidden", document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);

    // One observer for the looping artwork and one-time entrances. Content is
    // visible before hydration and if scripting or animation is unavailable.
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (target.hasAttribute("data-motion-scene")) {
          target.toggleAttribute("data-in-view", isIntersecting);
        } else if (isIntersecting) {
          target.setAttribute("data-entered", "");
          observer.unobserve(target);
        }
      }
    });
    document
      .querySelectorAll("[data-motion-scene], .section-heading")
      .forEach((el) => observer.observe(el));
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncVisibility);
      root.removeAttribute("data-page-hidden");
    };
  }, [reduced]);
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}
