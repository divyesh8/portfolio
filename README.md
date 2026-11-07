<div align="center">

![Divyesh Kolli — Cloud & Full-Stack Engineering](https://divyeshkolli.fun/opengraph-image)

# Divyesh Kolli — Portfolio

Divyesh Kolli’s engineering portfolio.

**[View it live →](https://divyeshkolli.fun)**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Deployed on Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## Overview

An editorial portfolio for a Cloud Computing student at SRM. The homepage features a portrait, engineering interests, and case studies drawn from public projects.

## Features

- **Selected work** — searchable project archive, category filters, implementation details, screenshots, repository links, and available demos.
- **Live GitHub section** — repos, top languages and a contribution calendar pulled from the GitHub API at request time
- **Command palette** — `⌘K` / `Ctrl K` navigation, links and theme switching
- **Working contact form** — validated, with real email delivery and a graceful `mailto` fallback
- **Dark / light themes** — dark by default, remembered per visitor, no flash on load
- **Considered motion** — scroll reveals, magnetic buttons, spotlight cards, a custom cursor and Lenis smooth scroll
- **Fully responsive** — from a 320px phone up, with a dedicated mobile navigation
- **SEO-ready** — Open Graph, Twitter cards, JSON-LD, a generated favicon, sitemap and robots

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Motion | Framer Motion, GSAP, Lenis |
| UI | shadcn/ui, Radix, Lucide, cmdk |
| Deploy | Vercel |

## Sections

`Hero` · `Work` · `About` · `Skills` · `Journey` · `GitHub` · `Profiles` · `Resume` · `Contact`

## Running locally

```bash
git clone https://github.com/divyesh8/divyesh-.git
cd divyesh-
npm install
npm run dev
```

Then open [the local portfolio](http://localhost:3000). Run `npm run typecheck` for TypeScript and `npm run build` for a production build. Use `npm start` to serve that build.

Edit identity and links in `constants/site.ts`. Project case studies, education copy, and skills live in `constants/content.ts`. The public GitHub feed supplies the archive. Fonts, the portrait, project media, and résumé are served locally.

Optional environment variables (the site runs fine without them — see
`.env.example`): a GitHub token for the full contribution calendar, and a Resend
key for contact-form delivery.

## Project structure

```
app/          routes, metadata, sitemap, robots, OG image, API routes
components/    layout · sections · shared · ui
constants/     all copy and structured content
hooks/         scroll-spy, theme, media queries, keyboard shortcuts
lib/           GitHub client, types, utilities
```

## Connect

- **Portfolio** — [divyeshkolli.fun](https://divyeshkolli.fun)
- **GitHub** — [@divyesh8](https://github.com/divyesh8)
- **LinkedIn** — [Divyesh Kolli](https://www.linkedin.com/in/divyesh-kolli-690b0a102/)
- **X** — [@_divyesh8](https://x.com/_divyesh8)

---

<div align="center">
<sub>Designed &amp; built by Divyesh Kolli.</sub>
</div>
