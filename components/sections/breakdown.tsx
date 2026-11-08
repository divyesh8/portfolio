"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media-query";

export function Breakdown() {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [cut, setCut] = useState(55);
  const [manual, setManual] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const headingX = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      className="breakdown section-wrap"
      ref={containerRef}
      aria-labelledby="breakdown-title"
    >
      <div className="breakdown-copy">
        <span className="eyebrow">SYSTEM UNDER THE HOOD</span>
        <motion.h2
          id="breakdown-title"
          className="display"
          style={reduced ? undefined : { x: headingX }}
        >
          FROM FAULT INJECTION. <br />
          <span className="accent">TO INSTANT RECOVERY.</span>
        </motion.h2>
        <p>
          One architecture. Every layer of observability. <br />
          Drag to see how AegisOps isolates service failures and records immutable telemetry.
        </p>
        <span className="breakdown-credit">
          AEGISOPS OBSERVABILITY STACK / 2026 <br />
          FASTAPI · OPENTELEMETRY · PROMETHEUS · POSTGRESQL
        </span>
      </div>

      <div className="comparison">
        <div
          className="comparison-stage"
          style={{ "--cut": `${cut}%` } as React.CSSProperties}
        >
          {/* Base: Failure / Incident State */}
          <div className="media-image loaded">
            <img
              src="/projects/aegisops.webp"
              alt="AegisOps system architecture and service failure monitoring"
              style={{ filter: "brightness(0.7) hue-rotate(-20deg)" }}
            />
          </div>

          {/* Final: Recovery & Metrics State */}
          <div className="comparison-final">
            <div className="media-image loaded" style={{ height: "100%" }}>
              <img
                src="/projects/aegisops.webp"
                alt="AegisOps recovered state with live metrics and distributed traces"
                style={{ filter: "brightness(1.05) contrast(1.08)" }}
              />
            </div>
          </div>

          <span className="comparison-label raw-label">FAULT INJECTION</span>
          <span className="comparison-label final-label">HEALTHY TELEMETRY</span>

          <div className="comparison-divider">
            <span>
              <ChevronLeft size={14} />
              <ChevronRight size={14} />
            </span>
          </div>

          <input
            aria-label="Comparison before and after incident recovery"
            aria-valuetext={`${cut}% incident state, ${100 - cut}% recovery telemetry`}
            type="range"
            min="0"
            max="100"
            value={cut}
            onChange={(e) => {
              setManual(true);
              setCut(Number(e.target.value));
            }}
          />
        </div>

        <div className="comparison-caption">
          <span>DRAG TO OBSERVE RECOVERY</span>
          <span>SLIDE / INTERACT</span>
        </div>
      </div>
    </section>
  );
}

