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

## Globe — markers now derive from the data (added in the same session)

Originally deferred, then brought into scope by Bryan. This is the `location`-field fix
agreed on 2026-07-28.

`Globe.tsx` no longer keeps its own marker list. It maps over `projects`, taking the label
from `name` and the position from `location`. That closes all three recorded drifts at
once: the missing project, and the `"WeatherBot"`/`"AccelChat"` spellings that disagreed
with `"Weatherbot"`/`"Accelchat"` in the data.

`location` is **required**, not optional. An optional field would let a future project be
added with no marker and no complaint, which is exactly how the original drift happened.
Required means the type system forces the decision.

Placements are decorative, per Bryan's 2026-07-28 call — a pleasing spread, not a claim
about where anything runs. The five new ones deliberately fill the empty southern
hemisphere and the Europe-to-Asia gap, since the original five were all northern:

| Project | Marker | Why there |
|---|---|---|
| Nutrient Analysis | Sydney | AFCD is the Australian food database |
| Cupp | Medellin | coffee; the demo bean is Colombian |
| Statement Sender | Dubai | financial hub, fills the Europe-to-Asia gap |
| AccelLearn Invoicing | Mumbai | fills the India gap |
| Mac Mini Home Server | Cape Town | fills Africa and the southern hemisphere |

**Density was checked, not assumed.** Ten markers do not crowd the globe: the back
hemisphere is culled, so roughly half are ever on screen, and the callout labels do not
collide on either side. Verified by screenshotting both hemispheres, rotating the second
one into view by dispatching a synthetic drag.

## Featured four

`featured` is now meaningful: **Accelchat, AccelCalendar, Alfred, Cupp** are `true`, the
other six are `false`. Bryan's pick, 2026-08-04. Still read by nothing — the featured
column and node sparkle from the 2026-07-28 refresh are the intended consumers — but the
decision is recorded in the data rather than left as ten meaningless `true`s.

## Node sparkle — radar ring on featured graph nodes (built)

Implements section 4 of the 2026-07-28 design, unchanged from what was agreed there.

- `GraphNode` gains `featured?: boolean`, mirrored from `Project.featured` in `buildGraphData()`.
- `nodeRadius()` takes `(type, featured)`. Featured projects render at **12** instead of 9.
  The signature change matters: the same helper feeds both drawing and hit-testing
  (`findNode`), so a larger node cannot end up with a smaller click target.
- **Ring:** expands from the node edge outward by 22 world units over a 2600ms cycle,
  fading with an eased curve so it lingers near the node and thins toward the edge.
  Stroke is `1.5 / cam.zoom` so it stays a constant width on screen as the user zooms.
- **Phase offset per node**, derived by hashing the node id. Without it all four rings
  pulse in unison, which reads as a glitch rather than a highlight. Hashing the id keeps
  it stable across re-renders and independent of array order — no randomness, no
  dependence on iteration sequence.
- **`prefers-reduced-motion: reduce`** → larger radius and brighter glow retained, plus a
  **static** ring at a fixed radius. Read via `matchMedia` with a `change` listener, so
  toggling the OS setting takes effect without a reload.
- Cost is negligible: four extra `arc` strokes per frame in a loop that already runs.

### Verification

- Featured four ringed and larger; the other six plain. Confirmed by screenshot.
- **Animation proven by frame comparison**, not assumed: two frames a half-cycle apart
  differ under normal motion, and are **byte-identical** under patched reduced-motion.
  The normal-motion pair was kept as a control so "identical" means something.
- Reduced-motion tested by patching `window.matchMedia` and forcing a client-side
  remount, since the Playwright MCP tools cannot emulate that media feature directly.

## Cupp demo link

Added `demo?: string` to `Project`, rendered as "Demo ↗" beside Live/GitHub in both the
desktop panel and the mobile sheet. Cupp points at `https://youtu.be/5ildYIXu0D8`
(verified 200, oEmbed title "cupp launchpad demo").

Kept as its own field rather than reusing `live`: `live` renders as "Live", which would
wrongly imply the app runs at that URL. Cupp has no live URL — it is Expo Go only.

## Explicitly out of scope

- **The featured column** — the persistent right-hand card list from the 2026-07-28
  design. Bryan deferred it ("we can work on the featured column another time"). The
  `featured` flag now drives the sparkle, so the column is the only remaining consumer.

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
