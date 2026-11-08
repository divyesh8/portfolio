"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  Pause,
  Play,
  Plus,
  Search,
  X,
} from "lucide-react";
import { PROJECT_OVERRIDES, type Project } from "@/constants/content";
import { useReducedMotion } from "@/hooks/use-media-query";

const EASE_QUINT = [0.22, 1, 0.36, 1] as const;

export interface PortfolioItem {
  slug: string;
  title: string;
  category: string;
  role: string;
  year: string;
  description: string;
  image: string;
  type: string;
  repo: string | null;
  href: string | null;
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    slug: "aegisops",
    title: "AegisOps",
    category: "Cloud",
    role: "FastAPI · OpenTelemetry · Prometheus · PostgreSQL",
    year: "2026",
    description:
      "Distributed service reliability platform that tracks failures from concurrent health probes through durable operational events, incident timelines, OpenTelemetry traces, and Prometheus metrics.",
    image: "/projects/aegisops.webp",
    type: "SYSTEM / CLOUD",
    repo: "https://github.com/divyesh8/AegisOps",
    href: null,
  },
  {
    slug: "clouddoctor",
    title: "CloudDoctor",
    category: "Systems",
    role: "Java 21 · Static Analysis · Docker Compose CLI",
    year: "2026",
    description:
      "A deterministic Java 21 static analysis CLI that detects environment and Docker Compose configuration drift before deployment.",
    image: "/projects/clouddoctor.webp",
    type: "CLI / ENGINE",
    repo: "https://github.com/divyesh8/CloudDoctor",
    href: null,
  },
  {
    slug: "nimbus",
    title: "Nimbus",
    category: "Systems",
    role: "Java NIO · RESP / TCP · AOF Crash Recovery",
    year: "2026",
    description:
      "A dependency-free Java in-memory key-value store speaking the Redis wire protocol (RESP) over raw TCP, with append-only log persistence and replication.",
    image: "/projects/nimbus.webp",
    type: "DATABASE / TCP",
    repo: "https://github.com/divyesh8/nimbus",
    href: null,
  },
  {
    slug: "threadlabz",
    title: "ThreadLabz",
    category: "Web",
    role: "Next.js · TypeScript · Supabase · Tailwind",
    year: "2026",
    description:
      "Full-stack apparel storefront engineered with server-authoritative cart state, atomic 15-minute PostgreSQL stock reservations, and test-mode payment verification.",
    image: "/projects/threadlabz.webp",
    type: "STOREFRONT / WEB",
    repo: "https://github.com/divyesh8/threadlabz",
    href: "https://threadlabz.vercel.app",
  },
  {
    slug: "vibeconnect",
    title: "VibeConnect",
    category: "Web",
    role: "Next.js · WebRTC · Supabase Realtime",
    year: "2026",
    description:
      "Anonymous, real-time video communication platform with transactional matching queues, moderated chat, and direct peer-to-peer WebRTC media streams.",
    image: "/projects/aegisops.webp",
    type: "WEBRTC / WEB",
    repo: "https://github.com/divyesh8/VibeConnect",
    href: "https://vibe-connect-delta.vercel.app",
  },
  {
    slug: "actionlens",
    title: "ActionLens",
    category: "Product",
    role: "Next.js · Tesseract.js · PDF.js · Supabase",
    year: "2026",
    description:
      "Document analysis platform extracting evidence-backed obligations via browser-local OCR and tracking verified findings through completion.",
    image: "/projects/clouddoctor.webp",
    type: "OCR / PRODUCT",
    repo: "https://github.com/divyesh8/ActionLens",
    href: "https://action-lens-azure.vercel.app",
  },
];

const TOOLS_LIST = [
  { name: "Python", category: "Backend" },
  { name: "Java", category: "Systems" },
  { name: "Docker", category: "Containers" },
  { name: "FastAPI", category: "Microservices" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Linux", category: "Infrastructure" },
  { name: "Next.js", category: "Full-Stack" },
  { name: "TypeScript", category: "Language" },
  { name: "AWS", category: "Cloud" },
  { name: "Prometheus", category: "Monitoring" },
  { name: "OpenTelemetry", category: "Observability" },
  { name: "Git", category: "DevOps" },
];

function BrandSection() {
  const [showAll, setShowAll] = useState(false);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || paused || showAll || !viewportRef.current) return;
    const el = viewportRef.current;
    let animId: number;
    const step = () => {
      el.scrollLeft += 0.8;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0;
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [reduced, paused, showAll]);

  const scrollByAmount = (direction: number) => {
    setPaused(true);
    viewportRef.current?.scrollBy({
      left: direction * 280,
      behavior: "smooth",
    });
  };

  return (
    <div className="brand-section">
      <div className="brand-heading">
        <p>
          BUILT WITH <br />
          <strong>THE TOOLS I TRUST.</strong>
        </p>
        <div>
          <button
            type="button"
            className="brand-all"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
            aria-controls="brand-collection"
          >
            {showAll ? "SHOW ROW" : `SEE ALL (${TOOLS_LIST.length})`}
            {showAll ? <Minus size={14} /> : <Plus size={14} />}
          </button>
          {!showAll && (
            <>
              <button
                type="button"
                className="icon-button brand-pause"
                aria-label={paused ? "Play tool marquee" : "Pause tool marquee"}
                aria-pressed={paused}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => scrollByAmount(-1)}
                aria-label="Previous tools"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={() => scrollByAmount(1)}
                aria-label="Next tools"
              >
                <ChevronRight size={17} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        id="brand-collection"
        className={showAll ? "brand-full-grid" : "brand-viewport"}
        ref={viewportRef}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        tabIndex={showAll ? undefined : 0}
        role={showAll ? "list" : "region"}
        aria-label="Tools and technologies, scroll to see all"
      >
        {showAll ? (
          TOOLS_LIST.map((tool) => (
            <div key={tool.name} className="brand-logo" role="listitem">
              <span className="display" style={{ fontSize: "28px" }}>
                {tool.name}
              </span>
              <span>{tool.category}</span>
            </div>
          ))
        ) : (
          <div className="brand-rail">
            {[0, 1].map((copyIndex) => (
              <div
                key={copyIndex}
                className="brand-set"
                aria-hidden={copyIndex === 1 ? true : undefined}
              >
                {TOOLS_LIST.map((tool) => (
                  <div key={tool.name} className="brand-logo">
                    <span
                      className="display"
                      style={{
                        fontSize: "26px",
                        letterSpacing: "-0.02em",
                        color: "var(--ink)",
                      }}
                    >
                      {tool.name}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: "9px",
                        color: "var(--muted)",
                        marginTop: "2px",
                      }}
                    >
                      {tool.category}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Portfolio({
  onSelectProject,
}: {
  onSelectProject?: (slug: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [limit, setLimit] = useState(9);
  const reduced = useReducedMotion();

  const categories = ["All", "Cloud", "Systems", "Web", "Product"];

  const filtered = PORTFOLIO_ITEMS.filter((item) => {
    const matchCat = filter === "All" || item.category === filter;
    const matchText = `${item.title} ${item.category} ${item.role} ${item.description}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchCat && matchText;
  });

  const displayed =
    showAll || filter !== "All" || query
      ? filtered.slice(0, limit)
      : filtered.slice(0, 3);

  return (
    <section id="portfolio" className="portfolio section-wrap">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / SELECTED WORK</span>
          <h2>
            WORK THAT SPEAKS<span className="accent">.</span>
          </h2>
        </div>
        <button
          type="button"
          className="text-link"
          onClick={() => {
            if (showAll) {
              setShowAll(false);
              setFilter("All");
              setQuery("");
            } else {
              setShowAll(true);
              setLimit(9);
            }
          }}
        >
          {showAll ? "FEATURED WORK" : "ALL WORK"}
          <ArrowRight size={21} />
        </button>
      </div>

      <div className="portfolio-toolbar">
        <div className="filters" role="group" aria-label="Work categories">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={filter === cat ? "selected" : ""}
              aria-pressed={filter === cat}
              onClick={() => {
                setFilter(cat);
                setShowAll(true);
                setLimit(9);
              }}
            >
              {cat}
              {filter === cat && (
                <motion.span
                  className="filter-line"
                  layoutId="portfolio-filter-line"
                />
              )}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search size={15} />
          <span>Search</span>
          <input
            aria-label="Search work"
            type="search"
            placeholder="Title or category…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowAll(true);
              setLimit(9);
            }}
          />
        </label>
      </div>

      <motion.div className="project-grid" layout={!reduced}>
        <AnimatePresence mode="popLayout">
          {displayed.map((item, idx) => (
            <motion.article
              key={item.slug}
              className="project-card"
              layout={!reduced}
              initial={reduced ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.08 }}
              transition={{
                duration: reduced ? 0 : 0.6,
                delay: (idx % 3) * 0.06,
                ease: EASE_QUINT,
              }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <button
                type="button"
                className="project-open"
                onClick={() => onSelectProject?.(item.slug)}
                aria-label={`View ${item.title}`}
              >
                <div className="project-picture">
                  <span className="media-image loaded">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      width="960"
                      height="600"
                    />
                  </span>
                </div>
                <span className="project-type">{item.type}</span>
                <span className="project-hover">
                  <ArrowUpRight size={22} />
                </span>
                <span className="project-frame" aria-hidden="true" />
              </button>

              <button
                type="button"
                className="project-caption"
                onClick={() => onSelectProject?.(item.slug)}
              >
                <span className="project-number display">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span>
                  <h3>{item.title}</h3>
                  <span className="project-category">
                    {item.category} / {item.year}
                  </span>
                </span>
                <ArrowUpRight size={20} />
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {displayed.length === 0 && (
        <div className="empty-state">
          <p>No work found for “{query}”.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Reset search <X size={15} />
          </button>
        </div>
      )}

      {showAll && filtered.length > limit && (
        <div className="load-more">
          <button
            type="button"
            className="outline-button"
            onClick={() => setLimit((c) => c + 9)}
          >
            Show more work <Plus size={16} />
          </button>
          <span>
            {displayed.length} of {filtered.length} projects
          </span>
        </div>
      )}

      <BrandSection />
    </section>
  );
}

