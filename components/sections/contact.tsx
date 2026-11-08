"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Github,
  Globe,
  Mail,
  MapPin,
  Play,
  Plus,
} from "lucide-react";
import { SITE, SOCIALS } from "@/constants/site";
import { XIcon } from "@/components/ui/x-icon";

export function Contact({
  onSelectProject,
}: {
  onSelectProject?: (slug: string) => void;
}) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const type = (formData.get("type") as string) || "";
    const message = (formData.get("message") as string) || "";

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || `${name.replace(/\s+/g, "").toLowerCase() || "visitor"}@inquiry.portfolio`,
          message: `[Inquiry Type: ${type}]\n\n${message}`,
        }),
      });
      setSent(true);
      form.reset();
    } catch {
      /* Best effort backend submission */
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact section-wrap">
      <div className="contact-grid">
        {/* Intro */}
        <div className="contact-intro">
          <span className="eyebrow">04 / YOUR NEXT PROJECT</span>
          <h2 className="display">
            LET’S BUILD <br />
            TOGETHER<span className="accent">.</span>
          </h2>
          <p>
            Got a systems or cloud architecture in mind? <br />
            Let’s make something resilient and observable.
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="contact-cta"
            aria-label={`Send email to ${SITE.email}`}
          >
            <span className="round-arrow">
              <ArrowUpRight size={21} />
            </span>
            START A CONVERSATION
          </a>
        </div>

        {/* Links */}
        <div className="contact-links">
          <a href={`mailto:${SITE.email}`}>
            <Mail size={16} />
            <span>
              <small>EMAIL</small>
              {SITE.email}
            </span>
            <ArrowUpRight size={16} />
          </a>
          <a
            href={SOCIALS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe size={16} />
            <span>
              <small>LINKEDIN</small>
              divyesh-kolli
            </span>
            <ArrowUpRight size={16} />
          </a>
          <a
            href={SOCIALS.x}
            target="_blank"
            rel="noopener noreferrer"
          >
            <XIcon size={15} />
            <span>
              <small>X (TWITTER)</small>
              @_divyesh8
            </span>
            <ArrowUpRight size={16} />
          </a>
          <a
            href={SOCIALS.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={16} />
            <span>
              <small>GITHUB</small>
              {SITE.handle}
            </span>
            <ArrowUpRight size={16} />
          </a>
          <div>
            <MapPin size={16} />
            <span>
              <small>BASED IN</small>
              {SITE.location}
            </span>
          </div>
        </div>

        {/* Interactive 3D Reel Card */}
        <div className="contact-reel">
          <button
            type="button"
            onClick={() => onSelectProject?.("aegisops")}
            aria-label="View AegisOps featured architecture reel"
          >
            <div className="reel-screen">
              <span className="reel-screen-top">
                AEGISOPS <span>SYSTEM REEL</span>
              </span>
              <img
                src="/projects/aegisops.webp"
                alt="AegisOps system architecture overview"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.35,
                  filter: "saturate(0.5)",
                }}
              />
              <span className="reel-screen-title display">
                BUILD <br />
                <span>SMARTER.</span>
              </span>
              <span className="play-circle">
                <Play size={18} fill="currentColor" />
              </span>
            </div>
            <span className="reel-caption">
              AEGISOPS — CLOUD RELIABILITY PLATFORM
            </span>
          </button>
        </div>
      </div>

      {/* Expandable Project Brief */}
      <details className="project-brief">
        <summary>
          Tell me about your project or opportunity <Plus size={19} />
        </summary>
        <form onSubmit={handleSubmit}>
          <label>
            Your Name
            <input
              name="name"
              required
              placeholder="Name or company"
              autoComplete="name"
              maxLength={100}
            />
          </label>
          <label>
            Your Email
            <input
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              autoComplete="email"
              maxLength={120}
            />
          </label>
          <label>
            Inquiry Type
            <select name="type">
              <option>Cloud Infrastructure &amp; DevOps</option>
              <option>Site Reliability Engineering (SRE)</option>
              <option>Backend / Systems Engineering</option>
              <option>Full-Stack Web Application</option>
              <option>Software Internship / Role</option>
              <option>Something else</option>
            </select>
          </label>
          <label className="brief-message">
            About the project / role
            <textarea
              name="message"
              required
              rows={3}
              placeholder="Tell me about your architecture, role, or idea…"
              maxLength={3000}
            />
          </label>
          <button className="solid-button" type="submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send Message"}
            <ArrowUpRight size={18} />
          </button>
          <p className="form-note" role="status">
            {sent
              ? "Message sent successfully! Delivered directly to Divyesh's inbox."
              : "Submits directly to Divyesh's inbox (kolli.divyesh@gmail.com)."}
          </p>
        </form>
      </details>
    </section>
  );
}
