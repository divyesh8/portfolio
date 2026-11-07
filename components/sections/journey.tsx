import { buildJourney } from "@/constants/content";
import { getProjects } from "@/lib/github";
import { JourneyTimeline } from "@/components/sections/journey-timeline";

/**
 * Server component. Merges the curated narrative with project milestones from
 * the live GitHub repos (see buildJourney), so a shipped project appears on
 * the timeline automatically — no code change. The scroll-linked spine and
 * reveal animation live in the client JourneyTimeline.
 */
export async function Journey() {
  const entries = buildJourney(await getProjects());
  return <JourneyTimeline entries={entries} />;
}
