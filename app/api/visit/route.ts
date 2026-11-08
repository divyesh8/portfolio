import dns from "node:dns/promises";
import { NextResponse } from "next/server";
import { SITE } from "@/constants/site";

export const runtime = "nodejs";

const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|telegrambot|discordbot|slackbot|linkedinbot|embedly|quora|pinterest|headlesschrome|lighthouse|vercel-screenshot|uptimerobot|pingdom/i;

const clean = (value: unknown, max = 300) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const mins = Math.floor(s / 60);
  const remSec = s % 60;
  if (mins < 60) return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMin = mins % 60;
  return `${hrs}h ${remMin}m ${remSec}s`;
}

function formatOffset(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `+${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

function formatIst(isoOrDate: string | Date): string {
  const d =
    typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "Unavailable";
  return `${new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(d)} IST`;
}

function parseUserAgent(ua: string) {
  let browser = "Unknown Browser";
  if (/Edg\/([\d.]+)/.test(ua)) {
    browser = `Microsoft Edge ${RegExp.$1}`;
  } else if (/OPR\/([\d.]+)/.test(ua)) {
    browser = `Opera ${RegExp.$1}`;
  } else if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) {
    browser = `Google Chrome ${RegExp.$1}`;
  } else if (/Firefox\/([\d.]+)/.test(ua)) {
    browser = `Mozilla Firefox ${RegExp.$1}`;
  } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
    browser = `Safari ${RegExp.$1}`;
  }

  let os = "Unknown OS";
  if (/Windows NT 10\.0/.test(ua)) {
    os = "Windows 10 / 11";
  } else if (/Windows NT ([\d.]+)/.test(ua)) {
    os = `Windows (${RegExp.$1})`;
  } else if (/Android ([\d.]+)/.test(ua)) {
    os = `Android ${RegExp.$1}`;
  } else if (/iPhone OS ([\d_]+)/.test(ua)) {
    os = `iOS ${RegExp.$1.replace(/_/g, ".")} (iPhone)`;
  } else if (/iPad.*OS ([\d_]+)/.test(ua)) {
    os = `iPadOS ${RegExp.$1.replace(/_/g, ".")}`;
  } else if (/Mac OS X ([\d_]+)/.test(ua)) {
    os = `macOS ${RegExp.$1.replace(/_/g, ".")}`;
  } else if (/Linux/.test(ua)) {
    os = "Linux";
  }

  let deviceType = "Desktop";
  if (/Mobi|Android.*Mobile|iPhone|iPod/i.test(ua)) {
    deviceType = "Mobile";
  } else if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) {
    deviceType = "Tablet";
  }

  let model = "";
  const androidModel = ua.match(/Android [\d.]+;\s*([^;)]+?)(?:\s+Build\/|\))/);
  if (androidModel?.[1]) {
    model = androidModel[1].trim();
  } else if (/iPhone/.test(ua)) {
    model = "Apple iPhone";
  } else if (/iPad/.test(ua)) {
    model = "Apple iPad";
  } else if (/Macintosh/.test(ua)) {
    model = "Apple Mac";
  }

  return { browser, os, deviceType, model };
}

function decodeHeader(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

interface GeoLookup {
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
  org?: string;
  domain?: string;
  timezone?: string;
}

function isPrivateIp(ip: string) {
  return (
    !ip ||
    ip === "Unknown IP" ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  );
}

async function lookupReverseDns(ip: string): Promise<string> {
  if (isPrivateIp(ip)) return "";
  try {
    const hosts = await Promise.race([
      dns.reverse(ip),
      new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 1000)),
    ]);
    return hosts[0]?.trim() ?? "";
  } catch {
    return "";
  }
}

async function lookupIpGeo(ip: string): Promise<GeoLookup> {
  if (isPrivateIp(ip)) {
    return {};
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1800);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return {};
    const data = (await res.json()) as Record<string, unknown>;
    if (data.success === false) return {};
    const conn =
      data.connection && typeof data.connection === "object"
        ? (data.connection as Record<string, unknown>)
        : {};
    const tz =
      data.timezone && typeof data.timezone === "object"
        ? (data.timezone as Record<string, unknown>)
        : {};
    return {
      city: clean(data.city, 120),
      region: clean(data.region, 120),
      country: clean(data.country, 120),
      isp: clean(conn.isp, 160),
      org: clean(conn.org, 160),
      domain: clean(conn.domain, 120),
      timezone: clean(tz.id, 100),
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}

interface ReverseGeocodeResult {
  shortPlace: string;
  fullAddress: string;
}

async function reverseGeocodeCoords(
  lat: number,
  lon: number,
): Promise<ReverseGeocodeResult | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": `DivyeshKolliPortfolio/1.0 (${SITE.email})`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const fullAddress = clean(data.display_name, 350);
    const addr =
      data.address && typeof data.address === "object"
        ? (data.address as Record<string, unknown>)
        : {};
    const placeParts = [
      clean(
        addr.amenity || addr.building || addr.university || addr.college,
        120,
      ),
      clean(
        addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.hamlet,
        100,
      ),
      clean(addr.city || addr.county || addr.state_district, 100),
      clean(addr.state, 80),
    ].filter(Boolean);
    const shortPlace = Array.from(new Set(placeParts)).join(", ");
    if (!fullAddress && !shortPlace) return null;
    return {
      shortPlace: shortPlace || fullAddress,
      fullAddress: fullAddress || shortPlace,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

interface ParsedSectionItem {
  label: string;
  visited: boolean;
  views: number;
  dwellSec: number;
  firstSeenSec: number;
}

interface ParsedActivityItem {
  atOffsetSec: number;
  timeLocal: string;
  action: string;
}

function parseSections(raw: unknown): ParsedSectionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      label: clean(item.label, 120) || "Section",
      visited: Boolean(item.visited),
      views: typeof item.views === "number" ? item.views : 0,
      dwellSec: typeof item.dwellSec === "number" ? item.dwellSec : 0,
      firstSeenSec:
        typeof item.firstSeenSec === "number" ? item.firstSeenSec : -1,
    }));
}

function parseActivityLog(raw: unknown): ParsedActivityItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .slice(0, 150)
    .map((item) => ({
      atOffsetSec:
        typeof item.atOffsetSec === "number" ? item.atOffsetSec : 0,
      timeLocal: clean(item.timeLocal, 40),
      action: clean(item.action, 240),
    }))
    .filter((item) => Boolean(item.action));
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false }, { status: 202 });
  }

  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) {
    return NextResponse.json({ ok: true });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as Record<string, unknown>;
    }
  } catch {
    /* Optional client payload */
  }

  const reportType = clean(body.reportType, 40) || "arrival";
  const sessionId = clean(body.sessionId, 40) || "SES-DIRECT";
  const exitReason = clean(body.exitReason, 120);

  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0]?.trim() : "") ||
    request.headers.get("x-real-ip")?.trim() ||
    "Unknown IP";

  const vercelCity = decodeHeader(request.headers.get("x-vercel-ip-city"));
  const vercelRegion = decodeHeader(
    request.headers.get("x-vercel-ip-country-region"),
  );
  const vercelCountry = decodeHeader(
    request.headers.get("x-vercel-ip-country"),
  );
  const vercelTz = decodeHeader(request.headers.get("x-vercel-ip-timezone"));

  const hasPreciseGps =
    typeof body.gpsLat === "number" &&
    typeof body.gpsLon === "number" &&
    Number.isFinite(body.gpsLat) &&
    Number.isFinite(body.gpsLon);
  const gpsLat = hasPreciseGps ? (body.gpsLat as number) : null;
  const gpsLon = hasPreciseGps ? (body.gpsLon as number) : null;
  const gpsAccuracy =
    typeof body.gpsAccuracy === "number" && Number.isFinite(body.gpsAccuracy)
      ? Math.round(body.gpsAccuracy)
      : null;

  const [geo, hostname, reversePlace] = await Promise.all([
    lookupIpGeo(ip),
    lookupReverseDns(ip),
    gpsLat !== null && gpsLon !== null
      ? reverseGeocodeCoords(gpsLat, gpsLon)
      : Promise.resolve(null),
  ]);

  const ipCity = vercelCity || geo.city || "";
  const ipRegion = geo.region || vercelRegion || "";
  const ipCountry = geo.country || vercelCountry || "";
  const ispParts = [geo.org, geo.isp, geo.domain].filter(Boolean);
  const isp = Array.from(new Set(ispParts)).join(" · ") || "Unavailable";

  const ipLocationParts = [ipCity, ipRegion, ipCountry].filter(Boolean);
  const ipRegionLabel =
    ipLocationParts.length > 0
      ? `${ipLocationParts.join(", ")} (ISP Gateway Region)`
      : "Unknown ISP region";

  const locationLabel = reversePlace
    ? reversePlace.shortPlace
    : ipLocationParts.length > 0
      ? `${ipLocationParts.join(", ")} (ISP Gateway)`
      : "Unknown location";

  const preciseCoordinates =
    gpsLat !== null && gpsLon !== null
      ? `${gpsLat}, ${gpsLon}${gpsAccuracy !== null ? ` (±${gpsAccuracy}m accuracy)` : ""}`
      : "";

  const mapsUrl =
    gpsLat !== null && gpsLon !== null
      ? `https://www.google.com/maps?q=${gpsLat},${gpsLon}`
      : ipLocationParts.length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ipLocationParts.join(", "))}`
        : "";

  const now = new Date();
  const enteredIso = clean(body.enteredIso, 60);
  const leftIso = clean(body.leftIso, 60);
  const enteredIst = enteredIso ? formatIst(enteredIso) : formatIst(now);
  const leftIst = leftIso ? formatIst(leftIso) : formatIst(now);

  const totalDurationSec =
    typeof body.totalDurationSec === "number" ? body.totalDurationSec : 0;
  const activeDurationSec =
    typeof body.activeDurationSec === "number" ? body.activeDurationSec : 0;
  const idleDurationSec =
    typeof body.idleDurationSec === "number" ? body.idleDurationSec : 0;
  const maxScrollPercent =
    typeof body.maxScrollPercent === "number" ? body.maxScrollPercent : 0;
  const interactionCount =
    typeof body.interactionCount === "number" ? body.interactionCount : 0;

  const sections = parseSections(body.sectionBreakdown);
  const visitedSections = sections.filter((s) => s.visited);
  const unvisitedSections = sections.filter((s) => !s.visited);
  const visitOrder = Array.isArray(body.visitOrder)
    ? body.visitOrder.map((v) => clean(v, 100)).filter(Boolean)
    : [];
  const activityLog = parseActivityLog(body.activityLog);

  const { browser, os, deviceType, model } = parseUserAgent(ua);
  const visitorName = clean(body.visitorName, 120);
  const visitorEmail = clean(body.visitorEmail, 160);
  const visitorIdentity =
    [visitorName, visitorEmail ? `<${visitorEmail}>` : ""]
      .filter(Boolean)
      .join(" ") ||
    "Not shared (No form entry / Google Sign-In yet)";

  const clientDevice = clean(body.platform, 120);
  const gpu = clean(body.gpu, 180) || "Unavailable";
  const clientTz =
    clean(body.timeZone, 100) || vercelTz || geo.timezone || "Unknown";
  const enteredLocalTime = clean(body.localTime, 120) || "Unavailable";
  const leftLocalTime = clean(body.leftLocalTime, 120) || "Unavailable";
  const screenInfo = clean(body.screen, 120) || "Unavailable";
  const viewportInfo = clean(body.viewport, 120) || "Unavailable";
  const language = clean(body.language, 80) || "Unavailable";
  const referrer = clean(body.referrer, 300) || "Direct visit";
  const pageUrl = clean(body.url, 300) || SITE.url;
  const hardware = clean(body.hardware, 120) || "Unavailable";
  const connection = clean(body.connection, 100) || "Unavailable";
  const theme = clean(body.theme, 40) || "dark";

  const deviceSummary = [
    deviceType,
    model || clientDevice,
    `${os} · ${browser}`,
  ]
    .filter(Boolean)
    .join(" — ");

  const isExit = reportType === "exit";
  const subjectPrefix =
    reportType === "exit"
      ? `Session Summary (${formatDuration(activeDurationSec)} active)`
      : reportType === "location_update"
        ? "Exact Location Pinpointed"
        : reportType === "identity_update"
          ? "Visitor Identified"
          : "New Visitor Arrived";

  const sessionRows: Array<[string, string]> = [
    ["Session ID", sessionId],
    ["Visitor Name", visitorIdentity],
    ["Entered Page At", `${enteredIst} (Local: ${enteredLocalTime} · ${clientTz})`],
    ...(isExit
      ? [
          [
            "Left Page At",
            `${leftIst} (Local: ${leftLocalTime})${exitReason ? ` — ${exitReason}` : ""}`,
          ] as [string, string],
        ]
      : [["Report Sent At", leftIst] as [string, string]]),
    [
      "Active & Total Time",
      `Active: ${formatDuration(activeDurationSec)} · Idle/Background: ${formatDuration(idleDurationSec)} · Total on Page: ${formatDuration(totalDurationSec)}`,
    ],
    [
      "Engagement Summary",
      `Scrolled ${maxScrollPercent}% of page · ${visitedSections.length}/${sections.length || 10} sections viewed · ${interactionCount} clicks/interactions`,
    ],
    [
      "Navigation Flow",
      visitOrder.length > 0 ? visitOrder.join(" → ") : "Hero only",
    ],
    ...(unvisitedSections.length > 0
      ? [
          [
            "Sections Not Reached",
            unvisitedSections.map((s) => s.label).join(", "),
          ] as [string, string],
        ]
      : [["Sections Not Reached", "None (Viewed 100% of sections!)"] as [string, string]]),
  ];

  const deviceLocationRows: Array<[string, string]> = [
    ...(reversePlace
      ? [
          ["Exact Area / Campus", reversePlace.fullAddress] as [string, string],
          ["GPS / Wi-Fi Coordinates", preciseCoordinates] as [string, string],
        ]
      : [
          [
            "Location Precision",
            "Approximate ISP Gateway only (Browser Location permission not granted)",
          ] as [string, string],
        ]),
    ["ISP Gateway Region", ipRegionLabel],
    ["IP Address", hostname ? `${ip} (${hostname})` : ip],
    ["Network / ISP", isp],
    ["Device", deviceSummary],
    ["Operating System", clientDevice || os],
    ["Browser", browser],
    ["GPU / Graphics", gpu],
    ["Screen & Display", `${screenInfo} (Viewport: ${viewportInfo})`],
    ["Hardware & Network", `${hardware} · Connection: ${connection}`],
    ["Language & Theme", `${language} · Theme: ${theme}`],
    ["Entry URL", pageUrl],
    ["Referrer / Source", referrer],
    ["User-Agent", ua],
  ];

  const sectionLinesText =
    visitedSections.length > 0
      ? visitedSections.map(
          (s) =>
            `  • ${s.label}: ${formatDuration(s.dwellSec)} (${s.dwellSec}s, viewed ${s.views}x, first seen at ${formatOffset(s.firstSeenSec)})`,
        )
      : ["  • None recorded"];

  const activityLinesText =
    activityLog.length > 0
      ? activityLog.map(
          (a, i) =>
            `  ${String(i + 1).padStart(2, "0")}. [${formatOffset(a.atOffsetSec)} | ${a.timeLocal}] ${a.action}`,
        )
      : ["  • No interactions recorded"];

  const textBody = [
    `${subjectPrefix} — ${SITE.name}'s Portfolio (${SITE.url})`,
    "============================================================",
    "",
    "1. SESSION TIMING & ENGAGEMENT",
    "------------------------------------------------------------",
    ...sessionRows.map(([k, v]) => `${k}: ${v}`),
    "",
    "2. SECTIONS VISITED & TIME SPENT",
    "------------------------------------------------------------",
    ...sectionLinesText,
    "",
    "3. COMPLETE ACTIVITY TIMELINE (EVERY ACTION)",
    "------------------------------------------------------------",
    ...activityLinesText,
    "",
    "4. LOCATION, NETWORK & DEVICE DETAILS",
    "------------------------------------------------------------",
    ...deviceLocationRows.map(([k, v]) => `${k}: ${v}`),
    ...(mapsUrl ? [`Google Maps: ${mapsUrl}`] : []),
  ].join("\n");

  const renderHtmlTableRows = (rows: Array<[string, string]>) =>
    rows
      .map(
        ([label, val]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #242424;color:#a09c9a;font-family:monospace;font-size:12px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #242424;color:#f2efeb;font-family:system-ui,-apple-system,sans-serif;font-size:13px;word-break:break-word;">${escapeHtml(val)}</td>
        </tr>`,
      )
      .join("");

  const sectionHtmlRows =
    visitedSections.length > 0
      ? visitedSections
          .map(
            (s) => `
          <tr>
            <td style="padding:7px 12px;border-bottom:1px solid #242424;color:#f2efeb;font-size:13px;">${escapeHtml(s.label)}</td>
            <td style="padding:7px 12px;border-bottom:1px solid #242424;color:#f04858;font-family:monospace;font-size:12px;white-space:nowrap;">${escapeHtml(formatDuration(s.dwellSec))} (${s.dwellSec}s)</td>
            <td style="padding:7px 12px;border-bottom:1px solid #242424;color:#a09c9a;font-family:monospace;font-size:12px;white-space:nowrap;">${s.views}x · at ${escapeHtml(formatOffset(s.firstSeenSec))}</td>
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="3" style="padding:8px 12px;color:#a09c9a;font-size:13px;">No sections recorded yet.</td></tr>`;

  const activityHtmlRows =
    activityLog.length > 0
      ? activityLog
          .map(
            (a, idx) => `
          <tr>
            <td style="padding:6px 10px;border-bottom:1px solid #202020;color:#8e8a87;font-family:monospace;font-size:11px;white-space:nowrap;vertical-align:top;">#${idx + 1} · ${escapeHtml(formatOffset(a.atOffsetSec))}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #202020;color:#a09c9a;font-family:monospace;font-size:11px;white-space:nowrap;vertical-align:top;">${escapeHtml(a.timeLocal)}</td>
            <td style="padding:6px 10px;border-bottom:1px solid #202020;color:#f2efeb;font-size:13px;word-break:break-word;">${escapeHtml(a.action)}</td>
          </tr>`,
          )
          .join("")
      : `<tr><td colspan="3" style="padding:8px 12px;color:#a09c9a;font-size:13px;">No actions recorded.</td></tr>`;

  const headingWho = visitorName || locationLabel;
  const badgeText = isExit
    ? `SESSION EXIT & FULL ACTIVITY REPORT · ${sessionId}`
    : `${subjectPrefix.toUpperCase()} · ${sessionId}`;

  const htmlBody = `
  <div style="background:#090909;color:#f2efeb;padding:24px;font-family:system-ui,-apple-system,sans-serif;">
    <div style="max-width:700px;margin:0 auto;border:1px solid #2a2a2a;background:#121212;border-top:3px solid #e32b3c;padding:22px;">
      <p style="margin:0 0 4px;font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#e32b3c;">${escapeHtml(badgeText)}</p>
      <h2 style="margin:0 0 6px;font-size:20px;color:#f2efeb;">${escapeHtml(headingWho)} · ${escapeHtml(deviceType)} (${escapeHtml(clientDevice || os)})</h2>
      <p style="margin:0 0 18px;font-family:monospace;font-size:12px;color:#a09c9a;">Active: <strong style="color:#f2efeb;">${escapeHtml(formatDuration(activeDurationSec))}</strong> · Scroll Depth: <strong style="color:#f2efeb;">${maxScrollPercent}%</strong> · Actions: <strong style="color:#f2efeb;">${interactionCount}</strong></p>

      <h3 style="margin:18px 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#f04858;">1. Session Timing &amp; Engagement</h3>
      <table style="width:100%;border-collapse:collapse;background:#0e0e0e;border:1px solid #242424;">
        <tbody>${renderHtmlTableRows(sessionRows)}</tbody>
      </table>

      <h3 style="margin:22px 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#f04858;">2. Sections Visited &amp; Time Spent</h3>
      <table style="width:100%;border-collapse:collapse;background:#0e0e0e;border:1px solid #242424;">
        <thead>
          <tr style="background:#171717;">
            <th align="left" style="padding:7px 12px;font-family:monospace;font-size:11px;color:#a09c9a;border-bottom:1px solid #2a2a2a;">Section</th>
            <th align="left" style="padding:7px 12px;font-family:monospace;font-size:11px;color:#a09c9a;border-bottom:1px solid #2a2a2a;">Time Spent</th>
            <th align="left" style="padding:7px 12px;font-family:monospace;font-size:11px;color:#a09c9a;border-bottom:1px solid #2a2a2a;">Views / First Seen</th>
          </tr>
        </thead>
        <tbody>${sectionHtmlRows}</tbody>
      </table>

      <h3 style="margin:22px 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#f04858;">3. Complete Activity Timeline (${activityLog.length} events)</h3>
      <table style="width:100%;border-collapse:collapse;background:#0e0e0e;border:1px solid #242424;">
        <tbody>${activityHtmlRows}</tbody>
      </table>

      <h3 style="margin:22px 0 8px;font-family:monospace;font-size:11px;letter-spacing:0.09em;text-transform:uppercase;color:#f04858;">4. Location, Network &amp; Device Profile</h3>
      <table style="width:100%;border-collapse:collapse;background:#0e0e0e;border:1px solid #242424;">
        <tbody>${renderHtmlTableRows(deviceLocationRows)}</tbody>
      </table>

      ${
        mapsUrl
          ? `<p style="margin:16px 0 0;font-size:12px;"><a href="${escapeHtml(mapsUrl)}" style="color:#f04858;text-decoration:none;font-family:monospace;">${gpsLat !== null ? "Open exact GPS / Wi-Fi pin on Google Maps &rarr;" : "View ISP gateway city on Google Maps &rarr;"}</a></p>`
          : ""
      }
    </div>
  </div>`;

  const rawFrom = (
    process.env.CONTACT_FROM ?? "contact@divyeshkolli.fun"
  ).trim();
  const fromAddress = rawFrom.match(/<([^>]+)>/)?.[1]?.trim() || rawFrom;
  const toAddress = (process.env.CONTACT_TO ?? SITE.email).trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Portfolio Visitor <${fromAddress}>`,
        to: [toAddress],
        subject: `${subjectPrefix}: ${visitorName ? `${visitorName} (${locationLabel})` : locationLabel} · ${deviceType} [${sessionId}]`,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      console.error("Visit email provider returned HTTP", res.status);
      return NextResponse.json({ ok: false }, { status: 202 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
