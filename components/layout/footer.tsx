"use client";

import { ArrowUpRight, Github, Globe } from "lucide-react";
import { SITE, SOCIALS } from "@/constants/site";
import { XIcon } from "@/components/ui/x-icon";

export function Footer() {
  return (
    <footer className="footer">
      <a className="wordmark" href="#home" aria-label={`${SITE.name}, home`}>
        DIVYESH<span>®</span>
      </a>
      <span>
        © {new Date().getFullYear()} {SITE.name.toUpperCase()} · ALL RIGHTS RESERVED. EVERY LINE HAS A PURPOSE.
      </span>
      <div>
        <a
          href={SOCIALS.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub profile"
        >
          <Github size={17} />
        </a>
        <a
          href={SOCIALS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn profile"
        >
          <Globe size={17} />
        </a>
        <a
          href={SOCIALS.x}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X profile"
        >
          <XIcon size={16} />
        </a>
        <a href="#home" aria-label="Back to top">
          <ArrowUpRight size={18} />
        </a>
      </div>
    </footer>
  );
}
