import { NextResponse } from "next/server";
import { SITE } from "@/constants/site";

export const runtime = "nodejs";

const cleanText = (value: unknown) => typeof value === "string" ? value.trim() : "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const fields = body as Record<string, unknown>;
  const name = cleanText(fields.name);
  const email = cleanText(fields.email);
  const message = cleanText(fields.message);

  // The honeypot accepts bot submissions without sending a message.
  if (fields.company) {
    return NextResponse.json({ ok: true });
  }

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  if (message.length < 10 || message.length > 4000) {
    return NextResponse.json(
      { error: "Enter a message between 10 and 4,000 characters." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  // No provider wired up yet — tell the client so it can open a prefilled
  // mail client rather than dropping the message on the floor.
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Email delivery is unavailable. You can open a draft with your message.",
        fallback: true,
      },
      { status: 503 },
    );
  }

  // The address the email is sent from must be a domain you control in Resend
  // (or their shared onboarding address). The visitor's name becomes the
  // display name so your inbox shows the message as coming from them, and
  // reply_to is their address so Reply goes straight back. Strip characters
  // that could break or inject into the header.
  const safeName = name.replace(/[\r\n"<>]/g, " ").trim().slice(0, 80);
  // divyeshkolli.fun is verified in Resend, so we send from a real address on
  // the domain and can deliver to any inbox. Both are overridable via env.
  const fromAddress = process.env.CONTACT_FROM ?? "contact@divyeshkolli.fun";
  const toAddress = process.env.CONTACT_TO ?? SITE.email;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${safeName || "Portfolio"} <${fromAddress}>`,
        to: [toAddress],
        reply_to: email,
        subject: `Portfolio — ${safeName || "New message"}`,
        text: `${message}\n\n—\n${name}\n${email}`,
      }),
    });

    if (!res.ok) {
      console.error("Contact provider returned HTTP", res.status);
      return NextResponse.json(
        { error: "Could not send right now.", fallback: true },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not send right now.", fallback: true },
      { status: 502 },
    );
  }
}
