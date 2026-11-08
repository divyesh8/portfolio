"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, MapPin, MoveDownRight } from "lucide-react";
import { HeroLink } from "@/components/shared/hero-link";
import { EASE, useReducedMotionSafe } from "@/components/shared/motion";
import { TypingText } from "@/components/shared/typing-text";
import { FEATURED_SLUGS, HERO } from "@/constants/content";
import { SITE } from "@/constants/site";

function PortfolioLettering() {
  return (
    <svg
      className="poster-lettering"
      viewBox="0 0 1200 285"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="portfolio-ink"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" className="ink-top" />
          <stop offset="100%" className="ink-base" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="265"
        textLength="1200"
        lengthAdjust="spacingAndGlyphs"
        fill="url(#portfolio-ink)"
      >
        PORTFOLIO
      </text>
    </svg>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 85]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const introY = useTransform(scrollYProgress, [0, 1], [0, -55]);

  return (
    <section
      id="hero"
      ref={heroRef}
      aria-labelledby="poster-title"
      className="folio-hero"
    >
      <div className="shell">
        <div className="poster-stage">
          <div className="poster-register">
            <div>
              <span>Cloud &amp; full-stack</span>
              <span>Engineering portfolio</span>
            </div>
            <span className="poster-status">
              <i aria-hidden /> Open to internships
            </span>
          </div>

          <div className="poster-art">
            <motion.div
              className="poster-lettering-wrap"
              style={reduced ? undefined : { y: titleY }}
              initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <PortfolioLettering />
            </motion.div>

            <motion.figure
              className="poster-portrait"
              style={
                reduced ? undefined : { y: portraitY, scale: portraitScale }
              }
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
            >
              <div className="portrait-silhouette">
                <Image
                  src={SITE.portrait}
                  alt={`Portrait of ${SITE.name}`}
                  width={960}
                  height={1280}
                  sizes="(max-width: 600px) 90vw, (max-width: 960px) 65vw, 48vw"
                  draggable={false}
                  priority
                />
              </div>
            </motion.figure>
          </div>

          <motion.div
            className="poster-copy"
            style={reduced ? undefined : { y: introY }}
            initial={reduced ? false : { opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
          >
            <p className="handwritten poster-hello">Hello, I’m</p>
            <h1 id="poster-title">
              {SITE.name}
              <i>.</i>
            </h1>
            <div className="poster-role">
              <TypingText words={HERO.roles} />
            </div>
            <p className="poster-intro">{HERO.intro}</p>
            <div className="poster-actions">
              <HeroLink href="#work" className="folio-button">
                View my work <ArrowDown size={16} aria-hidden />
              </HeroLink>
              <HeroLink
                href={SITE.resumePath}
                target="_blank"
                rel="noopener noreferrer"
                className="poster-resume"
              >
                Résumé <ArrowUpRight size={14} aria-hidden />
              </HeroLink>
            </div>
            <p className="poster-location">
              <MapPin size={12} aria-hidden />
              {SITE.location}
            </p>
          </motion.div>

          <motion.aside
            className="poster-aside"
            aria-label="Portfolio at a glance"
            initial={reduced ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, delay: 0.55, ease: EASE }}
          >
            <div className="poster-manifesto">
              <span className="folio-asterisk" aria-hidden>
                ✳
              </span>
              <p>
                Building reliable software,
                <br />
                from code to cloud.
              </p>
            </div>
            <div className="poster-facts">
              <HeroLink href="#work">
                <strong>
                  {String(FEATURED_SLUGS.length).padStart(2, "0")}
                </strong>
                <span>
                  Selected
                  <br />
                  engineering builds
                </span>
                <ArrowUpRight size={13} />
              </HeroLink>
              <HeroLink href="#about">
                <strong>’{String(SITE.graduation).slice(-2)}</strong>
                <span>
                  Graduating class
                  <br />
                  SRM Institute
                </span>
                <ArrowUpRight size={13} />
              </HeroLink>
            </div>
          </motion.aside>
        </div>

        <div className="poster-foot">
          <HeroLink href="#inside">
            <span className="folio-round">
              <MoveDownRight size={14} />
            </span>
            <b>Inside AegisOps</b>
            <span className="foot-kind">Field notes / 01</span>
          </HeroLink>
          <HeroLink href="#work" className="poster-scroll">
            Scroll to explore <ArrowDown size={13} />
          </HeroLink>
          <span className="foot-edition">
            Personal portfolio <i>/</i> {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </section>
  );
}
