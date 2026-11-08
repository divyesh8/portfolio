"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Check,
  Github,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Send,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SITE, SOCIALS } from "@/constants/site";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<
      string,
      string
    >;
    try {
      if (data.name || data.email) {
        localStorage.setItem(
          "dk-visitor-identity",
          JSON.stringify({
            name: (data.name ?? "").trim(),
            email: (data.email ?? "").trim(),
          }),
        );
      }
    } catch {
      /* Ignore storage restrictions. */
    }
    const subject = encodeURIComponent(`Portfolio — ${data.name}`);
    const body = encodeURIComponent(
      `${data.message}\n\n— ${data.name} (${data.email})`,
    );
    const mailto = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setStatus("sending");
    setMessage("");
    setDraft("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error ?? "Your message could not be sent.");
        if (result.fallback) setDraft(mailto);
        return;
      }
      form.reset();
      setStatus("sent");
      setMessage("Your message was sent. Thank you for getting in touch.");
    } catch {
      setStatus("error");
      setMessage(
        "The form is unavailable. You can send this message by email.",
      );
      setDraft(mailto);
    }
  }

  return (
    <section id="contact" className="shell section-block contact-layout">
      <div>
        <SectionHeading
          eyebrow="07 / Contact"
          title="Get in touch"
          lede="I’m seeking internships and engineering opportunities in cloud infrastructure, site reliability (SRE), backend systems, and full-stack development."
        />
        <div className="contact-links">
          <a href={`mailto:${SITE.email}`}>
            <Mail size={17} />
            <span>{SITE.email}</span>
            <ArrowUpRight size={15} />
          </a>
          <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer">
            <Github size={17} />
            <span>github.com/{SITE.handle}</span>
            <ArrowUpRight size={15} />
          </a>
          <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer">
            <Linkedin size={17} />
            <span>LinkedIn · {SITE.name}</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
        <p className="contact-location">
          <MapPin size={14} aria-hidden />
          <span>
            {SITE.location} · {SITE.university} ({SITE.studyPeriod})
          </span>
        </p>
      </div>
      <form
        onSubmit={onSubmit}
        aria-label="Contact form"
        className="contact-form"
        onChange={() => {
          if (status !== "sending") {
            setStatus("idle");
            setMessage("");
            setDraft("");
          }
        }}
      >
        <div className="form-pair">
          <div>
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={200}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
        </div>
        <label htmlFor="message">Message</label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={5}
          placeholder="Tell me about the role, team, or project…"
        />
        <div aria-hidden className="sr-only">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="form-send">
          <Button type="submit" size="lg" disabled={status === "sending"}>
            {status === "sending" ? (
              <>
                <Loader2 className="animate-spin" /> Sending
              </>
            ) : status === "sent" ? (
              <>
                <Check /> Sent
              </>
            ) : (
              <>
                Send message <Send />
              </>
            )}
          </Button>
          <p role="status" aria-live="polite">
            {message}
          </p>
          {draft && (
            <a className="text-link" href={draft}>
              Open email draft <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </form>
    </section>
  );
}
