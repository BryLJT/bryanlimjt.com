# bryanlimjt.com — Architecture

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js 16.2.1 (App Router) | SSG/SSR, file-based routing |
| Language | TypeScript 5 | Strict mode |
| Styling | Tailwind CSS v4 | CSS variable theme system |
| Animation | Framer Motion v12 | Page transitions + scroll animations |
| Hosting | Vercel | Auto-deploy on push to GitHub |
| Repo | github.com/BryLJT/bryanlimjt.com | |
| Live URL | bryanlimjt-5vrijv4tn-yzymz9jr5z-4862s-projects.vercel.app | Custom domain pending |

---

## Directory Structure

```
bryanlimjt.com/
├── app/                        Next.js App Router pages
│   ├── layout.tsx              Root layout — NavBar + PageTransitionWrapper + Footer
│   ├── page.tsx                Home page — Hero + featured ProjectGrid
│   ├── about/page.tsx          About page (placeholder content)
│   ├── contact/page.tsx        Contact page
│   ├── projects/page.tsx       All projects — 2-column grid
│   ├── globals.css             Base styles + active theme import
│   ├── theme-parchment.css     Default theme
│   ├── theme-golden-coast.css
│   ├── theme-midnight.css
│   ├── theme-premium.css
│   └── theme-sky.css
│
├── components/
│   ├── NavBar.tsx              "use client" — active link state via usePathname
│   ├── Footer.tsx              Server — email, LinkedIn, GitHub links
│   ├── Hero.tsx                Server — circular headshot + greeting + bio
│   ├── ProjectCard.tsx         Server — image, name, tags, hover reveal
│   ├── ProjectGrid.tsx         "use client" — framer-motion stagger grid
│   └── PageTransitionWrapper.tsx  "use client" — fade+slide transition on route change
│
├── data/
│   └── projects.ts             Project type definition + 5 project entries
│
├── public/
│   └── images/
│       └── headshot.jpeg       Profile photo (no project images yet)
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## Component Tree

```
layout.tsx (server)
├── NavBar.tsx                  "use client"
├── PageTransitionWrapper.tsx   "use client"
│   └── {children}             (one of the pages below)
│       │
│       ├── Home (app/page.tsx, server)
│       │   ├── Hero.tsx                    server
│       │   └── ProjectGrid.tsx             "use client"
│       │       └── ProjectCard.tsx (×N)    server
│       │
│       ├── Projects (app/projects/page.tsx, server)
│       │   └── ProjectCard.tsx (×N)        server (plain grid, no animation)
│       │
│       ├── About (app/about/page.tsx, server)
│       └── Contact (app/contact/page.tsx, server)
│
└── Footer.tsx                  server
```

**Server vs client rule:** Components that need browser APIs, React hooks, or framer-motion are `"use client"`. Everything else is server-rendered for performance. New interactive components (globe, graph) follow the same rule — always add as client, dynamically imported with `ssr: false`.

---

## Data Layer

`data/projects.ts` — single source of truth for project content.

```ts
type Project = {
  id: string       // used for URL hash anchoring
  name: string
  description: string
  image: string    // path under /public/images/
  tags: string[]   // tech stack labels shown on card
  github?: string
  live?: string
  featured: boolean  // true = appears on home page
}
```

5 projects currently: Accelchat, AccelCalendar, Alfred, bryanlimjt.com, Weatherbot.

---

## Theme System

Each theme is a separate CSS file defining CSS custom properties:

```css
/* example: theme-parchment.css */
:root {
  --background: #f5f0e8;
  --foreground: #2c2016;
  --text-muted: #8a7460;
  --border: #e0d5c5;
  --nav-bg: #c8b89a;
  --nav-text: #2c2016;
  --nav-muted: #6b5744;
}
```

To switch theme: change one import line in `globals.css`. No rebuild needed.

Active theme: **parchment** (default). Candidates to replace it: golden-coast, premium.

---

## Animations

| Location | Animation | Implementation |
|----------|-----------|----------------|
| Page navigation | Fade + slide up on route change | `PageTransitionWrapper` with `motion.main` keyed to pathname |
| Project cards (home) | Stagger in on load (above fold) / scroll (below fold) | `ProjectGrid` — `animate` vs `whileInView` split at index 2 |
| Project cards (hover) | Description overlay fades in | CSS `opacity-0 group-hover:opacity-100` |
| NavBar links | Highlight box appears | CSS `transition-all` |

---

## Planned Additions

### Globe (Landing Page)
- **Library:** `react-globe.gl` (Three.js-based, supports arcs natively)
- **New file:** `components/Globe.tsx` — `"use client"`, dynamic import `ssr: false`
- **Edit:** `app/page.tsx` — add `<Globe />` between `<Hero />` and projects section
- **Markers:** Singapore, AWS us-east-1 (Virginia), Vercel (San Francisco)
- **Arcs:** SG ↔ AWS, SG ↔ Vercel
- **Note:** `react-globe.gl` (~250kb gzipped) loads lazily — does not block initial paint

### Knowledge Graph (Projects Page)
- **Library:** `react-force-graph` (D3 force simulation)
- **New files:**
  - `components/ProjectGraph.tsx` — `"use client"`, dynamic import `ssr: false`
  - `data/graph.ts` — nodes (projects + tech) and edges (project → tech relationships)
- **Edit:** `app/projects/page.tsx` — add Graph / Grid toggle; extract `ProjectsView.tsx` client wrapper if toggle needs state
- **Interactions:** click node → project card slides in; hover → highlight connections; nodes sized by project complexity

### Build Order
1. Globe (faster, more visual impact)
2. Knowledge graph (more complex logic)

---

## Known Issues / KIV

| Item | Status |
|------|--------|
| Project images | No real images yet — dark blue placeholder in all cards |
| About page | Placeholder content — needs real bio |
| Domain | bryanlimjt.com not purchased yet (buy from Cloudflare, ~$12/yr) |
| Theme | Not finalised — golden-coast and premium are strongest candidates |
| Globe + parchment clash | cobe/react-globe.gl looks best dark; parchment is light — may need dark inset or theme switch for hero |
