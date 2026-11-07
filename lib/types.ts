/** Shapes returned by our own /api/github route, derived from the
 *  public GitHub REST API. Dates are ISO-8601 strings. */

export type GitHubProfile = {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  /** ISO-8601, e.g. "2023-04-11T09:12:00Z" */
  createdAt: string;
};

export type GitHubRepo = {
  name: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stars: number;
  forks: number;
  /** ISO-8601 */
  pushedAt: string;
};

export type LanguageStat = {
  name: string;
  /** Repos using this language as primary. */
  count: number;
  /** 0–100, share of classified repos. */
  percent: number;
};

export type ActivityDay = {
  /** "YYYY-MM-DD" */
  date: string;
  count: number;
  /** 0–4 intensity bucket for the calendar cells. */
  level: 0 | 1 | 2 | 3 | 4;
};

export type ActivityCalendar = {
  days: ActivityDay[];
  total: number;
  /** True when GITHUB_TOKEN was present and the full 12-month
   *  contribution calendar came from the GraphQL API. False when
   *  derived from the public events feed (90 days, undercounts). */
  authoritative: boolean;
  /** False when the public events feed could not be read completely. */
  available?: boolean;
  windowLabel: string;
  weeks: number;
};

export type GitHubStats = {
  profile: GitHubProfile;
  repos: GitHubRepo[];
  languages: LanguageStat[];
  calendar: ActivityCalendar;
  totalStars: number;
};
