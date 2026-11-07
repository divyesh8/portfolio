import { SITE, SOCIALS } from "./site";

export const HERO = {
  headline: "Building reliable software, from code to cloud.",
  roles: ["Full-stack developer", "Backend developer", "Cloud computing student"],
  careerDirection: SITE.careerPath,
  intro:
    "I study cloud computing at SRM in Chennai. I build backend services and tools that help explain what happens when software fails.",
} as const;

export const ABOUT = {
  lead:
    "I study Computer Science and Engineering with a specialization in Cloud Computing at SRM Institute of Science and Technology in Chennai (2025–2029).",
  paragraph:
    "My work focuses on how backend services, distributed storage engines, and full-stack web applications behave under real operational conditions—how state transitions are recorded, how configuration drift is caught before deployment, and how systems recover cleanly after failure.",
  philosophy:
    "I prefer systems I can explain and verify. Whether building a dependency-free Java NIO protocol server, a static configuration auditor, or an instrumented FastAPI control plane, I design software so every state change leaves clear evidence: health transitions, distributed traces, metrics, or line-level findings.",
  direction:
    "My engineering path progresses from Cloud Engineering toward Site Reliability Engineering (SRE) and Platform Engineering.",
  interests: [
    "Cloud Infrastructure & Containerized Systems",
    "Backend Engineering & Network Protocols",
    "Site Reliability, Prometheus & OpenTelemetry",
    "Scalable Full-Stack Web Applications",
  ],
  educationHistory: [
    {
      period: SITE.studyPeriod,
      institution: SITE.university,
      qualification: `${SITE.education} (${SITE.specialization})`,
      location: "Kattankulathur, Chennai",
    },
    {
      period: "Completed",
      institution: "Delhi Public School, Visakhapatnam",
      qualification: "Higher Secondary Education",
      location: "Visakhapatnam, India",
    },
  ],
  languages: [
    { name: "Telugu", level: "Native" },
    { name: "English", level: "Professional" },
    { name: "Hindi", level: "Fluent" },
  ],
} as const;

export const SKILL_GROUPS = [
  {
    title: "Programming",
    items: ["Java", "Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    title: "Backend Engineering",
    items: ["FastAPI", "Node.js", "REST APIs", "WebSockets", "Java NIO", "RESP / TCP"],
  },
  {
    title: "Cloud & Infrastructure",
    items: ["AWS Fundamentals", "Docker", "Docker Compose", "Linux", "TCP/IP", "WebRTC"],
  },
  {
    title: "Frontend Development",
    items: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "Supabase", "Neon", "Prisma"],
  },
  {
    title: "DevOps & Tools",
    items: ["Git", "GitHub", "Vercel", "Prometheus", "OpenTelemetry"],
  },
  {
    title: "Computer Science Fundamentals",
    items: [
      "Data Structures",
      "Algorithms",
      "Object-Oriented Programming",
      "Operating Systems",
      "Database Management",
    ],
  },
] as const;

export type ProjectTag = "cloud" | "systems" | "web" | "product" | "ai";

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  status: string;
  description: string;
  problem?: string;
  solution?: string;
  startedAt?: string;
  architecture?: string;
  features: string[];
  stack: string[];
  href: string | null;
  repo: string | null;
  tags: ProjectTag[];
  image?: { src: string; alt: string; caption: string };
};

export const PORTFOLIO_REPO = "divyesh-";
export const FEATURED_SLUGS = [
  "aegisops",
  "clouddoctor",
  "nimbus",
  "threadlabz",
] as const;

// Case studies describe the verified implementations in the public repositories.
export const PROJECT_OVERRIDES: Record<string, Project> = {
  aegisops: {
    slug: "aegisops",
    title: "AegisOps",
    kind: "Cloud reliability & observability",
    year: "2026",
    status: "In development · Docker Compose stack",
    description:
      "A distributed service reliability platform that tracks failures from concurrent health probes through durable operational events, incident timelines, OpenTelemetry traces, and Prometheus metrics.",
    problem:
      "A single failed HTTP request only reveals a symptom. Operators need a durable sequence of service health transitions, correlated distributed traces across downstream dependencies, and live service metrics to understand what changed and when recovery occurred.",
    startedAt: "2026-08-17",
    solution:
      "An active control plane probes registered services on bounded intervals, records immutable operational events on state transitions, opens an incident after consecutive failures, and resolves the same incident automatically upon verified recovery.",
    architecture:
      "A FastAPI control plane concurrently probes checkout, inventory, and payment services every 5 seconds with a 1-second timeout guard. PostgreSQL (migrated via Alembic) stores the service registry, health transitions, and incident timelines. A Next.js dashboard inspects live operational records, W3C OpenTelemetry trace context propagates across services, and Prometheus scrapes `/metrics` endpoints.",
    features: [
      "Bounded concurrent health checks with timeout and concurrency guards",
      "Immutable state-transition events and automated incident lifecycle (open → resolved)",
      "W3C OpenTelemetry trace propagation and Prometheus metrics scraping across services",
    ],
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Docker Compose",
      "OpenTelemetry",
      "Prometheus",
      "Next.js",
    ],
    href: null,
    repo: SOCIALS.github + "/AegisOps",
    tags: ["cloud", "systems"],
    image: {
      src: "/projects/aegisops.webp",
      alt: "AegisOps architecture diagram connecting the Next.js dashboard, FastAPI control plane, PostgreSQL, Prometheus, and monitored services.",
      caption: "AegisOps service topology and Prometheus / OpenTelemetry observability flow.",
    },
  },
  clouddoctor: {
    slug: "clouddoctor",
    title: "CloudDoctor",
    kind: "Configuration analysis CLI",
    year: "2026",
    status: "Dependency-free Java 21 CLI",
    description:
      "A deterministic Java 21 static analysis CLI that detects environment and Docker Compose configuration drift before deployment.",
    problem:
      "Deployments frequently fail at runtime when an environment variable declared in `.env.example` or referenced in `docker-compose.yml` is missing from the target `.env` file—an omission that is easy to overlook during manual code review.",
    startedAt: "2026-07-26",
    solution:
      "Parse repository `.env`, `.env.example`, and Compose manifests into a normalized fact table, evaluate deterministic invariant rules against those facts, and report every missing or drifted key with exact file and line evidence.",
    architecture:
      "Structured into three pure Java 21 modules (`probe`, `engine`, `cli`). `DotEnvReader` and `ComposeReader` extract declarations and variable interpolations into a `FactTable` with URN identifiers; invariants such as `Inv04EnvExampleDrift` emit structured `Finding` records rendered as human-readable diagnostics or machine-readable JSON with distinct CI exit codes.",
    features: [
      "Environment and Docker Compose drift checks (`Inv04EnvExampleDrift`)",
      "Exact file and line-number evidence for each configuration finding",
      "Deterministic execution with JSON output and CI-aware exit codes",
    ],
    stack: ["Java 21", "Static Analysis", "CLI", "Docker Compose"],
    href: null,
    repo: SOCIALS.github + "/CloudDoctor",
    tags: ["cloud", "systems"],
    image: {
      src: "/projects/clouddoctor.webp",
      alt: "CloudDoctor CLI reporting a missing METRICS_PORT environment variable with file and line evidence.",
      caption: "CloudDoctor auditing a service repository and pinpointing `.env` drift.",
    },
  },
  nimbus: {
    slug: "nimbus",
    title: "Nimbus",
    kind: "Distributed in-memory data store",
    year: "2026",
    status: "Runnable locally · 38-test suite",
    description:
      "A dependency-free Java in-memory key-value store speaking the Redis wire protocol (RESP) over TCP, with append-only crash recovery and leader–follower replication.",
    problem:
      "In-memory caches deliver microsecond reads but lose volatile state when a process crashes. Nimbus explores how to build a non-blocking TCP server from scratch while guaranteeing durable write recovery and replica synchronization.",
    startedAt: "2026-07-25",
    solution:
      "Serve reads directly from memory over a single-threaded event loop, append every mutating command to an on-disk log with torn-write protection, and replay validated log records on startup before accepting client traffic.",
    architecture:
      "A Java NIO `Selector` multiplexes concurrent TCP connections into a single-threaded command loop implementing 32 Redis-compatible commands (`PING`, `SET`, `GET`, `EXPIRE`, `TTL`, etc.) and RESP pipelining. Durable writes append to an AOF log with crash recovery, and a leader node streams mutations to follower replicas.",
    features: [
      "32 Redis-compatible commands over raw TCP/RESP with request pipelining",
      "Append-only log (AOF) persistence with torn-write crash recovery on startup",
      "Millisecond TTL key expiry, leader–follower replication, and 38 automated tests",
    ],
    stack: ["Java", "Java NIO", "TCP", "Redis Protocol (RESP)", "AOF Persistence"],
    href: null,
    repo: SOCIALS.github + "/nimbus",
    tags: ["systems"],
    image: {
      src: "/projects/nimbus.webp",
      alt: "Nimbus terminal session responding to PING, SET, GET, EXPIRE, and TTL commands over TCP.",
      caption: "Interactive Nimbus session over the Redis wire protocol (RESP).",
    },
  },
  threadlabz: {
    slug: "threadlabz",
    title: "ThreadLabz",
    kind: "Full-stack commerce platform",
    year: "2026",
    status: "Live storefront preview",
    description:
      "An apparel and custom-design storefront engineered with a server-authoritative cart, atomic PostgreSQL stock reservations, and idempotent checkout recovery.",
    problem:
      "Client-side carts drift out of sync when inventory changes mid-checkout or when shoppers abandon a payment window, risking oversold variants or permanently locked stock.",
    startedAt: "2026-11-01",
    solution:
      "Enforce server-authoritative cart state in integer paise, reserve inventory atomically in PostgreSQL when checkout begins, snapshot order line items immutably, and automatically release expired 15-minute reservations.",
    architecture:
      "Next.js App Router and TypeScript power the storefront and server actions. Supabase PostgreSQL executes transactional RPCs (`reserve_stock`, `finalize_order_stock`, `release_expired_stock_reservations`) for guest-to-authenticated cart merges and stock leases, paired with test-mode Razorpay payment verification.",
    features: [
      "Server-authoritative guest and authenticated carts with automatic login merge",
      "Atomic 15-minute PostgreSQL stock reservations and immutable order snapshots",
      "Idempotent reservation expiry release and test-mode payment recovery",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Razorpay", "Tailwind CSS"],
    href: "https://threadlabz.vercel.app",
    repo: SOCIALS.github + "/threadlabz",
    tags: ["web", "product"],
    image: {
      src: "/projects/threadlabz.webp",
      alt: "ThreadLabz storefront hero showcasing collections, search, and navigation.",
      caption: "Public ThreadLabz storefront deployed on Vercel.",
    },
  },
  vibeconnect: {
    slug: "vibeconnect",
    title: "VibeConnect",
    kind: "Real-time video & signaling",
    year: "2026",
    status: "Live preview",
    description:
      "An anonymous, safety-focused real-time video platform with temporary session identities, transactional matchmaking, and peer-to-peer WebRTC media.",
    problem:
      "Real-time stranger chat apps require low-latency room pairing and abuse moderation without permanently storing sensitive camera or microphone streams.",
    startedAt: "2026-08-10",
    solution:
      "Use ephemeral session profiles and transactional PostgreSQL matching queues paired with Supabase Realtime signaling and direct peer-to-peer WebRTC media streams.",
    architecture:
      "Next.js App Router coordinates temporary session state, `/matching` queues, and `/chat/[room]` WebRTC peer connections. Supabase PostgreSQL and Realtime manage room signaling, presence, and moderated in-call text chat.",
    features: [
      "Temporary session identities and transactional matching queue",
      "Supabase Realtime WebRTC signaling and peer-to-peer video/audio",
      "Moderated in-call chat and trust-and-safety admin console",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "WebRTC", "Tailwind CSS"],
    href: "https://vibe-connect-delta.vercel.app",
    repo: SOCIALS.github + "/VibeConnect",
    tags: ["web", "systems", "product"],
  },
  actionlens: {
    slug: "actionlens",
    title: "ActionLens",
    kind: "Document-to-action workflow",
    year: "2026",
    status: "Live web & mobile architecture",
    description:
      "A document analysis application that extracts evidence-backed obligations via browser-local OCR and turns user-verified findings into tracked action plans.",
    problem:
      "Important deadlines and obligations buried inside PDFs or scanned notices are easy to miss, while uploading private documents to third-party AI APIs raises privacy and hallucination concerns.",
    startedAt: "2026-08-24",
    solution:
      "Run OCR and deterministic obligation extraction locally in the browser using Tesseract.js and PDF.js, require explicit user verification on every draft finding, and persist verified plans with Supabase RLS.",
    architecture:
      "Self-hosted Tesseract.js and PDF.js parse documents client-side into schema-validated draft obligations tied to page evidence. Supabase PostgreSQL with Row-Level Security and transactional RPCs stores verified action plans, deadlines, and reminders.",
    features: [
      "Browser-local OCR and deterministic obligation analyzer (no external LLM key required)",
      "Human-in-the-loop verification workflow linked to source document evidence",
      "Supabase RLS storage, transactional plan persistence, and deadline tracking",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Tesseract.js", "PDF.js"],
    href: "https://action-lens-azure.vercel.app",
    repo: SOCIALS.github + "/ActionLens",
    tags: ["web", "product"],
  },
  campusflow: {
    slug: "campusflow",
    title: "CampusFlow",
    kind: "Student portal connector",
    year: "2026",
    status: "Live preview",
    description:
      "An independent SRM student dashboard that interfaces with the official portal through isolated browser contexts and manual CAPTCHA verification.",
    problem:
      "Student portals often scatter attendance, timetable, and academic notices across legacy interfaces while requiring interactive CAPTCHA verification.",
    startedAt: "2026-09-02",
    solution:
      "Isolate portal sessions inside server-side Playwright Chromium contexts (`POST /api/srm/session` → manual CAPTCHA → `POST /api/srm/login`) without storing credentials in environment files or faking academic data.",
    architecture:
      "Next.js API routes manage ephemeral Playwright browser sessions that fetch the live CAPTCHA challenge, submit user-entered credentials over an isolated context, and surface honest portal status codes.",
    features: [
      "Isolated Playwright session handling with live CAPTCHA relay",
      "Zero credential persistence outside the active login request",
      "Responsive academic dashboard interface",
    ],
    stack: ["Next.js", "TypeScript", "Playwright", "Tailwind CSS"],
    href: "https://campusflow-psi.vercel.app",
    repo: SOCIALS.github + "/CampusFlow",
    tags: ["web", "systems"],
  },
  ragebait: {
    slug: "ragebait",
    title: "Ragebait",
    kind: "Competitive debate platform",
    year: "2026",
    status: "Live",
    description:
      "A timed debate and roast platform that scores battles with deterministic local judging, explainable verdicts, and contextual moderation.",
    problem:
      "Online debate games often rely on opaque scoring or slow external APIs that fail to explain why a participant won or lost a round.",
    startedAt: "2026-07-27",
    solution:
      "Evaluate timed transcripts locally against structured rubric criteria, return a transparent breakdown of each verdict, and track player progression on persistent leaderboards.",
    architecture:
      "Next.js and TypeScript power the real-time battle rooms, local transcript-aware judging engine, and contextual moderation pipeline, backed by PostgreSQL for match history and rankings.",
    features: [
      "Transcript-aware local judging with explainable score breakdowns",
      "Contextual moderation and multilingual battle support",
      "Persistent leaderboards and player progression",
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    href: "https://ragebait-v5.vercel.app",
    repo: SOCIALS.github + "/ragebait",
    tags: ["ai", "web", "product"],
  },
  "wedxui-fit": {
    slug: "wedxui-fit",
    title: "WEDXUI Fit",
    kind: "Explainable fitness planner",
    year: "2026",
    status: "Live",
    description:
      "A fitness and nutrition planning platform that generates deterministic workout schedules with explainable recommendation traces and TOTP account security.",
    problem:
      "Generic fitness apps output black-box routines without explaining how calorie targets, split volume, or recovery constraints were calculated.",
    startedAt: "2026-07-24",
    solution:
      "Compute workout and nutrition plans through a deterministic planning engine that attaches an explicit reasoning trace to each recommendation, secured with JWT sessions and TOTP 2FA.",
    architecture:
      "Next.js App Router with TypeScript, Prisma ORM, and PostgreSQL stores user biometrics, workout logs, and security credentials including RFC-compliant TOTP two-factor authentication.",
    features: [
      "Deterministic workout and nutrition planning with recommendation traces",
      "Longitudinal workout and progression tracking",
      "Account security with JWT authentication and TOTP 2FA",
    ],
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    href: "https://wedxui-fit.vercel.app",
    repo: SOCIALS.github + "/wedxui-fit",
    tags: ["ai", "web", "product"],
  },
};

export const FALLBACK_PROJECTS = Object.values(PROJECT_OVERRIDES);

export const PROJECT_FILTERS: { id: "all" | ProjectTag; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cloud", label: "Cloud" },
  { id: "systems", label: "Systems" },
  { id: "web", label: "Web" },
  { id: "product", label: "Product" },
  { id: "ai", label: "AI" },
];

export type JourneyEntry = {
  year: string;
  period?: string;
  category?: string;
  title: string;
  detail: string;
  repo?: string;
  archived?: boolean;
};

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatPeriod(startedAt?: string, fallbackYear?: string) {
  if (!startedAt) return fallbackYear;
  const match = /^(\d{4})-(\d{2})/.exec(startedAt);
  if (!match) return fallbackYear ?? startedAt.slice(0, 4);
  const monthIdx = Number(match[2]) - 1;
  const month = MONTH_NAMES[monthIdx];
  return month ? `${month} ${match[1]}` : match[1];
}

export function buildJourney(projects: Project[]): JourneyEntry[] {
  const milestones = [...projects].sort((a, b) =>
    (a.startedAt ?? a.year).localeCompare(b.startedAt ?? b.year),
  );
  return [
    {
      year: "2025",
      period: "2025 — Present",
      category: "Education",
      title: "Began B.Tech in CSE (Cloud Computing) at SRM IST",
      detail: `${SITE.education} with a specialization in ${SITE.specialization} at ${SITE.university}, Chennai. Coursework and independent lab work in operating systems, computer networks, data structures, and cloud infrastructure.`,
    },
    ...milestones.map((project) => ({
      year: project.year,
      period: formatPeriod(project.startedAt, project.year),
      category: project.kind,
      title: project.title,
      detail: [project.description, project.architecture]
        .filter(Boolean)
        .join(" "),
      repo: project.repo ?? undefined,
      archived: !FEATURED_SLUGS.some((slug) => slug === project.slug),
    })),
    {
      year: String(SITE.graduation),
      period: "Expected 2029",
      category: "Milestone",
      title: "Expected B.Tech Graduation · Cloud, SRE & Platform Engineering",
      detail:
        "Completing B.Tech in Computer Science and Engineering (Cloud Computing) at SRM Institute of Science and Technology, focused on Cloud Engineering, Site Reliability Engineering (SRE), and Platform Engineering roles.",
    },
  ].sort((a, b) => Number(a.year) - Number(b.year));
}

export const TOPOLOGY_NODES = [
  {
    id: "code",
    step: "01",
    label: "Scalable Applications",
    detail: "TypeScript · Next.js · REST & WebSockets",
  },
  {
    id: "backend",
    step: "02",
    label: "Backend & Distributed Systems",
    detail: "FastAPI · Java NIO · PostgreSQL · RESP/TCP",
  },
  {
    id: "cloud",
    step: "03",
    label: "Cloud Infrastructure",
    detail: "Docker Compose · Linux · AWS · Static Checks",
  },
  {
    id: "sre",
    step: "04",
    label: "SRE & Observability",
    detail: "Prometheus · OpenTelemetry · Incident Recovery",
  },
] as const;
