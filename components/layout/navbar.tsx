"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Command,
  Menu,
  Moon,
  Pause,
  Play,
  Sun,
  X,
} from "lucide-react";
import { NAV, SECTION_IDS, SITE } from "@/constants/site";
import { useActiveSection } from "@/hooks/use-active-section";
import { useTheme } from "@/hooks/use-theme";
import {
  toggleMotion,
  useReducedMotion,
  useSystemReducedMotion,
} from "@/hooks/use-media-query";

export function Navbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const active = useActiveSection(SECTION_IDS);
  const { theme, toggle } = useTheme();
  const reduced = useReducedMotion();
  const systemReduced = useSystemReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    }
    function outside(event: PointerEvent) {
      if (event.target instanceof Node && !nav.current?.contains(event.target))
        setMenuOpen(false);
    }
    const desktop = matchMedia("(min-width: 1100px)");
    const close = () => setMenuOpen(false);
    desktop.addEventListener("change", close);
    window.addEventListener("hashchange", close);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", outside);
    return () => {
      desktop.removeEventListener("change", close);
      window.removeEventListener("hashchange", close);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", outside);
    };
  }, [menuOpen]);

  const isSectionActive = (id: (typeof NAV)[number]["id"]) =>
    active === id || (active === "profiles" && id === "github");

  return (
    <header
      className="masthead"
      ref={nav}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        )
          setMenuOpen(false);
      }}
    >
      <nav className="shell masthead-inner" aria-label="Primary navigation">
        <a
          href="#hero"
          className="wordmark"
          aria-current={active === "hero" ? "location" : undefined}
          aria-label={`${SITE.name}, home`}
          onClick={() => setMenuOpen(false)}
        >
          <span className="folio-wordmark" aria-hidden>{SITE.name}<i>.</i></span>
        </a>

        <div className="desktop-nav">
          {NAV.filter(({ id }) => ["work", "about", "journey", "contact"].includes(id)).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isSectionActive(item.id) ? "location" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="nav-tools">
          <button
            type="button"
            className="icon-control palette-trigger"
            aria-label="Open command palette"
            title="Command palette (Ctrl / ⌘ K)"
            onClick={onOpenPalette}
          >
            <Command size={15} />
          </button>
          <button
            type="button"
            className="icon-control"
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            onClick={toggle}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            className="motion-control"
            onClick={toggleMotion}
            disabled={systemReduced}
            aria-pressed={!reduced}
            aria-label={
              systemReduced
                ? "Motion off (system preference)"
                : reduced
                  ? "Turn motion on"
                  : "Turn motion off"
            }
          >
            {reduced ? <Play size={11} /> : <Pause size={11} />}
            <span className="motion-label">
              Motion {reduced ? "off" : "on"}
            </span>
          </button>
          <a href="#contact" className="nav-invitation">Let’s talk <ArrowUpRight size={15} aria-hidden /></a>
          <button
            type="button"
            ref={trigger}
            className="icon-control menu-trigger"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div
          id="mobile-nav"
          hidden={!menuOpen}
          className="mobile-nav"
          data-lenis-prevent
        >
          {NAV.map((item, idx) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isSectionActive(item.id) ? "location" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <span>
                <small className="mobile-nav-index" aria-hidden>
                  0{idx + 1}
                </small>
                {item.label}
              </span>
              <ArrowUpRight size={14} aria-hidden />
            </a>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onOpenPalette();
            }}
          >
            <span>Command palette</span>
            <Command size={14} aria-hidden />
          </button>
        </div>
      </nav>
    </header>
  );
}
