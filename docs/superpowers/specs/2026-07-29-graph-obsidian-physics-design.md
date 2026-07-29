# Graph Physics: Obsidian-Feel Rebuild (Option B)

**Date:** 2026-07-29
**Status:** Approved by Bryan (design discussion, 2026-07-29 session)
**Scope:** `ProjectGraph.tsx` physics only. Rendering, hover visuals, camera, selection, mobile bottom sheet, and the 2026-07-28 refresh design are all untouched.

## Problem

The projects-page graph uses a hand-written continuous simulation (no cooling, constant energy). Compared to Obsidian's graph view, three things feel wrong, confirmed by Bryan:

1. **Drag response** — neighbours don't swim along organically; every edge tugs with equal authority.
2. **Settle behaviour** — the sim never truly comes to rest, and touching it doesn't feel like "waking" anything.
3. **Motion character** — movement is too light; Obsidian has a heavy, damped, syrupy glide.

Obsidian's observable behaviour (and its settings panel: Repel force, Link force, Center force, Link distance) maps onto the **d3-force** model. Obsidian is closed-source, so d3-force is the reference implementation and Bryan's own vault graph is the acceptance benchmark.

## Decision

**Option B:** keep the hand-written engine (the "custom physics engine" portfolio claim stays true) but port d3-force's mechanics into it **faithfully from d3-force's published source** (github.com/d3/d3-force) — no from-memory approximations.

**Fallback (pre-agreed):** if Bryan judges the result short of Obsidian quality after tuning, swap the engine internals for the actual `d3-force` npm package (Option A). The architecture below makes that a one-file change.

History note: `react-force-graph-2d` (a wrapper around d3-force) was tried in March 2026 and abandoned before any commit due to a stale-internal-state drag bug in the *wrapper's rendering layer*. That failure does not implicate d3-force itself.

## Architecture

### New file: `lib/forceSim.ts`

Pure TypeScript simulation module. No React, no canvas, no DOM. Interface (indicative, not final):

```ts
createForceSim(nodes, links, config) → {
  tick(): void            // advance one step; no-op while asleep
  wake(target?: number)   // set alphaTarget (e.g. 0.3 on drag start, 0 on release)
  isAsleep(): boolean
  nodes: SimNode[]        // positions/velocities mutated in place
  config: SimConfig       // live-mutable (tuning panel writes here)
}
```

`ProjectGraph.tsx` keeps its render loop, camera, and pointer handlers; its inline physics block is deleted and replaced by `sim.tick()` per frame plus `wake()` calls from drag handlers.

Why extracted: (a) the Option A fallback becomes an internals swap inside one file with the component untouched; (b) the sim is testable without a browser.

### Alpha lifecycle (ported from d3's `simulation.js`)

Alpha = simulation heat, 0..1. Every force is scaled by it.

- Page load: alpha = 1 → bloom-then-settle.
- Per tick: `alpha += (alphaTarget − alpha) × alphaDecay`. d3 defaults: `alphaDecay = 1 − 0.001^(1/300)` (≈ 0.0228), `alphaMin = 0.001`, `alphaTarget = 0`.
- Sleep: when `alpha < alphaMin` and `alphaTarget < alphaMin`, `tick()` skips all force work (true standstill, zero physics CPU). The rAF render loop keeps running for camera/hover; that is unchanged from today.
- Drag start: `wake(0.3)` — the web wakes and swims. Drag end: `wake(0)` — alpha glides down, the web "exhales" to rest.

### Forces (each ported from its d3-force source file)

| Force | Ported from | Key semantics to preserve |
|---|---|---|
| Repulsion | `manyBody.js` | Inverse-distance falloff scaled by alpha; **distanceMax cutoff** so far clusters stop shoving each other; jiggle for coincident nodes. Exact pairwise O(n²) — no Barnes-Hut quadtree needed at ~25 nodes (explicit simplification; the force formula itself is unchanged). |
| Links | `link.js` | **Degree bias:** default per-link strength `1 / min(degree(source), degree(target))` and positional bias by degree ratio, so hubs resist and leaves swing. Applied to velocities, scaled by alpha. |
| Centering | `x.js` / `y.js` | Gentle positional pull toward canvas centre, alpha-scaled (today's `CENTER_PULL` is not alpha-scaled — a cause of endless micro-drift). d3's hard-recenter `center.js` is deliberately NOT used; Obsidian's centre slider behaves like forceX/forceY. |

Integration order per tick, exactly d3's: apply forces (adding to velocity) → `v ×= (1 − velocityDecay)` with **velocityDecay = 0.4** (today: 0.15) → position += velocity. The heavier decay is the "weight."

### Drag semantics

Unchanged in spirit (already matches d3): the grabbed node is pinned to the pointer; neighbours respond purely via forces — never via injected velocity (2026-03-27 lesson, upheld). Additions: `wake(0.3)` on grab, `wake(0)` on release.

### Initial layout

Replace the ring-with-jitter placement with d3's phyllotaxis (sunflower-spiral) initial placement: `radius = 10·√(0.5+i)`, `angle = i · π(3−√5)`, centred on the canvas. With alpha starting at 1, this reproduces Obsidian's load-in bloom.

### Tuning panel (dev-only)

- Toggle: pressing `g` while on the projects page. Hidden otherwise; no visitor-facing UI; negligible bundle cost (plain DOM overlay or small absolutely-positioned React element).
- Sliders: repel strength, distanceMax, link strength multiplier, link distance, center strength, velocityDecay, alphaDecay, drag reheat target. Sliders write into `sim.config` live.
- Process: Bryan runs his Obsidian vault and the site side by side, tunes until the feel matches, and the winning numbers get hard-coded as the config defaults. The panel remains in the code behind its keypress for future retuning.

## Starting config (all tunable; d3 defaults where they exist)

| Param | Start value | Source |
|---|---|---|
| alphaDecay | 0.0228 | d3 default |
| alphaMin | 0.001 | d3 default |
| velocityDecay | 0.4 | d3 default |
| drag reheat target | 0.3 | d3 drag convention |
| repel strength | −30 | d3 default. The old REPULSION=2000 used a different formula so it does not translate; if the graph loads visibly too tight or too sparse, adjust via the panel on first run and record the value |
| repel distanceMax | ~350 | no d3 default (∞); chosen to stop cluster-shoving, tune live |
| link distance | 100 | current SPRING_LENGTH, keeps today's density |
| link strength | d3 degree-based default | `1/min(degree)` |
| center strength | 0.05 | forceX/forceY default is 0.1; start softer, tune live |

## Not in scope (explicit)

- Hover highlight of neighbours / fading others (Bryan excluded it).
- Any rendering, colour, label, glow, camera, zoom, or layout change.
- Barnes-Hut quadtree, WebGL, workers — pointless at this node count.
- The 2026-07-28 refresh features (featured column, sparkle, fixed-width graph). This physics work lands first and the refresh inherits it.

## Success criteria

Bryan's side-by-side judgment against his real Obsidian vault, on five behaviours: load bloom, drag ripple (neighbours swim, hubs resist), release exhale, true standstill at rest, overall weight/viscosity. "Much much closer to Obsidian" is the bar; if not met after tuning, execute the pre-agreed Option A swap inside `lib/forceSim.ts`.

## Testing

- **Sanity (automatable):** sim reaches sleep from alpha=1 with no interaction (settles, no perpetual drift); `wake(0.3)` raises alpha and motion resumes; no NaN positions after 10k ticks with degenerate inputs (coincident nodes, zero-degree nodes); dragged node's pin overrides forces.
- **Feel (manual):** the side-by-side above, on desktop + Bryan's phone (bottom-sheet flow must still work; drag/pinch handlers are untouched but regression-check them).
- Build/lint must pass; Vercel preview deploy before merge.

## Delivery

- Branch: `graph-physics` off current `main` (which is 1 docs-only commit ahead of origin; pushing remains paused pending Bryan's Walkthrough C — not a blocker for branching or local work).
- Implementation follows via superpowers:writing-plans → plan execution.
