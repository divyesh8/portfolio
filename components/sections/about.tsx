"use client";

import { useRef } from "react";
import { motion, useScroll } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-media-query";

const PROCESS_STEPS = [
  [
    "01",
    "PROBE",
    "Concurrently checking checkout, inventory, and payment services with timeout guards.",
  ],
  [
    "02",
    "RECORD",
    "State transitions become durable PostgreSQL records and start incident timelines.",
  ],
  [
    "03",
    "PROPAGATE",
    "W3C OpenTelemetry trace context and Prometheus metrics propagate across dependencies.",
  ],
  [
    "04",
    "ISOLATE",
    "Pinpointing root causes and configuration drift before production deployment.",
  ],
  [
    "05",
    "RECOVER",
    "Automated incident resolution upon verified service health restoration.",
  ],
] as const;

const SKILLS = [
  "Java",
  "Python",
  "TypeScript",
  "FastAPI",
  "Docker",
  "PostgreSQL",
  "Linux",
  "Prometheus",
  "OpenTelemetry",
  "Next.js",
  "AWS",
  "RESP / TCP",
];

export function About() {
  const containerRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 75%"],
  });

  return (
    <section id="about" className="about section-wrap" ref={containerRef}>
      <div className="about-lead">
        <div>
          <span className="eyebrow">02 / BEHIND THE CRAFT</span>
          <h2 className="display">
            MORE THAN CODE. <br />
            CRAFTING <span className="accent">RELIABILITY.</span>
          </h2>
        </div>
        <p>
          I’m Divyesh Kolli, a B.Tech Cloud Computing student at SRM Institute of Science and Technology in Chennai. I design and build backend services, distributed key-value stores, and full-stack web applications with deep focus on reliability, observability, and deterministic recovery.
        </p>
      </div>

      <div className="studio-grid">
        {/* Column 1: Expertise & Skills */}
        <div className="education-panel">
          <h3 className="panel-heading">EXPERTISE &amp; SKILLS</h3>
          <p className="eyebrow accent">EDUCATION &amp; ACADEMICS</p>
          <div className="education-row">
            <strong>B.Tech Computer Science (Cloud Computing)</strong>
            <span>2025 – 2029</span>
            <p>SRM Institute of Science and Technology, Chennai.</p>
          </div>
          <div className="education-row">
            <strong>Higher Secondary Education</strong>
            <span>Completed</span>
            <p>Delhi Public School, Visakhapatnam.</p>
          </div>

          <p className="eyebrow accent skills-heading">CORE TECH TOOLKIT</p>
          <div className="skill-tags">
            {SKILLS.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>

          <div className="software-row" style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            {["Docker", "Linux", "FastAPI", "PostgreSQL", "Next.js", "Java"].map((item) => (
              <span
                key={item}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #30282a",
                  fontSize: "10px",
                  color: "#c2bdb9",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Column 2: Process with filling red line */}
        <div className="process-panel">
          <h3 className="panel-heading">FROM INCIDENT TO RESOLUTION</h3>
          <div className="process-list">
            <div className="process-track">
              <motion.div
                style={
                  reduced ? undefined : { scaleY: scrollYProgress }
                }
              />
            </div>
            {PROCESS_STEPS.map(([num, title, text]) => (
              <div key={num} className="process-row">
                <span className="process-num display">{num}</span>
                <span className="process-node" />
                <div>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Red Quote Panel */}
        <div className="quote-panel">
          <span className="quote-mark display">“</span>
          <blockquote>
            From systems architecture <br />
            and protocol design, <br />
            <em>
              to resilient, verified <br />
              digital products.
            </em>
          </blockquote>
          <span className="handwriting">Divyesh</span>
          <div className="quote-bottom">
            LET’S BUILD <br />
            SOMETHING EXCEPTIONAL.
            <span className="quote-symbol" aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
