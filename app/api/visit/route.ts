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
      clean(addr.amenity || addr.building || addr.university || addr.college, 120),
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

  // Only drop an exact coordinate pin on Google Maps when real GPS / Wi-Fi
  // coordinates are available; ISP-only centroids point to generic city centers
  // like Chennai Central rather than the visitor's actual suburb/campus.
  const mapsUrl =
    gpsLat !== null && gpsLon !== null
      ? `https://www.google.com/maps?q=${gpsLat},${gpsLon}`
      : ipLocationParts.length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ipLocationParts.join(", "))}`
        : "";

  const now = new Date();
  const istTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  }).format(now);
  const utcTime = now.toISOString();

  const { browser, os, deviceType, model } = parseUserAgent(ua);
  const visitorName = clean(body.visitorName, 120);
  const visitorEmail = clean(body.visitorEmail, 160);
  const visitorIdentity =
    [visitorName, visitorEmail ? `<${visitorEmail}>` : ""]
      .filter(Boolean)
      .join(" ") ||
    "Not shared (Browsers block reading personal names without Google Sign-In or form entry)";

  const clientDevice = clean(body.platform, 120);
  const gpu = clean(body.gpu, 180) || "Unavailable";
  const clientTz =
    clean(body.timeZone, 100) || vercelTz || geo.timezone || "Unknown";
  const clientLocalTime = clean(body.localTime, 120) || "Unavailable";
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

  const rows: Array<[string, string]> = [
    ["Visitor Name", visitorIdentity],
    ["Date & Time (IST)", `${istTime} IST`],
    ["Visitor Local Time", `${clientLocalTime} (${clientTz})`],
    ["UTC Timestamp", utcTime],
    ...(reversePlace
      ? [
          ["Exact Area / Campus", reversePlace.fullAddress] as [string, string],
          ["GPS / Wi-Fi Coordinates", preciseCoordinates] as [string, string],
        ]
      : [
          [
            "LocationPrecision",
            "Approximate ISP Gateway only (Visitor did not grant browser Location permission)",
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
    ["Page Visited", pageUrl],
    ["Referrer / Source", referrer],
    ["User-Agent", ua],
  ];

  const isUpdate = Boolean(body.locationUpdate || body.identityUpdate);
  const subjectPrefix = body.locationUpdate
    ? "Exact Location Pinpointed"
    : body.identityUpdate
      ? "Visitor Identified"
      : "Visitor Alert";

  const textBody = [
    `${subjectPrefix} on ${SITE.name}'s Portfolio (${SITE.url})`,
    "------------------------------------------------------------",
    ...rows.map(([label, val]) => `${label}: ${val}`),
    ...(mapsUrl ? [`Google Maps: ${mapsUrl}`] : []),
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, val]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #262626;color:#a09c9a;font-family:monospace;font-size:12px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #262626;color:#f2efeb;font-family:system-ui,-apple-system,sans-serif;font-size:13px;word-break:break-word;">${escapeHtml(val)}</td>
      </tr>`,
    )
    .join("");

  const headingWho = visitorName || locationLabel;
  const htmlBody = `
  <div style="background:#090909;color:#f2efeb;padding:24px;font-family:system-ui,-apple-system,sans-serif;">
    <div style="max-width:640px;margin:0 auto;border:1px solid #2a2a2a;background:#121212;border-top:3px solid #e32b3c;padding:20px;">
      <p style="margin:0 0 4px;font-family:monospace;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#e32b3c;">${escapeHtml(isUpdate ? subjectPrefix : "Portfolio Visitor Telemetry")}</p>
      <h2 style="margin:0 0 16px;font-size:20px;color:#f2efeb;">${escapeHtml(headingWho)} · ${escapeHtml(deviceType)} (${escapeHtml(clientDevice || os)})</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>${htmlRows}</tbody>
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
        subject: `${subjectPrefix}: ${visitorName ? `${visitorName} (${locationLabel})` : locationLabel} · ${deviceType} (${os}, ${browser.split(" ")[0]})`,
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
