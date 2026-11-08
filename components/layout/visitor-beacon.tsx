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

function sendVisitPayload(data: Record<string, unknown>) {
  const json = JSON.stringify(data);
  fetch("/api/visit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {
    /* Never surface telemetry errors to visitors. */
  });
}

export function VisitorBeacon() {
  useEffect(() => {
    if (navigator.webdriver) return;
    try {
      if (sessionStorage.getItem("dk-visit-notified")) return;
      sessionStorage.setItem("dk-visit-notified", "1");
    } catch {
      /* Continue if storage is restricted. */
    }

    let initialSent = false;
    let basePayload: Record<string, unknown> | null = null;

    const flushFallbackOnHide = () => {
      if (document.visibilityState === "hidden" && !initialSent && basePayload) {
        initialSent = true;
        sendVisitPayload(basePayload);
      }
    };

    const timer = window.setTimeout(async () => {
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
          /* High-entropy hints unavailable. */
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

      const identity = getKnownVisitorIdentity();
      const gpu = getGpuRenderer();

      basePayload = {
        visitorName: identity.name,
        visitorEmail: identity.email,
        localTime: new Date().toLocaleString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
        platform: platformDetail,
        gpu,
        screen: `${window.screen.width}×${window.screen.height} (${window.devicePixelRatio || 1}x DPR)`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        language: nav.languages?.slice(0, 3).join(", ") || nav.language || "",
        hardware: hwParts.join(", "),
        connection: connParts.join(" · "),
        referrer: document.referrer || "Direct visit",
        url: window.location.href,
        theme: document.documentElement.dataset.theme || "dark",
      };

      document.addEventListener("visibilitychange", flushFallbackOnHide);

      // Request real GPS / Wi-Fi campus/neighborhood coordinates so locations
      // like SRM University Potheri are pinpointed accurately rather than
      // defaulting to the ISP's Chennai Central city centroid.
      if ("geolocation" in navigator) {
        const waitTimer = window.setTimeout(() => {
          if (!initialSent && basePayload) {
            initialSent = true;
            sendVisitPayload(basePayload);
          }
        }, 6500);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            window.clearTimeout(waitTimer);
            const coords: PreciseCoords = {
              lat: Number(pos.coords.latitude.toFixed(6)),
              lon: Number(pos.coords.longitude.toFixed(6)),
              accuracy: Math.round(pos.coords.accuracy),
            };
            const latestIdentity = getKnownVisitorIdentity();
            const enriched = {
              ...basePayload,
              visitorName: latestIdentity.name || identity.name,
              visitorEmail: latestIdentity.email || identity.email,
              gpsLat: coords.lat,
              gpsLon: coords.lon,
              gpsAccuracy: coords.accuracy,
              locationUpdate: initialSent,
            };
            initialSent = true;
            sendVisitPayload(enriched);
          },
          () => {
            window.clearTimeout(waitTimer);
            if (!initialSent && basePayload) {
              initialSent = true;
              sendVisitPayload(basePayload);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 25000,
            maximumAge: 120000,
          },
        );
      } else {
        initialSent = true;
        sendVisitPayload(basePayload);
      }

      // Optional Google One Tap: if NEXT_PUBLIC_GOOGLE_CLIENT_ID is configured,
      // signed-in Google/Chrome users can share their verified name & email.
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (googleClientId && !identity.name) {
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
              try {
                localStorage.setItem(
                  "dk-visitor-identity",
                  JSON.stringify({
                    name: claims.name ?? "",
                    email: claims.email ?? "",
                  }),
                );
              } catch {
                /* Ignore storage issues */
              }
              sendVisitPayload({
                ...basePayload,
                visitorName: claims.name ?? "",
                visitorEmail: claims.email ?? "",
                identityUpdate: true,
              });
            },
          });
          g?.accounts?.id?.prompt();
        };
        document.head.appendChild(script);
      }
    }, 1200);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", flushFallbackOnHide);
    };
  }, []);

  return null;
}
