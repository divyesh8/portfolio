"use client";

import { useEffect, useState } from "react";
import type { SectionId } from "@/constants/site";

export function useActiveSection(ids: readonly SectionId[]) {
  const [active, setActive] = useState<SectionId>(ids[0]);
  useEffect(() => {
    const sections = ids.flatMap((id) => {
      const node = document.getElementById(id);
      return node ? [{ id, node }] : [];
    });
    let frame = 0;
    let previous: SectionId | undefined;
    function publish(id: SectionId) {
      if (previous === id) return;
      previous = id;
      setActive(id);
    }
    function measure() {
      frame = 0;
      if (!sections.length) return;
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        publish(sections[sections.length - 1].id);
        return;
      }
      const readingLine = Math.max(90, window.innerHeight * 0.26);
      let current = sections[0].id;
      for (const section of sections) {
        if (section.node.getBoundingClientRect().top > readingLine) break;
        current = section.id;
      }
      publish(current);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ids]);
  return active;
}
