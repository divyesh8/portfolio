"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media-query";

/* ------------------------------------------------------------------
   ScrollProgress — a 2px accent rule pinned to the top of the viewport.
   ------------------------------------------------------------------ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 28,
    restDelta: 0.001,
  });

  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent"
    />
  );
}

/* ------------------------------------------------------------------
   BackToTop — appears once the hero is behind you.
   ------------------------------------------------------------------ */

export function BackToTop() {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const footer = document.querySelector(".site-footer");
    if (!hero) return;
    let heroBehind = false;
    let footerVisible = false;
    const sync = () => setShown(heroBehind && !footerVisible);

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          heroBehind =
            !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        } else if (entry.target === footer) {
          footerVisible = entry.isIntersecting;
        }
      }
      sync();
    });
    observer.observe(hero);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {shown ? (
        <motion.a
          href="#hero"
          aria-label="Back to top"
          initial={reduced ? false : { opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.9 }}
          transition={{
            duration: reduced ? 0 : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[var(--dialog-surface)] text-[var(--fg-muted)] transition-colors duration-300 hover:border-accent hover:text-[var(--fg)]"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.a>
      ) : null}
    </AnimatePresence>
  );
}
