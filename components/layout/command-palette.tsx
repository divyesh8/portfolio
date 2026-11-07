"use client";

import { useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import {
  ArrowUpRight,
  Code2,
  Contact,
  Eye,
  Github,
  Linkedin,
  Moon,
  Pause,
  Play,
  Sun,
} from "lucide-react";
import { XIcon } from "@/components/ui/x-icon";
import { NAV, SITE, SOCIALS } from "@/constants/site";
import { useTheme } from "@/hooks/use-theme";
import {
  toggleMotion,
  useReducedMotion,
  useSystemReducedMotion,
} from "@/hooks/use-media-query";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";

/**
 * Ctrl/Cmd+K palette. Navigation, links, resume, theme, and motion controls
 * in one accessible keyboard surface.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { theme, toggle } = useTheme();
  const reduced = useReducedMotion();
  const systemReduced = useSystemReducedMotion();
  const opener = useRef<HTMLElement | null>(null);
  const jumped = useRef(false);

  useKeyboardShortcut(
    "k",
    (event) => {
      if (document.querySelector('[role="dialog"]') && !open) return;
      event.preventDefault();
      onOpenChange(!open);
    },
    { meta: true, allowInInput: open },
  );

  function go(action: () => void) {
    onOpenChange(false);
    action();
  }

  function scrollTo(id: string) {
    jumped.current = true;
    onOpenChange(false);
    requestAnimationFrame(() => {
      window.location.hash = id;
      const section = document.getElementById(id);
      section?.setAttribute("tabindex", "-1");
      section?.focus({ preventScroll: true });
    });
  }

  const openLink = (href: string) =>
    go(() => {
      if (href.startsWith("mailto:")) window.location.href = href;
      else window.open(href, "_blank", "noopener,noreferrer");
    });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          data-lenis-prevent
          className="fixed left-1/2 top-[12%] z-[81] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 overflow-hidden rounded-[3px] border border-[var(--line-strong)] bg-[var(--dialog-surface)] shadow-2xl"
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!jumped.current) {
              const previous = opener.current;
              const fallback = Array.from(
                document.querySelectorAll<HTMLButtonElement>(
                  ".palette-trigger, .menu-trigger",
                ),
              ).find((el) => el.getClientRects().length);
              (previous?.isConnected &&
              previous !== document.body &&
              previous.getClientRects().length
                ? previous
                : fallback
              )?.focus({ preventScroll: true });
            }
            jumped.current = false;
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search sections, profiles, and actions. Use the arrow keys to choose
            a result.
          </Dialog.Description>
          <Command label="Command palette">
            <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
              <Command.Input
                placeholder="Jump to a section, open a profile, toggle preferences…"
                className="h-14 w-full bg-transparent text-[15px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
              />
              <kbd className="hidden shrink-0 rounded-[2px] border border-[var(--line)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--fg-subtle)] sm:block">
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[54vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-subtle">
                Nothing matches that query.
              </Command.Empty>

              <Command.Group heading="Sections" className="cmd-group">
                {NAV.map((item) => (
                  <Item key={item.id} onSelect={() => scrollTo(item.id)}>
                    <Code2 className="h-4 w-4 text-[var(--fg-subtle)]" />
                    {item.label}
                  </Item>
                ))}
              </Command.Group>

              <Command.Group heading="Profiles & Contact" className="cmd-group">
                <Item onSelect={() => openLink(SOCIALS.github)}>
                  <Github className="h-4 w-4 text-[var(--fg-subtle)]" />
                  GitHub (@{SITE.handle})
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-subtle)]" />
                </Item>
                <Item onSelect={() => openLink(SOCIALS.linkedin)}>
                  <Linkedin className="h-4 w-4 text-[var(--fg-subtle)]" />
                  LinkedIn
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-subtle)]" />
                </Item>
                <Item onSelect={() => openLink(SOCIALS.x)}>
                  <XIcon className="h-4 w-4 text-[var(--fg-subtle)]" />
                  X (@_divyesh8)
                  <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-[var(--fg-subtle)]" />
                </Item>
                <Item onSelect={() => openLink(`mailto:${SITE.email}`)}>
                  <Contact className="h-4 w-4 text-[var(--fg-subtle)]" />
                  Email {SITE.email}
                </Item>
              </Command.Group>

              <Command.Group heading="Actions & Preferences" className="cmd-group">
                <Item
                  onSelect={() =>
                    go(() =>
                      window.open(
                        SITE.resumePath,
                        "_blank",
                        "noopener,noreferrer",
                      ),
                    )
                  }
                >
                  <Eye className="h-4 w-4 text-[var(--fg-subtle)]" />
                  View résumé PDF
                </Item>
                <Item onSelect={() => go(toggle)}>
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-[var(--fg-subtle)]" />
                  ) : (
                    <Moon className="h-4 w-4 text-[var(--fg-subtle)]" />
                  )}
                  Switch to {theme === "dark" ? "light" : "dark"} theme
                </Item>
                {!systemReduced && (
                  <Item onSelect={() => go(toggleMotion)}>
                    {reduced ? (
                      <Play className="h-4 w-4 text-[var(--fg-subtle)]" />
                    ) : (
                      <Pause className="h-4 w-4 text-[var(--fg-subtle)]" />
                    )}
                    Turn motion {reduced ? "on" : "off"}
                  </Item>
                )}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Item({
  children,
  onSelect,
}: {
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-[2px] px-3 py-2.5 text-sm text-[var(--fg-muted)] transition-colors data-[selected=true]:bg-[var(--panel)] data-[selected=true]:text-[var(--fg)]"
    >
      {children}
    </Command.Item>
  );
}
