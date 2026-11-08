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

export function VisitorBeacon() {
  useEffect(() => {
    if (navigator.webdriver) return;
    try {
      if (sessionStorage.getItem("dk-visit-notified")) return;
      sessionStorage.setItem("dk-visit-notified", "1");
    } catch {
      /* Continue if storage is restricted. */
    }

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

      const payload = {
        localTime: new Date().toLocaleString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
        platform: platformDetail,
        screen: `${window.screen.width}×${window.screen.height} (${window.devicePixelRatio || 1}x DPR)`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        language: nav.languages?.slice(0, 3).join(", ") || nav.language || "",
        hardware: hwParts.join(", "),
        connection: connParts.join(" · "),
        referrer: document.referrer || "Direct visit",
        url: window.location.href,
        theme: document.documentElement.dataset.theme || "dark",
      };

      fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        /* Never surface telemetry errors to visitors. */
      });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, []);

  return null;
}

