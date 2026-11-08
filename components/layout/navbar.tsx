"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { SITE } from "@/constants/site";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -65% 0px" },
    );
    document
      .querySelectorAll("main > section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navLinks = [
    { id: "portfolio", label: "Work" },
    { id: "about", label: "About" },
    { id: "experience", label: "Journey" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="site-header">
      <a className="wordmark" href="#home" aria-label={`${SITE.name}, home`}>
        DIVYESH<span>®</span>
      </a>

      <nav className="desktop-nav" aria-label="Main navigation">
        {navLinks.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={
              activeSection === id ||
              (id === "portfolio" && activeSection === "work") ||
              (id === "experience" && activeSection === "journey")
                ? "active"
                : ""
            }
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <a className="header-contact" href="#contact">
          Let’s talk <ArrowUpRight size={16} />
        </a>

        <button
          type="button"
          className="menu-toggle icon-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          {[
            { id: "home", label: "Home" },
            ...navLinks,
          ].map(({ id, label }, i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
            >
              <span>0{i + 1}</span>
              {label}
              <ArrowUpRight size={18} />
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
