# bryanlimjt.com refresh — design

Date: 2026-07-28
Status: Design agreed. Two content decisions still open (see §8).

## 1. Context

The site's content is roughly three months stale (last change: bio copy, 13 Jul). Bryan has built
several things since that don't appear anywhere: Recce, Cupp, the Prudential statement sender, and
the Mac Mini home server. He matriculates at NUS in August and wants the site working for him.

**Audience decision: broad credibility.** No single target role yet, so the goal is that any
technical or business reader quickly sees he builds real things people use.

### What the site actually does today (verified by reading the code and loading the live site)

- **Home** = Hero (photo, bio) → Certifications carousel → "My Projects" heading → **globe** → Footer.
  **No project is shown anywhere on the home page.** The "My Projects" heading labels the globe.
- **Projects** = a full-screen physics knowledge graph. Nothing is readable until a node is clicked;
  the detail panel only appears on selection (graph animates 100% → 50% width).
- `ProjectGrid.tsx` and `ProjectCard.tsx` exist but are **imported by nothing — dead code**.
- The `featured` flag on `Project` is **dead data**: every project is `featured: true` and no page
  reads the field.
- The globe's markers are **hardcoded in `Globe.tsx`**, separate from `data/projects.ts`. They have
  already drifted: Nutrient Analysis is in the project data but missing from the globe.
- There are **6** projects, not 5 (Nutrient Analysis was not in the memory notes).

**The core problem:** a visitor who skims for 20 seconds sees a face, a bio, four badges and a
globe. They leave without learning that AccelChat is in production for a real tuition centre.
Adding four more nodes to a graph nobody clicks would not fix this.

## 2. Scope

In scope, three workstreams:
1. **Catch up the projects** — add Recce, Cupp, Prudential sender, Mac Mini server.
2. **Sharpen for recruiters** — impact-led copy; real numbers visible without interaction.
3. **Clear the known backlog** — missing live/GitHub links, hero em dash, `/photos` not in nav.

**KIV (explicitly deferred):** visual/design refresh (theme, layout overhaul, new sections).

## 3. Projects page — right column that swaps into the detail card

Bryan's design. The right-hand panel space already exists but sits empty until a click; this fills
it permanently.

- **Default state:** graph on the left at a **fixed width**; right column shows **~4 featured
  project cards**, each with name + one impact sentence. Column **scrolls** if content overflows.
- **On selecting a project** (by clicking a graph node *or* a card): the column's content is
  **replaced** by that project's detail card (image, description, tags, live/GitHub links, ✕).
- **On ✕:** the detail card is dismissed and the featured column returns.
- **The graph never resizes.** This *removes* the existing 100% → 50% width animation and its
  transition timing — less code, and no layout jump.

Why this shape: it gives two independent ways into a project (explore the graph, or scan the text),
and it converts an invisible affordance (the graph is clickable) into an obvious one.

## 4. Featured nodes — radar-ring sparkle

Featured projects are visually distinguished **in the graph, on both desktop and mobile**.

- **Treatment: radar ring** (Bryan's pick) — a ring that expands outward from the node and fades,
  repeating. Drawn in the existing canvas render loop by oscillating radius/alpha against a time
  value; the loop already runs every frame, so cost is negligible.
- Featured nodes are also drawn **slightly larger**, so the distinction survives a still screenshot
  and a `prefers-reduced-motion` visitor.
- **`prefers-reduced-motion`:** featured nodes stay larger/brighter, no animation.

This is what makes the mobile experience work without a side column: on mobile there is no room for
the column, but the sparkle still shows which projects Bryan wants read first. Mobile keeps its
existing full-screen graph + bottom sheet.

## 5. Revive the `featured` flag

One flag, two behaviours, and it resurrects dead data:
- which projects appear as cards in the right column, and
- which nodes get the radar ring + larger radius.

Currently all six projects are `featured: true`; this must be set deliberately (~4 true).

## 6. Globe — populate it, and stop the drift

- **Placement: decorative spread** (Bryan's pick). Markers are scattered across world cities for
  visual balance rather than reflecting where anything runs. Noted and accepted: the markers do not
  claim to be deployment locations, but a sharp technical reader may wonder why AccelChat sits in
  New York.
- **Structural fix:** add a `location: [lat, lng]` field to the `Project` type and drive the globe's
  markers from `data/projects.ts`, the same source that already feeds the graph. This is why
  Nutrient Analysis is missing today — two hardcoded sources of truth for one set of facts. After
  this change, adding a project once makes it appear on the globe *and* in the graph.

## 7. Files this touches

| File | Change |
|---|---|
| `data/projects.ts` | Add 4 new projects; add `location` field to `Project`; set `featured` deliberately; add missing `live`/`github` links |
| `components/Globe.tsx` | Replace hardcoded `MARKERS` with markers derived from `projects` |
| `components/ProjectGraph.tsx` | Radar-ring + larger radius for featured nodes; `prefers-reduced-motion` guard |
| `app/projects/page.tsx` | Fixed-width graph; persistent right column; swap column ↔ detail card; remove the 100%→50% resize |
| `components/Hero.tsx` | Remove the em dash from the bio |
| `components/NavBar.tsx` | Add `/photos` (it exists but isn't linked) |
| `data/graph.ts` | New project→tech links follow automatically from `tags`; verify no orphan nodes |
| `components/ProjectGrid.tsx`, `ProjectCard.tsx` | Delete — dead code, imported by nothing |

## 8. Open decisions (need Bryan)

1. **Which 4 projects are featured?** Alfred's suggestion: AccelChat, AccelCalendar, Prudential
   sender, Nutrient Analysis — all four have real users and a number attached.
2. **Cupp timing.** Competition submission is due Sun 2 Aug. Recommend writing the entry now but
   **not publishing until after submission**.
3. **Prudential naming.** "Prudential" names a real company whose consultant Bryan worked with.
   Decide: name them, or describe generically ("a financial services firm"). No client data,
   screenshots, or NRIC-adjacent detail either way.

## 9. Verification

- `npm run build` clean; `npx tsc --noEmit` clean.
- Desktop: right column visible on load with 4 cards; clicking a node swaps to the detail card;
  ✕ restores the column; graph width never changes.
- Mobile (390px): no side column; featured nodes visibly ringed; bottom sheet still opens on tap;
  no horizontal overflow.
- `prefers-reduced-motion: reduce` → featured nodes larger/brighter, no animation.
- Globe: 10 markers, all sourced from `data/projects.ts`; Nutrient Analysis now present.
- Deploy is automatic on push to `main` (Vercel). Verify live after deploy.

## 10. Also decided this session (housekeeping)

`~/Desktop/claude code/personal website/` is a dead February prototype (static HTML, **not a git
repo**, 20K, last touched 22 Feb). Nothing is mergeable — the Next.js site supersedes it entirely.
Its `project-notes.md` (the original brief: "digital name card" framing, audience, tone) has been
**preserved** to `project files archive/personal-website-original-brief-2026-02-22.md`, verified
identical. The folder itself is **left in place pending Bryan's explicit go** to delete, since
there is no version control to recover it from.
