"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Plus } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import type { JourneyEntry } from "@/constants/content";
import { useReducedMotion } from "@/hooks/use-media-query";

function Milestones({
  entries,
  defaultOpenFirst = false,
}: {
  entries: JourneyEntry[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <ol className="journey-list">
      {entries.map((entry, idx) => (
        <li key={entry.year + entry.title} className="journey-item">
          <span className="journey-node" aria-hidden />
          <details open={defaultOpenFirst && idx === 0}>
            <summary>
              <span className="journey-year">
                {entry.period ?? entry.year}
              </span>
              <span className="journey-title-group">
                <span className="journey-title">{entry.title}</span>
                {entry.category && (
                  <span className="journey-category">{entry.category}</span>
                )}
              </span>
              <Plus size={16} aria-hidden />
            </summary>
            <div className="journey-body">
              <p>{entry.detail}</p>
              {entry.repo && (
                <a
                  className="journey-source"
                  href={entry.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View repository <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          </details>
        </li>
      ))}
    </ol>
  );
}

export function JourneyTimeline({ entries }: { entries: JourneyEntry[] }) {
  const archived = entries.filter((entry) => entry.archived);
  const primary = entries.filter((entry) => !entry.archived);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = trackRef.current;
    if (!el || reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-journey-spine]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 75%",
            end: "bottom 45%",
            scrub: 0.35,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="journey" className="section-band">
      <div className="section-block shell journey-layout">
        <SectionHeading
          eyebrow="04 / Milestones"
          title="Engineering journey"
          lede="Academic foundation at SRM Institute of Science and Technology and the systems projects that shaped how I build."
        />
        <div ref={trackRef} className="journey-track">
          <span
            className="journey-spine-bg"
            aria-hidden
          />
          <span
            data-journey-spine
            className="journey-spine-fill"
            aria-hidden
          />
          <Milestones entries={primary} defaultOpenFirst />
          {archived.length > 0 && (
            <details className="journey-archive">
              <summary>
                <Plus size={15} /> Additional project milestones ({archived.length})
              </summary>
              <Milestones entries={archived} />
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
