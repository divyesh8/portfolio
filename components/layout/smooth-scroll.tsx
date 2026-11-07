"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useFinePointer, useReducedMotion } from "@/hooks/use-media-query";

// Native fragment navigation owns focus, history and the sticky-header offset.
// Lenis interpolates wheel input only while an actual scroll is in progress,
// and notifies GSAP ScrollTrigger on scroll ticks.
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  useEffect(() => {
    if (reduced || !fine) return;
    let cancelled = false;
    let frame = 0;
    let instance: import("lenis").default | undefined;
    function tick(time: number) {
      frame = 0;
      instance?.raf(time);
      if (instance?.isScrolling === "smooth")
        frame = requestAnimationFrame(tick);
    }
    function wake() {
      if (frame || !instance || document.hidden) return;
      instance.raf(performance.now());
      frame = requestAnimationFrame(tick);
    }
    function syncVisibility() {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden && instance?.isScrolling === "smooth") {
        instance.time = performance.now();
        wake();
      }
    }
    function beforeAnchor(event: MouseEvent) {
      if (
        instance?.isScrolling === "smooth" &&
        event.target instanceof Element &&
        event.target.closest('a[href^="#"]')
      ) {
        instance.scrollTo(window.scrollY, { immediate: true, force: true });
      }
    }
    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      instance = new Lenis({
        autoRaf: false,
        duration: 0.72,
        smoothWheel: true,
        syncTouch: false,
        prevent: (node) =>
          Boolean(node.closest('[role="dialog"], [data-lenis-prevent]')),
      });
      instance.on("virtual-scroll", wake);
      instance.on("scroll", () => ScrollTrigger.update());
      document.addEventListener("visibilitychange", syncVisibility);
      document.addEventListener("click", beforeAnchor, true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", syncVisibility);
      document.removeEventListener("click", beforeAnchor, true);
      instance?.destroy();
    };
  }, [reduced, fine]);
  return null;
}
