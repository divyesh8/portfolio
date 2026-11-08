"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin, Play } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-media-query";

const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

export function Hero({
  onSelectProject,
}: {
  onSelectProject?: (slug: string) => void;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 85]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const introY = useTransform(scrollYProgress, [0, 1], [0, -55]);

  return (
    <section id="home" className="hero" ref={heroRef}>
      <div className="hero-top">
        <span>
          CLOUD &amp; FULL-STACK DEVELOPER <br />
          <span className="muted">PLATFORM &amp; SRE</span>
        </span>
        <span className="availability">
          <i />
          <span>
            AVAILABLE <span className="avail-long">FOR NEW ROLES</span>
          </span>
        </span>
      </div>

      <motion.div
        className="hero-title display"
        aria-hidden="true"
        style={reduced ? undefined : { y: titleY }}
        initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)" }}
        transition={{ duration: 1.4, ease: EASE_QUINT }}
      >
        PORTFOLIO
      </motion.div>

      <motion.div
        className="hero-portrait"
        style={
          reduced ? undefined : { y: portraitY, scale: portraitScale }
        }
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <img
          src="/divyesh-kolli.webp"
          alt="Divyesh Kolli, Cloud & Full-Stack Developer"
          width={960}
          height={1280}
          fetchPriority="high"
        />
      </motion.div>

      <motion.div
        className="hero-intro"
        style={reduced ? undefined : { y: introY }}
        initial={reduced ? false : { opacity: 0, x: -35 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.35, ease: EASE_QUINT }}
      >
        <p className="handwriting">Hello, I’m</p>
        <h1 className="display">
          DIVYESH<span>.</span>
        </h1>
        <p className="hero-role">
          CLOUD &amp; FULL-STACK
          <br />
          DEVELOPER
        </p>
        <p className="hero-description">
          Building reliable software, from code to cloud.
          <br />
          I study cloud computing at SRM in Chennai and build backend services and observability tools.
        </p>
        <a href="#portfolio" className="primary-link">
          See my work <ArrowDown size={17} />
        </a>
        <span className="hero-location">
          <MapPin size={12} /> CHENNAI, INDIA
        </span>
      </motion.div>

      <motion.div
        className="hero-side"
        initial={reduced ? false : { opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.55, ease: EASE_QUINT }}
      >
        <div className="hero-manifesto">
          <span className="crosshair" aria-hidden="true">
            ✳
          </span>
          <p>
            Every line.
            <br />A purpose.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <span className="display">
              04<span>+</span>
            </span>
            <p>
              FEATURED BUILDS
              <br />
              FOR THE CLOUD
            </p>
          </div>
          <div>
            <span className="display">'29</span>
            <p>
              GRADUATING CLASS
              <br />
              SRM INSTITUTE
            </p>
          </div>
          <div className="hero-award-stat">
            <span className="display">
              100<span>%</span>
            </span>
            <a href="#about" aria-label="View reliability philosophy">
              OBSERVABLE &amp;
              <br />
              VERIFIABLE <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </motion.div>

      <div className="hero-bottom">
        <button
          type="button"
          className="reel-button"
          onClick={() => onSelectProject?.("aegisops")}
        >
          <span className="play-circle">
            <Play size={12} fill="currentColor" />
          </span>
          VIEW FEATURED BUILD <span className="muted">AEGISOPS</span>
        </button>
        <span className="hero-scroll">
          SCROLL TO DISCOVER <ArrowDown size={13} />
        </span>
        <span className="edition">SELECTED WORK / 2025–2029</span>
      </div>
    </section>
  );
}
