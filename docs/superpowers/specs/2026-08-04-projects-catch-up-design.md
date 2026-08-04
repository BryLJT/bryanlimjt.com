# Projects catch-up — design

**Date:** 2026-08-04
**Status:** implemented
**Scope:** add four missing projects to the site; unblock future additions from screenshot availability.

## Problem

`data/projects.ts` held 6 projects. Four real projects built since were missing: Cupp,
the statement sender, AccelLearn Invoicing, and the Mac Mini home server.

Adding them was blocked by a structural issue rather than a content one: `image` was a
required field on the `Project` type, and no screenshot existed for any of the four. A
project could not appear on the site until someone produced an asset. This is the same
thing that kept `accelchat.jpg` missing for weeks in March 2026.

## Decisions

### Which projects

Added: **Cupp**, **Statement Sender**, **AccelLearn Invoicing**, **Mac Mini Home Server**.

Excluded: **Recce** (Bryan does not expect to use it much; hackathon did not place) and
**AccelLearn Kami Links** (internal Apps Script tool, thin as a portfolio item).

This supersedes the 2026-07-28 list of four (Recce, Cupp, Prudential, Mac Mini), which
predated the invoicing contribution.

### Client naming — the statement sender is NOT named after Prudential

The project is listed as **"Statement Sender"** with the client described as "a financial
consultant". Prudential is not named anywhere on the site.

Reasoning, and this should not be quietly reversed later:

- The client is an individual Prudential financial consultant, not Prudential the company.
- The tool automates Prudential's adviser portal, which per the project file "likely
  breaches acceptable-use; worst case = consultant's account flagged/suspended".
- The consultant's ToS/risk sign-off has **not** been done.

A public page naming the firm is a searchable pointer at the account carrying that risk,
before its owner has accepted the risk. Every credibility signal a reader cares about
(Electron, Playwright, the identity-gate safety model, 600+ clients, 50 tests) survives
the generic framing.

### Cupp timing

Non-issue as of 2026-08-03: the LaunchPad submission is in and the repo is already public.
Constraint retained: **do not claim an outcome that has not happened.** Top 20 is announced
9 Aug and the 18 Aug showcase is contingent on placing, so neither is mentioned.

### `image` becomes optional

```ts
image?: string   // was: image: string
```

New `components/ProjectImage.tsx` owns the whole visual block (outer sizing, aspect-ratio
container, and either the screenshot or a fallback). Both call sites in
`app/projects/page.tsx` — the desktop detail panel and the mobile bottom sheet — collapse
to a single element each, removing duplicated layout code.

**Fallback design.** An oversized, low-contrast wordmark of the project name over a warm
radial wash on the existing `#060d14` panel colour.

Two rejected iterations, recorded so they are not re-attempted:

1. *Name label + tag chips.* Rejected after visual check: the detail panel already renders
   the project name directly above this block and the tag row directly below it, so the
   fallback stuttered against its own context.
2. *Oversized name clipped at the panel edge.* Rejected: cropping mid-word ("Statement S")
   reads as an overflow bug rather than a print treatment. The wordmark now wraps.

The name is `aria-hidden` — it is decorative, and the real name is already an adjacent heading.

## Images

- **Cupp** — `public/images/cupp.jpg`, a frame at 63s from `~/Movies/cupp-launchpad-demo.mp4`,
  showing the scan result landing in the log form with grounding chips visible. 1600x900, 104K.
- **Statement Sender, AccelLearn Invoicing, Mac Mini** — fallback panel for now. All three are
  capturable but each needs real PII on screen (client data, student names, family photos),
  so each deserves a deliberate pass rather than a rushed capture.

## Explicitly out of scope

- **The globe.** Markers stay hardcoded in `Globe.tsx`. Drift widens from 1 missing project
  to 5. The markers are already decorative fiction, so this is cosmetic, but the structural
  fix (a `location` field on `Project` driving markers from the data file, agreed 2026-07-28)
  is a visible landing-page change and needs its own decision.
- **The 2026-07-28 refresh** — featured column, node sparkle, radar ring. Untouched.
- `featured: true` on all ten projects, matching the existing six. The flag stays dead data
  until the refresh builds a consumer for it.

## Free consequence

`buildGraphData()` derives project nodes and tech links from `projects.ts`, so the projects
page graph picks all four up with no extra work: 10 project nodes instead of 6.
`Self-Hosting`, `Docker`, `Immich` and `Networking` form a new cluster with no edges to the
existing tech nodes, which is honest — it is a different domain of work.

## Verification

- `npx tsc --noEmit` clean.
- `npm run build` succeeds, 9 static pages.
- ESLint clean on all changed files. One pre-existing error remains in `app/projects/page.tsx`
  (`set-state-in-effect`, line 28, the `isMobile` media-query effect) — untouched by this work.
- Fallback rendered and inspected in a throwaway route reproducing the detail-panel stacking
  order, then the route was deleted.
- A hydration-mismatch console error appears on this page; confirmed pre-existing and
  site-wide by reproducing it on `/about`. It originates in `PageTransitionWrapper`'s
  framer-motion `motion.main`.
