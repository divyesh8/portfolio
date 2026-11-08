"use client";

import { useEffect } from "react";

interface UADataValues {
  architecture?: string;
  model?: string;
  platform?: string;
  platformVersion?: string;
}

interface NavigatorWithExtras extends Navigator {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    downlink?: number;
  };
  userAgentData?: {
    platform?: string;
    mobile?: boolean;
    getHighEntropyValues?: (hints: string[]) => Promise<UADataValues>;
  };
}

interface PreciseCoords {
  lat: number;
  lon: number;
  accuracy: number;
}

interface ActivityEntry {
  atOffsetSec: number;
  timeLocal: string;
  action: string;
}

interface SectionStat {
  id: string;
  label: string;
  dwellMs: number;
  views: number;
  firstSeenSec: number;
}

const TRACKED_SECTIONS: ReadonlyArray<{ id: string; label: string }> = [
  { id: "hero", label: "Hero (Intro & Portrait)" },
  { id: "work", label: "01 / Selected Work (Projects)" },
  { id: "inside", label: "Field Notes / Inside AegisOps" },
  { id: "about", label: "02 / About & Education" },
  { id: "skills", label: "03 / Technical Skills" },
  { id: "journey", label: "04 / Engineering Journey" },
  { id: "github", label: "05 / GitHub Activity" },
  { id: "profiles", label: "Elsewhere (Social Profiles)" },
  { id: "resume", label: "06 / Résumé" },
  { id: "contact", label: "07 / Contact" },
];

const IDLE_THRESHOLD_MS = 30_000;
const MAX_LOG_ENTRIES = 140;

function generateSessionId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SES-${rand}`;
}

function compactText(value: string | null | undefined, max = 90): string {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function getGpuRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return "";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "";
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return typeof renderer === "string" ? renderer.trim() : "";
  } catch {
    return "";
  }
}

function getKnownVisitorIdentity(): { name: string; email: string } {
  let name = "";
  let email = "";

  try {
    const params = new URLSearchParams(window.location.search);
    name =
      params.get("name") ||
      params.get("visitor") ||
      params.get("from") ||
      params.get("by") ||
      "";
    email = params.get("email") || "";
  } catch {
    /* Ignore URL parse issues */
  }

  try {
    const saved = localStorage.getItem("dk-visitor-identity");
    if (saved) {
      const parsed = JSON.parse(saved) as { name?: string; email?: string };
      if (!name && parsed.name) name = parsed.name;
      if (!email && parsed.email) email = parsed.email;
    }
  } catch {
    /* Ignore storage restrictions */
  }

  try {
    const nameInput = document.querySelector<HTMLInputElement>(
      'input[name="name"]',
    );
    const emailInput = document.querySelector<HTMLInputElement>(
      'input[name="email"]',
    );
    if (!name && nameInput?.value?.trim()) name = nameInput.value.trim();
    if (!email && emailInput?.value?.trim()) email = emailInput.value.trim();
  } catch {
    /* Ignore DOM query issues */
  }

  return { name: name.trim(), email: email.trim() };
}

function saveVisitorIdentity(partial: { name?: string; email?: string }) {
  try {
    const existing = getKnownVisitorIdentity();
    const merged = {
      name: partial.name?.trim() || existing.name,
      email: partial.email?.trim() || existing.email,
    };
    if (merged.name || merged.email) {
      localStorage.setItem("dk-visitor-identity", JSON.stringify(merged));
    }
  } catch {
    /* Ignore storage restrictions */
  }
}

function decodeJwtPayload(token: string): { name?: string; email?: string } {
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return {};
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json) as { name?: string; email?: string };
  } catch {
    return {};
  }
}

function dispatchBeacon(data: Record<string, unknown>, preferBeacon = false) {
  const json = JSON.stringify(data);
  if (preferBeacon && typeof navigator.sendBeacon === "function") {
    try {
      const blob = new Blob([json], { type: "application/json" });
      if (navigator.sendBeacon("/api/visit", blob)) {
        return;
      }
    } catch {
      /* Fall back to keepalive fetch */
    }
  }
  fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {
    /* Never surface telemetry errors to visitors */
  });
}

function describeClickedElement(target: Element): string | null {
  const anchor = target.closest("a");
  if (anchor) {
    const href = anchor.getAttribute("href") ?? "";
    const label =
      compactText(anchor.getAttribute("aria-label")) ||
      compactText(anchor.textContent) ||
      href;

    if (anchor.hasAttribute("download")) {
      return `Downloaded Résumé PDF (${href})`;
    }
    if (href.toLowerCase().endsWith(".pdf")) {
      return `Opened Résumé PDF in browser (${href})`;
    }
    if (href.startsWith("mailto:")) {
      return `Clicked email link (${href.replace("mailto:", "")})`;
    }
    if (href.startsWith("#")) {
      return `Clicked navigation link "${label}" → ${href}`;
    }
    if (href.startsWith("http")) {
      return `Opened external link "${label}" (${href})`;
    }
    return `Clicked link "${label}"`;
  }

  const button = target.closest("button, [cmdk-item]");
  if (button) {
    const aria = compactText(button.getAttribute("aria-label"));
    const text = compactText(button.textContent);

    if (button.classList.contains("case-trigger")) {
      const projectTitle = aria
        .replace(/^Read\s+/i, "")
        .replace(/\s+case study$/i, "");
      return `Opened project case study modal: "${projectTitle || text}"`;
    }
    if (aria === "Close case study") {
      return "Closed project case study modal";
    }
    if (button.closest(".filters")) {
      return `Filtered projects by category: "${text || aria}"`;
    }
    if (button.classList.contains("archive-toggle")) {
      return `Clicked project archive toggle: "${text}"`;
    }
    if (button.closest(".shelf-controls")) {
      return `Clicked featured project shelf control: "${aria || text}"`;
    }
    if (button.closest(".field-views")) {
      return `Switched AegisOps Field Notes view to "${text}"`;
    }
    if (button.classList.contains("field-node")) {
      return `Selected AegisOps incident stage: "${text}"`;
    }
    if (button.classList.contains("palette-trigger")) {
      return "Opened Command Palette";
    }
    if (button.classList.contains("motion-control")) {
      return `Toggled motion setting (${aria || text})`;
    }
    if (aria.toLowerCase().includes("theme")) {
      return `Toggled color theme (${aria})`;
    }
    if (button.classList.contains("menu-trigger")) {
      return `Toggled mobile menu (${aria || "Menu"})`;
    }
    if (button.hasAttribute("cmdk-item")) {
      return `Selected Command Palette command: "${text || aria}"`;
    }
    if (button.closest("#resume")) {
      return `Clicked Résumé action: "${text || aria}"`;
    }
    if (
      button.closest("#contact") &&
      button.getAttribute("type") === "submit"
    ) {
      return "Clicked Send Message button in Contact form";
    }
    if (aria || text) {
      return `Clicked button: "${aria || text}"`;
    }
  }

  return null;
}

export function VisitorBeacon() {
  useEffect(() => {
    if (navigator.webdriver) return;

    const sessionId = generateSessionId();
    const enteredEpoch = Date.now();
    const enteredIso = new Date(enteredEpoch).toISOString();
    const enteredLocal = new Date(enteredEpoch).toLocaleString();

    let arrivalSent = false;
    let lastExitSentActionSeq = -1;
    let actionSeq = 0;
    let interactionCount = 0;
    let maxScrollPercent = 0;
    let startedTypingMessage = false;

    // Active vs idle time tracking
    let activeMs = 0;
    let lastActiveTick = enteredEpoch;
    let lastUserInputAt = enteredEpoch;
    let isPageVisible = document.visibilityState === "visible";

    function syncActiveClock(now = Date.now()) {
      if (isPageVisible && now - lastUserInputAt <= IDLE_THRESHOLD_MS) {
        activeMs += Math.max(0, now - lastActiveTick);
      }
      lastActiveTick = now;
    }

    function markUserInteraction() {
      const now = Date.now();
      syncActiveClock(now);
      lastUserInputAt = now;
    }

    // Activity timeline
    const activityLog: ActivityEntry[] = [];
    function recordActivity(action: string) {
      const now = Date.now();
      actionSeq += 1;
      const entry: ActivityEntry = {
        atOffsetSec: Math.max(0, Math.round((now - enteredEpoch) / 1000)),
        timeLocal: new Date(now).toLocaleTimeString(),
        action,
      };
      if (activityLog.length >= MAX_LOG_ENTRIES) {
        // Keep first 90 entries and roll the most recent 50 entries
        activityLog.splice(90, 1);
      }
      activityLog.push(entry);
    }

    recordActivity(
      `Opened portfolio (${window.location.pathname}${window.location.hash || ""})`,
    );

    // Section visibility & dwell time tracking
    const sectionMap = new Map<string, SectionStat>();
    const visibleSince = new Map<string, number>();
    const visitOrder: string[] = [];

    for (const sec of TRACKED_SECTIONS) {
      sectionMap.set(sec.id, {
        id: sec.id,
        label: sec.label,
        dwellMs: 0,
        views: 0,
        firstSeenSec: -1,
      });
    }

    function flushVisibleSections(now = Date.now()) {
      for (const [id, startedAt] of visibleSince.entries()) {
        const stat = sectionMap.get(id);
        if (stat && isPageVisible) {
          stat.dwellMs += Math.max(0, now - startedAt);
        }
        visibleSince.set(id, now);
      }
    }

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const now = Date.now();
        for (const entry of entries) {
          const id = entry.target.id;
          const stat = sectionMap.get(id);
          if (!stat) continue;

          if (entry.isIntersecting) {
            if (!visibleSince.has(id)) {
              visibleSince.set(id, now);
              stat.views += 1;
              if (stat.firstSeenSec < 0) {
                stat.firstSeenSec = Math.max(
                  0,
                  Math.round((now - enteredEpoch) / 1000),
                );
                visitOrder.push(stat.label);
                recordActivity(`Viewed section: ${stat.label}`);
              }
            }
          } else {
            const startedAt = visibleSince.get(id);
            if (startedAt !== undefined) {
              if (isPageVisible) {
                stat.dwellMs += Math.max(0, now - startedAt);
              }
              visibleSince.delete(id);
            }
          }
        }
      },
      { threshold: 0.25 },
    );

    for (const { id } of TRACKED_SECTIONS) {
      const el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    }

    // Scroll depth tracking
    function updateScrollDepth() {
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const winHeight = window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min(
        100,
        Math.round(((window.scrollY + winHeight) / docHeight) * 100),
      );
      if (pct > maxScrollPercent) {
        maxScrollPercent = pct;
      }
    }
    updateScrollDepth();

    let scrollTicking = false;
    const onScroll = () => {
      markUserInteraction();
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(() => {
          scrollTicking = false;
          updateScrollDepth();
        });
      }
    };

    const onPointerMove = () => {
      markUserInteraction();
    };

    const onClick = (event: MouseEvent) => {
      markUserInteraction();
      interactionCount += 1;
      if (!(event.target instanceof Element)) return;
      const desc = describeClickedElement(event.target);
      if (desc) {
        recordActivity(desc);
      }
    };

    const onToggle = (event: Event) => {
      if (!(event.target instanceof HTMLDetailsElement)) return;
      markUserInteraction();
      interactionCount += 1;
      const details = event.target;
      const stateWord = details.open ? "Expanded" : "Collapsed";
      if (details.classList.contains("journey-archive")) {
        recordActivity(`${stateWord} Additional Journey Milestones`);
        return;
      }
      const title = compactText(
        details.querySelector(".journey-title")?.textContent ||
          details.querySelector("summary")?.textContent,
      );
      if (title) {
        recordActivity(`${stateWord} Journey milestone: "${title}"`);
      }
    };

    const onChange = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      markUserInteraction();

      if (
        target instanceof HTMLInputElement &&
        target.closest(".project-search")
      ) {
        const q = compactText(target.value, 60);
        if (q) {
          interactionCount += 1;
          recordActivity(`Searched projects for "${q}"`);
        }
        return;
      }

      if (target instanceof HTMLInputElement && target.name === "name") {
        const val = compactText(target.value, 80);
        if (val) {
          saveVisitorIdentity({ name: val });
          recordActivity(`Entered name in Contact form: "${val}"`);
        }
        return;
      }

      if (target instanceof HTMLInputElement && target.name === "email") {
        const val = compactText(target.value, 120);
        if (val) {
          saveVisitorIdentity({ email: val });
          recordActivity(`Entered email in Contact form: "${val}"`);
        }
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLTextAreaElement &&
        target.name === "message" &&
        !startedTypingMessage
      ) {
        startedTypingMessage = true;
        markUserInteraction();
        recordActivity("Focused message box in Contact form");
      }
    };

    const onSubmit = (event: SubmitEvent) => {
      if (
        event.target instanceof HTMLFormElement &&
        event.target.closest("#contact")
      ) {
        interactionCount += 1;
        recordActivity("Submitted Contact form");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      markUserInteraction();
      if (!(event.ctrlKey || event.metaKey)) return;
      const k = event.key.toLowerCase();
      if (k === "k") {
        interactionCount += 1;
        recordActivity("Pressed Ctrl/Cmd+K shortcut (Command Palette)");
      } else if (k === "c") {
        recordActivity("Attempted Ctrl/Cmd+C copy shortcut (blocked)");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("toggle", onToggle, {
      capture: true,
      passive: true,
    });
    document.addEventListener("change", onChange, {
      capture: true,
      passive: true,
    });
    document.addEventListener("focusin", onFocusIn, {
      capture: true,
      passive: true,
    });
    document.addEventListener("submit", onSubmit, {
      capture: true,
      passive: true,
    });
    document.addEventListener("keydown", onKeyDown, {
      capture: true,
      passive: true,
    });

    // Device & location context shared across arrival and exit reports
    let baseDevicePayload: Record<string, unknown> = {
      sessionId,
      enteredIso,
      localTime: enteredLocal,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      platform: navigator.platform || "",
      gpu: "",
      screen: `${window.screen.width}×${window.screen.height} (${window.devicePixelRatio || 1}x DPR)`,
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      language:
        navigator.languages?.slice(0, 3).join(", ") || navigator.language || "",
      hardware: "",
      connection: "",
      referrer: document.referrer || "Direct visit",
      url: window.location.href,
      theme: document.documentElement.dataset.theme || "dark",
    };

    let cachedCoords: PreciseCoords | null = null;

    function buildSessionSnapshot(
      reportType: "arrival" | "location_update" | "identity_update" | "exit",
      exitReason?: string,
    ): Record<string, unknown> {
      const now = Date.now();
      syncActiveClock(now);
      flushVisibleSections(now);
      updateScrollDepth();

      const identity = getKnownVisitorIdentity();
      const totalDurationSec = Math.max(
        1,
        Math.round((now - enteredEpoch) / 1000),
      );
      const activeDurationSec = Math.min(
        totalDurationSec,
        Math.max(1, Math.round(activeMs / 1000)),
      );
      const idleDurationSec = Math.max(0, totalDurationSec - activeDurationSec);

      const sectionBreakdown = TRACKED_SECTIONS.map(({ id, label }) => {
        const s = sectionMap.get(id)!;
        return {
          id,
          label,
          visited: s.views > 0,
          views: s.views,
          dwellSec: Number((s.dwellMs / 1000).toFixed(1)),
          firstSeenSec: s.firstSeenSec,
        };
      });

      return {
        ...baseDevicePayload,
        reportType,
        exitReason: exitReason ?? "",
        visitorName: identity.name,
        visitorEmail: identity.email,
        leftIso: new Date(now).toISOString(),
        leftLocalTime: new Date(now).toLocaleString(),
        totalDurationSec,
        activeDurationSec,
        idleDurationSec,
        maxScrollPercent,
        interactionCount,
        visitOrder,
        sectionBreakdown,
        activityLog,
        theme: document.documentElement.dataset.theme || "dark",
        ...(cachedCoords
          ? {
              gpsLat: cachedCoords.lat,
              gpsLon: cachedCoords.lon,
              gpsAccuracy: cachedCoords.accuracy,
            }
          : {}),
      };
    }

    function sendExitReport(reason: string) {
      // Avoid sending duplicate exit emails if nothing new happened since the last exit beacon
      if (lastExitSentActionSeq === actionSeq) return;
      recordActivity(reason);
      lastExitSentActionSeq = actionSeq;
      arrivalSent = true;
      dispatchBeacon(buildSessionSnapshot("exit", reason), true);
    }

    const onPageHide = () => {
      isPageVisible = false;
      sendExitReport("Left / closed portfolio page");
    };

    const onVisibilityChange = () => {
      const now = Date.now();
      if (document.visibilityState === "hidden") {
        syncActiveClock(now);
        flushVisibleSections(now);
        isPageVisible = false;
        sendExitReport("Left tab / minimized browser");
      } else {
        isPageVisible = true;
        lastActiveTick = now;
        lastUserInputAt = now;
        for (const id of visibleSince.keys()) {
          visibleSince.set(id, now);
        }
        recordActivity("Returned to portfolio tab");
      }
    };

    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Enrich hardware/OS hints after hero entrance animation settles (1.2s)
    const initTimer = window.setTimeout(async () => {
      const nav = navigator as NavigatorWithExtras;
      let platformDetail = nav.userAgentData?.platform || nav.platform || "";

      if (nav.userAgentData?.getHighEntropyValues) {
        try {
          const hints = await nav.userAgentData.getHighEntropyValues([
            "platform",
            "platformVersion",
            "model",
            "architecture",
          ]);
          const parts: string[] = [];
          if (hints.platform === "Windows" && hints.platformVersion) {
            const major = Number.parseInt(
              hints.platformVersion.split(".")[0] ?? "0",
              10,
            );
            parts.push(major >= 13 ? "Windows 11" : "Windows 10");
          } else if (hints.platform) {
            parts.push(
              hints.platformVersion
                ? `${hints.platform} ${hints.platformVersion}`
                : hints.platform,
            );
          }
          if (hints.model) parts.push(hints.model);
          if (hints.architecture) parts.push(hints.architecture);
          if (parts.length > 0) platformDetail = parts.join(" · ");
        } catch {
          /* High-entropy hints unavailable */
        }
      }

      const hwParts: string[] = [];
      if (nav.hardwareConcurrency) {
        hwParts.push(`${nav.hardwareConcurrency} CPU threads`);
      }
      if (nav.deviceMemory) {
        hwParts.push(`~${nav.deviceMemory} GB RAM`);
      }
      if (nav.maxTouchPoints > 0) {
        hwParts.push("Touch screen");
      }

      const connParts: string[] = [];
      if (nav.connection?.effectiveType) {
        connParts.push(nav.connection.effectiveType.toUpperCase());
      }
      if (typeof nav.connection?.downlink === "number") {
        connParts.push(`${nav.connection.downlink} Mbps`);
      }

      baseDevicePayload = {
        ...baseDevicePayload,
        platform: platformDetail,
        gpu: getGpuRenderer(),
        hardware: hwParts.join(", "),
        connection: connParts.join(" · "),
      };

      // Only send arrival alert once per browser tab session; exit reports
      // always send whenever they leave the page.
      let alreadySentArrivalThisTab = false;
      try {
        alreadySentArrivalThisTab = Boolean(
          sessionStorage.getItem("dk-visit-notified"),
        );
        sessionStorage.setItem("dk-visit-notified", "1");
      } catch {
        /* Storage restricted */
      }

      if ("geolocation" in navigator) {
        const waitTimer = window.setTimeout(() => {
          if (!arrivalSent && !alreadySentArrivalThisTab) {
            arrivalSent = true;
            dispatchBeacon(buildSessionSnapshot("arrival"));
          }
        }, 6500);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            window.clearTimeout(waitTimer);
            cachedCoords = {
              lat: Number(pos.coords.latitude.toFixed(6)),
              lon: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy),
            };
            recordActivity(
              `Shared precise Wi-Fi/GPS location (±${cachedCoords.accuracy}m)`,
            );
            if (!alreadySentArrivalThisTab) {
              const kind = arrivalSent ? "location_update" : "arrival";
              arrivalSent = true;
              dispatchBeacon(buildSessionSnapshot(kind));
            }
          },
          () => {
            window.clearTimeout(waitTimer);
            if (!arrivalSent && !alreadySentArrivalThisTab) {
              arrivalSent = true;
              dispatchBeacon(buildSessionSnapshot("arrival"));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 25000,
            maximumAge: 120000,
          },
        );
      } else if (!alreadySentArrivalThisTab) {
        arrivalSent = true;
        dispatchBeacon(buildSessionSnapshot("arrival"));
      }

      // Optional Google One Tap for signed-in Chrome / Google accounts
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const currentIdentity = getKnownVisitorIdentity();
      if (googleClientId && !currentIdentity.name) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          const g = (
            window as unknown as {
              google?: {
                accounts?: {
                  id?: {
                    initialize: (cfg: {
                      client_id: string;
                      auto_select?: boolean;
                      cancel_on_tap_outside?: boolean;
                      callback: (res: { credential?: string }) => void;
                    }) => void;
                    prompt: () => void;
                  };
                };
              };
            }
          ).google;
          g?.accounts?.id?.initialize({
            client_id: googleClientId,
            auto_select: true,
            cancel_on_tap_outside: true,
            callback: (res) => {
              if (!res.credential) return;
              const claims = decodeJwtPayload(res.credential);
              if (!claims.name && !claims.email) return;
              saveVisitorIdentity({
                name: claims.name ?? "",
                email: claims.email ?? "",
              });
              recordActivity(
                `Signed in via Google One Tap as ${claims.name ?? claims.email}`,
              );
              dispatchBeacon(buildSessionSnapshot("identity_update"));
            },
          });
          g?.accounts?.id?.prompt();
        };
        document.head.appendChild(script);
      }
    }, 1200);

    return () => {
      window.clearTimeout(initTimer);
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("change", onChange, true);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
