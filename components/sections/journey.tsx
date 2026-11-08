"use client";

import { useState } from "react";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EXPERIENCES = [
  {
    date: "2025 · NOW",
    title: "B.Tech in CSE (Cloud Computing)",
    place: "SRM Institute of Science and Technology",
    text: "Studying Computer Science and Engineering with specialization in Cloud Computing at SRM IST, Chennai. Coursework and practical lab implementations in operating systems, computer networks, distributed architectures, and containerized cloud services.",
  },
  {
    date: "2026 · NOW",
    title: "Systems & Reliability Engineering",
    place: "AegisOps · CloudDoctor · Nimbus",
    text: "Designed and implemented AegisOps (distributed probe control plane with OpenTelemetry and Prometheus), CloudDoctor (static analysis CLI detecting Docker Compose and .env drift), and Nimbus (Java NIO RESP in-memory store with AOF durability).",
  },
  {
    date: "2026 · NOW",
    title: "Full-Stack Web Engineering",
    place: "ThreadLabz · VibeConnect · ActionLens",
    text: "Engineered scalable web applications with Next.js, TypeScript, PostgreSQL, and Supabase, including transactional stock reservation algorithms, WebRTC peer signaling, and browser-local OCR pipelines.",
  },
  {
    date: "2029 · EXPECTED",
    title: "B.Tech Graduation",
    place: "Cloud, SRE & Platform Engineering",
    text: "Completing graduation from SRM Institute of Science and Technology, prepared for high-impact roles in Site Reliability Engineering (SRE), Platform Engineering, and Distributed Cloud Infrastructure.",
  },
];

const MILESTONES = [
  { slug: "aegisops", title: "AegisOps", category: "Cloud & Reliability", year: "2026" },
  { slug: "clouddoctor", title: "CloudDoctor", category: "Static Analysis CLI", year: "2026" },
  { slug: "nimbus", title: "Nimbus", category: "In-Memory Store (RESP)", year: "2026" },
  { slug: "threadlabz", title: "ThreadLabz", category: "Full-Stack Storefront", year: "2026" },
];

export function Journey({
  onSelectProject,
}: {
  onSelectProject?: (slug: string) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="experience" className="journey section-wrap">
      <div className="section-heading">
        <div>
          <span className="eyebrow">03 / THE JOURNEY</span>
          <h2>
            KEEP BUILDING. KEEP SHIPPING<span className="accent">.</span>
          </h2>
        </div>
        <span className="text-link" style={{ cursor: "default" }}>
          EXPERIENCE &amp; MILESTONES
        </span>
      </div>

      <div className="journey-grid">
        {/* Accordion Experience List */}
        <div className="experience-list">
          {EXPERIENCES.map((exp, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={exp.title}
                className={`experience-row ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`job-${idx}`}
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                >
                  <span className="experience-date">{exp.date}</span>
                  <span>
                    <h3>{exp.title}</h3>
                    <span className="experience-place">{exp.place}</span>
                  </span>
                  {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`job-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{exp.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Milestones Panel */}
        <div className="awards-panel">
          <p className="eyebrow">A FEW MILESTONES</p>
          <h3 className="display">
            SHIPPED. <br />
            <span className="accent">LIVE. TESTED.</span>
          </h3>
          <div className="award-list">
            {MILESTONES.map((m, i) => (
              <button
                key={m.slug}
                type="button"
                onClick={() => onSelectProject?.(m.slug)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {m.title}
                  <small>
                    {m.category} · {m.year}
                  </small>
                </span>
                <ArrowUpRight size={19} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
