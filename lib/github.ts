import type {
  ActivityCalendar,
  ActivityDay,
  GitHubRepo,
  GitHubStats,
  LanguageStat,
} from "@/lib/types";
import {
  FALLBACK_PROJECTS,
  FEATURED_SLUGS,
  PORTFOLIO_REPO,
  PROJECT_OVERRIDES,
  type Project,
  type ProjectTag,
} from "@/constants/content";
import { SITE } from "@/constants/site";

const API = "https://api.github.com";
const REVALIDATE = 3600; // 1 hour

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return h;
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: headers(),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`GitHub ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

function bucket(count: number, max: number): ActivityDay["level"] {
  if (count <= 0) return 0;
  const ratio = count / Math.max(max, 1);
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function isoDay(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Fixed-length day grid ending today, filled from a date -> count map.
 *  Starts on a Sunday so the columns read as real weeks. */
function buildGrid(counts: Map<string, number>, days: number) {
  const out: ActivityDay[] = [];
  let total = 0;
  const max = Math.max(1, ...counts.values());

  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  for (const d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const key = isoDay(d);
    const count = counts.get(key) ?? 0;
    total += count;
    out.push({ date: key, count, level: bucket(count, max) });
  }
  return { days: out, total };
}

/** Full 12-month contribution calendar. GraphQL only, needs GITHUB_TOKEN. */
async function calendarFromGraphQL(
  login: string,
): Promise<ActivityCalendar | null> {
  if (!process.env.GITHUB_TOKEN) return null;

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`;

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
    if (!cal) return null;

    const weeks = cal.weeks as {
      contributionDays: { date: string; contributionCount: number }[];
    }[];
    const flat = weeks.flatMap((w) => w.contributionDays);
    const max = Math.max(1, ...flat.map((d) => d.contributionCount));

    return {
      days: flat.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: bucket(d.contributionCount, max),
      })),
      total: cal.totalContributions as number,
      authoritative: true,
      windowLabel: "Past 12 months",
      weeks: weeks.length,
    };
  } catch {
    return null;
  }
}

/** Fallback: a real 90-day window from the public events feed. Genuine
 *  activity, but the feed caps at ~300 events so it undercounts — the UI
 *  labels it "Past 90 days" rather than claiming a full contribution graph. */
async function calendarFromEvents(login: string): Promise<ActivityCalendar> {
  const counts = new Map<string, number>();
  let available = true;

  try {
    for (let page = 1; page <= 3; page++) {
      const events = await gh<
        { created_at: string }[]
      >(`/users/${login}/events/public?per_page=100&page=${page}`);
      if (!events.length) break;
      for (const e of events) {
        const day = e.created_at.slice(0, 10);
        counts.set(day, (counts.get(day) ?? 0) + 1);
      }
      if (events.length < 100) break;
    }
  } catch {
    available = false;
  }

  const { days, total } = buildGrid(counts, 91);
  return {
    days,
    total,
    authoritative: false,
    available,
    windowLabel: "Past 90 days",
    weeks: Math.ceil(days.length / 7),
  };
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const login = SITE.handle;

  const [profileRaw, reposRaw] = await Promise.all([
    gh<{
      login: string;
      name: string | null;
      bio: string | null;
      avatar_url: string;
      html_url: string;
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    }>(`/users/${login}`),
    getPublicRepos(login),
  ]);

  const repos: GitHubRepo[] = reposRaw
    .filter((r) => !r.fork && !r.archived)
    .map((r) => ({
      name: r.name,
      description:
        r.description ??
        PROJECT_OVERRIDES[r.name.toLowerCase()]?.description ??
        null,
      htmlUrl: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      pushedAt: r.pushed_at,
    }));

  const langCounts = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  }
  const classified = [...langCounts.values()].reduce((a, b) => a + b, 0);
  const languages: LanguageStat[] = [...langCounts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percent: classified ? Math.round((count / classified) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const calendar =
    (await calendarFromGraphQL(login)) ?? (await calendarFromEvents(login));

  return {
    profile: {
      login: profileRaw.login,
      name: profileRaw.name,
      bio: profileRaw.bio,
      avatarUrl: profileRaw.avatar_url,
      htmlUrl: profileRaw.html_url,
      publicRepos: profileRaw.public_repos,
      followers: profileRaw.followers,
      following: profileRaw.following,
      createdAt: profileRaw.created_at,
    },
    repos: repos.slice(0, 6),
    languages,
    calendar,
    totalStars: repos.reduce((sum, r) => sum + r.stars, 0),
  };
}

/* ------------------------------------------------------------------
   Featured projects, generated from the live repo list.

   Any repo with a description or a live URL (homepage) is featured
   automatically — so a newly deployed project appears on the portfolio
   with no code change. Bare repos (no description, no site) stay hidden.
   Flagship repos are enriched from PROJECT_OVERRIDES; everything else is
   derived from the repo's own metadata.
   ------------------------------------------------------------------ */

type ProjectRepo = {
  name: string;
  description: string | null;
  private: boolean;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  created_at: string;
  pushed_at: string;
};

async function getPublicRepos(login: string): Promise<ProjectRepo[]> {
  const repos: ProjectRepo[] = [];
  for (let page = 1; ; page++) {
    const batch = await gh<ProjectRepo[]>(`/users/${login}/repos?per_page=100&sort=pushed&page=${page}`);
    repos.push(...batch.filter((repo) => !repo.private));
    if (batch.length < 100) return repos;
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const prettify = (name: string) =>
  name
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

function deriveTags(r: ProjectRepo): ProjectTag[] {
  const hay = `${r.name} ${r.description ?? ""} ${(r.topics ?? []).join(" ")}`.toLowerCase();
  const lang = (r.language ?? "").toLowerCase();
  const tags = new Set<ProjectTag>();
  if (/(^|\W)(ai|ml|gpt|llm|openai|genai)(\W|$)/.test(hay)) tags.add("ai");
  if (["java", "c", "c++", "go", "rust"].includes(lang) && !r.homepage) {
    tags.add("systems");
  }
  if (r.homepage || ["typescript", "javascript"].includes(lang)) tags.add("web");
  if (tags.size === 0) tags.add(r.homepage ? "web" : "systems");
  return [...tags];
}

function publicHomepage(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const repos = await getPublicRepos(SITE.handle);

    const featured = repos.filter(
      (r) =>
        !r.fork &&
        !r.archived &&
        r.name.toLowerCase() !== PORTFOLIO_REPO.toLowerCase() &&
        (Boolean(r.description?.trim()) ||
          Boolean(PROJECT_OVERRIDES[r.name.toLowerCase()])),
    );

    const projects: Project[] = featured.map((r) => {
      const slug = r.name.toLowerCase();
      const curated = PROJECT_OVERRIDES[slug];
      if (curated) {
        return {
          ...curated,
          startedAt: curated.startedAt ?? r.created_at,
          href: curated.href ?? publicHomepage(r.homepage),
          repo: r.html_url,
        };
      }
      return {
        slug,
        title: prettify(r.name),
        kind: r.language ? `${r.language} project` : "Project",
        year: r.created_at.slice(0, 4),
        startedAt: r.created_at,
        status: "Public repository",
        description: r.description ?? "",
        features: [],
        stack: r.topics?.length ? r.topics.slice(0, 6).map(cap) : r.language ? [r.language] : [],
        href: publicHomepage(r.homepage),
        repo: r.html_url,
        tags: deriveTags(r),
      };
    });

    // Ensure every curated project in FALLBACK_PROJECTS is included even if
    // the GitHub API is paginated or rate-limited.
    for (const fallback of FALLBACK_PROJECTS) {
      if (!projects.some((p) => p.slug === fallback.slug)) {
        projects.push(fallback);
      }
    }

    // Flagship overrides first, in their defined order; the rest keep the
    // API's pushed-date order (most recent first).
    const order: readonly string[] = FEATURED_SLUGS;
    projects.sort((a, b) => {
      const ai = order.indexOf(a.slug);
      const bi = order.indexOf(b.slug);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return projects;
  } catch {
    return FALLBACK_PROJECTS;
  }
}
