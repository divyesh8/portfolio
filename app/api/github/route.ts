import { NextResponse } from "next/server";
import { getGitHubStats } from "@/lib/github";

/** Cached for an hour, matching the fetch-level revalidation in lib/github. */
export const revalidate = 3600;

/**
 * The GitHub section renders on the server and does not need this route.
 * It exists so the same data is available to anything client-side that
 * wants to refresh without a full page load.
 */
export async function GET() {
  try {
    const stats = await getGitHubStats();
    return NextResponse.json(stats, {
      headers: {
        "Cache-Control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "GitHub is unavailable right now." },
      { status: 502 },
    );
  }
}
