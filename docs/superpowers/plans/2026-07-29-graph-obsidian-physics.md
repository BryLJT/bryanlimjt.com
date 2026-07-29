# Graph Obsidian-Physics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the projects-page graph's ad-hoc physics with a faithful port of d3-force's mechanics (alpha lifecycle, degree-biased links, capped repulsion) so the graph feels like Obsidian's, per `docs/superpowers/specs/2026-07-29-graph-obsidian-physics-design.md`.

**Architecture:** New pure module `lib/forceSim.ts` owns all physics (no React/DOM). `components/ProjectGraph.tsx` keeps its renderer, camera, and pointer handlers but delegates simulation to `sim.tick()` and signals drag via `fx`/`fy` pinning + `wake()`. A dev-only tuning panel (`components/GraphTuningPanel.tsx`, toggled by `g`) mutates `sim.config` live.

**Tech Stack:** Next.js 16 / React 19 / TypeScript 5. Physics ported from d3-force source (read from `node_modules/d3-force-3d/src/*.js`, the N-dimensional twin of d3-force — formulas identical in 2D). Tests: vitest (new devDependency).

## Global Constraints

- **NEVER `git push`.** All commits stay local; pushing is gated by a separate pending review with Bryan. This applies to every task.
- All work on branch `graph-physics` (created in Task 1 from `main`).
- No new **runtime** dependencies. vitest is devDependency-only. Do NOT install `d3-force` — the point is a hand port.
- Code style: match the repo — no semicolons, double quotes, 2-space indent, aligned inline comments where the file already does that.
- Do not modify: rendering/draw code paths, colors, labels, glow, camera/zoom logic, hover behavior, `data/*.ts`, or any page layout. Scope is physics + tuning panel only.
- Do not delete `react-force-graph-2d` etc. from package.json in this plan (separate housekeeping item).
- Port fidelity: formulas must match the d3 source quoted in each task verbatim in behavior (variable renames fine).

---

### Task 1: Core simulation — alpha lifecycle, phyllotaxis seeding, integration, centering

**Files:**
- Create: `lib/forceSim.ts`
- Test: `lib/forceSim.test.ts`
- Modify: `package.json` (add vitest devDep + `test` script)

**Interfaces:**
- Consumes: nothing (pure module).
- Produces (used by Tasks 2-5):
  - `createForceSim<T extends { id: string }>(inputNodes: T[], inputLinks: { source: string; target: string }[], config: Partial<SimConfig> & { centerX: number; centerY: number }): ForceSim<T>`
  - `ForceSim<T> = { nodes: (T & SimBody)[]; config: SimConfig; tick(): boolean; wake(target: number): void; reheat(alpha?: number): void; isAsleep(): boolean; alpha(): number }`
  - `SimBody = { x, y, vx, vy: number; fx, fy: number | null; index: number }`
  - `SimConfig` (all numeric): `alphaDecay, alphaMin, velocityDecay, reheatTarget, repelStrength, repelDistanceMin, repelDistanceMax, linkDistance, linkStrengthMult, centerStrength, centerX, centerY`
  - `DEFAULT_CONFIG: Omit<SimConfig, "centerX" | "centerY">`

- [x] **Step 1: Create branch and install test runner**

```bash
cd "/Users/bryan/Desktop/claude code/bryanlimjt.com"
git checkout -b graph-physics
npm install -D vitest
```

Then in `package.json` scripts add: `"test": "vitest run"`.

- [x] **Step 2: Write the failing tests**

Create `lib/forceSim.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { createForceSim, DEFAULT_CONFIG } from "./forceSim"

const mkNodes = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `n${i}` }))

// Run tick() until the sim reports sleep or the cap is hit; returns ticks used
const settle = (sim: { tick: () => boolean; isAsleep: () => boolean }, cap = 5000) => {
  let t = 0
  while (t < cap && !sim.isAsleep()) { sim.tick(); t++ }
  return t
}

describe("core simulation", () => {
  it("seeds nodes phyllotaxis-style around the center, all distinct", () => {
    const sim = createForceSim(mkNodes(10), [], { centerX: 400, centerY: 300 })
    const seen = new Set<string>()
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      // d3 seeding radius: initialRadius(10) * sqrt(0.5 + i) — everything well inside 40px here
      expect(Math.hypot(n.x - 400, n.y - 300)).toBeLessThan(40)
      seen.add(`${n.x},${n.y}`)
    }
    expect(seen.size).toBe(10)
  })

  it("cools from alpha=1 to a true sleep in roughly d3's 300-tick horizon", () => {
    const sim = createForceSim(mkNodes(5), [], { centerX: 0, centerY: 0 })
    const ticks = settle(sim)
    expect(sim.isAsleep()).toBe(true)
    expect(ticks).toBeGreaterThan(100)   // did not sleep instantly
    expect(ticks).toBeLessThan(600)      // d3 alphaDecay targets ~300 ticks to alphaMin
    expect(sim.tick()).toBe(false)       // asleep tick is a no-op returning false
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
    }
  })

  it("centering force pulls nodes toward the configured center", () => {
    const sim = createForceSim(mkNodes(3), [], { centerX: 100, centerY: 100 })
    const n = sim.nodes[2]
    n.x = 500; n.y = 500
    const before = Math.hypot(n.x - 100, n.y - 100)
    for (let i = 0; i < 50; i++) sim.tick()
    expect(Math.hypot(n.x - 100, n.y - 100)).toBeLessThan(before)
  })

  it("wake(target) resumes a sleeping sim and wake(0) lets it cool again", () => {
    const sim = createForceSim(mkNodes(4), [], { centerX: 0, centerY: 0 })
    settle(sim)
    expect(sim.isAsleep()).toBe(true)
    sim.wake(0.3)
    expect(sim.isAsleep()).toBe(false)
    const a0 = sim.alpha()
    sim.tick()
    expect(sim.alpha()).toBeGreaterThan(a0)   // alpha climbs toward the 0.3 target
    sim.wake(0)
    settle(sim)
    expect(sim.isAsleep()).toBe(true)
  })

  it("a pinned node (fx/fy) sits exactly at its pin with zero velocity", () => {
    const sim = createForceSim(mkNodes(4), [], { centerX: 0, centerY: 0 })
    const n = sim.nodes[0]
    n.fx = 250; n.fy = -80
    for (let i = 0; i < 20; i++) sim.tick()
    expect(n.x).toBe(250)
    expect(n.y).toBe(-80)
    expect(n.vx).toBe(0)
    expect(n.vy).toBe(0)
  })

  it("reheat() bumps alpha directly (tuning-panel pulse)", () => {
    const sim = createForceSim(mkNodes(4), [], { centerX: 0, centerY: 0 })
    settle(sim)
    sim.reheat()
    expect(sim.alpha()).toBeGreaterThanOrEqual(0.5)
    expect(sim.isAsleep()).toBe(false)
  })

  it("exposes d3 defaults", () => {
    expect(DEFAULT_CONFIG.velocityDecay).toBeCloseTo(0.4)
    expect(DEFAULT_CONFIG.alphaDecay).toBeCloseTo(1 - Math.pow(0.001, 1 / 300), 6)
    expect(DEFAULT_CONFIG.alphaMin).toBe(0.001)
  })
})
```

- [x] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: FAIL — cannot resolve `./forceSim`.

- [x] **Step 4: Implement the core module**

Create `lib/forceSim.ts`. Note for the reheat/wake asymmetry: `wake` moves the *target* (d3's `alphaTarget`, used by drag), `reheat` bumps *alpha itself* (used by the tuning panel to show a change instantly). `isAsleep` must be false right after `wake(0.3)` even though alpha is still tiny — the guard checks both alpha AND target, exactly like d3's timer-stop condition.

```ts
// Physics for the projects-page graph, hand-ported from d3-force
// (github.com/d3/d3-force; source read from node_modules/d3-force-3d/src,
// the N-D twin — 2D formulas identical): simulation.js (alpha lifecycle,
// integration, phyllotaxis seeding), x.js/y.js (centering), manyBody.js
// (repulsion), link.js (degree-biased springs). Repulsion is direct
// pairwise rather than Barnes-Hut — same formula, O(n²) is nothing at
// this node count. Pure module: no React, no canvas, no DOM.

export type SimBody = {
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
  index: number
}

export type SimConfig = {
  alphaDecay: number       // per-tick approach rate of alpha toward alphaTarget
  alphaMin: number         // below this (with target also below), the sim sleeps
  velocityDecay: number    // fraction of velocity LOST per tick (d3 public convention)
  reheatTarget: number     // alphaTarget while dragging
  repelStrength: number    // negative repels (d3 manyBody convention)
  repelDistanceMin: number // clamp: forces stop growing inside this distance
  repelDistanceMax: number // cutoff: no repulsion beyond this distance
  linkDistance: number     // spring rest length
  linkStrengthMult: number // multiplies d3's degree-based default link strength
  centerStrength: number   // forceX/forceY positional pull
  centerX: number
  centerY: number
}

export const DEFAULT_CONFIG: Omit<SimConfig, "centerX" | "centerY"> = {
  alphaDecay:       1 - Math.pow(0.001, 1 / 300),  // d3: ~300 ticks to sleep
  alphaMin:         0.001,
  velocityDecay:    0.4,
  reheatTarget:     0.3,
  repelStrength:    -30,
  repelDistanceMin: 1,
  repelDistanceMax: 350,     // d3 default is Infinity; capped per spec, tunable
  linkDistance:     100,     // d3 default is 30; kept at current graph density
  linkStrengthMult: 1,
  centerStrength:   0.05,    // d3 forceX/forceY default is 0.1; start softer
}

export type ForceSim<T> = {
  nodes: (T & SimBody)[]
  config: SimConfig
  tick: () => boolean
  wake: (target: number) => void
  reheat: (alpha?: number) => void
  isAsleep: () => boolean
  alpha: () => number
}

type LinkInput = { source: string; target: string }
type SimLink  = { s: number; t: number; bias: number; baseStrength: number }

// d3 lcg.js — deterministic random source so jiggle (and tests) are reproducible
function lcg() {
  const a = 1664525, c = 1013904223, m = 4294967296
  let s = 1
  return () => (s = (a * s + c) % m) / m
}

// d3 jiggle.js — tiny random displacement to break exact-overlap symmetry
const jiggle = (random: () => number) => (random() - 0.5) * 1e-6

export function createForceSim<T extends { id: string }>(
  inputNodes: T[],
  inputLinks: LinkInput[],
  config: Partial<SimConfig> & { centerX: number; centerY: number },
): ForceSim<T> {
  const cfg: SimConfig = { ...DEFAULT_CONFIG, ...config }
  const random = lcg()

  // simulation.js initializeNodes(): phyllotaxis (sunflower-spiral) seeding
  const initialRadius = 10
  const initialAngle  = Math.PI * (3 - Math.sqrt(5))
  const nodes = inputNodes.map((n, i) => {
    const radius = initialRadius * Math.sqrt(0.5 + i)
    const angle  = i * initialAngle
    return Object.assign(n, {
      x:  cfg.centerX + radius * Math.cos(angle),
      y:  cfg.centerY + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
      fx: null as number | null,
      fy: null as number | null,
      index: i,
    })
  })

  // link.js initialize(): resolve ids → indices, count degrees, precompute
  // per-link bias and d3's degree-based default strength (topology-fixed;
  // strength is scaled live by cfg.linkStrengthMult each tick)
  const byId  = new Map(nodes.map(n => [n.id, n]))
  const count = new Array<number>(nodes.length).fill(0)
  const resolved = inputLinks
    .filter(l => byId.has(l.source) && byId.has(l.target))
    .map(l => ({ s: byId.get(l.source)!.index, t: byId.get(l.target)!.index }))
  for (const { s, t } of resolved) { count[s]++; count[t]++ }
  const links: SimLink[] = resolved.map(({ s, t }) => ({
    s,
    t,
    bias:         count[s] / (count[s] + count[t]),
    baseStrength: 1 / Math.min(count[s], count[t]),
  }))
  void links // consumed by the link force added in a later task

  let alpha       = 1
  let alphaTarget = 0

  const asleep = () => alpha < cfg.alphaMin && alphaTarget < cfg.alphaMin

  // x.js / y.js — gentle positional pull toward the center, alpha-scaled
  function centering() {
    for (const n of nodes) {
      n.vx += (cfg.centerX - n.x) * cfg.centerStrength * alpha
      n.vy += (cfg.centerY - n.y) * cfg.centerStrength * alpha
    }
  }

  function tick(): boolean {
    if (asleep()) return false

    // simulation.js tick(): alpha eases toward its target
    alpha += (alphaTarget - alpha) * cfg.alphaDecay

    centering()

    // simulation.js integration: damp-then-move; fx/fy pin overrides forces
    const keep = 1 - cfg.velocityDecay
    for (const n of nodes) {
      if (n.fx == null) n.x += n.vx *= keep
      else { n.x = n.fx; n.vx = 0 }
      if (n.fy == null) n.y += n.vy *= keep
      else { n.y = n.fy; n.vy = 0 }
    }
    return true
  }

  return {
    nodes,
    config: cfg,
    tick,
    wake:     (target: number) => { alphaTarget = target },
    reheat:   (a = 0.5) => { alpha = Math.max(alpha, a) },
    isAsleep: asleep,
    alpha:    () => alpha,
  }
}
```

- [x] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: PASS (7 tests).

- [x] **Step 6: Commit**

```bash
git add lib/forceSim.ts lib/forceSim.test.ts package.json package-lock.json
git commit -m "feat: core force sim — d3 alpha lifecycle, phyllotaxis seeding, centering"
```

---

### Task 2: Repulsion force (manyBody port)

**Files:**
- Modify: `lib/forceSim.ts` (add `repulsion()`, call it in `tick()`)
- Test: `lib/forceSim.test.ts` (append a describe block)

**Interfaces:**
- Consumes: Task 1's module internals (`cfg`, `nodes`, `alpha`, `random`, `jiggle`).
- Produces: repulsion active inside `tick()`. No API change.

Reference source (`node_modules/d3-force-3d/src/manyBody.js`, direct-interaction branch): force on a node from another is `d * strength * alpha / l` where `d` is the component-wise offset toward the other node, `l` is the **squared** distance after (a) skipping entirely when `l >= distanceMax²`, (b) jiggling zero components, (c) clamping `l = sqrt(distanceMin² * l)` when inside `distanceMin²`. Negative strength = repel.

- [x] **Step 1: Write the failing tests**

Append to `lib/forceSim.test.ts`:

```ts
describe("repulsion (manyBody port)", () => {
  const noOther = { centerStrength: 0, linkStrengthMult: 0 }

  it("pushes two nearby nodes apart", () => {
    const sim = createForceSim(mkNodes(2), [], { centerX: 0, centerY: 0, ...noOther })
    const [a, b] = sim.nodes
    const before = Math.hypot(b.x - a.x, b.y - a.y)
    for (let i = 0; i < 50; i++) sim.tick()
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThan(before)
  })

  it("exerts nothing beyond repelDistanceMax", () => {
    const sim = createForceSim(mkNodes(2), [], { centerX: 0, centerY: 0, ...noOther })
    const [a, b] = sim.nodes
    a.x = 0; a.y = 0; b.x = 400; b.y = 0   // default repelDistanceMax is 350
    sim.tick()
    expect(a.vx).toBe(0)
    expect(a.vy).toBe(0)
    expect(b.vx).toBe(0)
    expect(b.vy).toBe(0)
  })

  it("separates exactly coincident nodes via jiggle", () => {
    const sim = createForceSim(mkNodes(2), [], { centerX: 0, centerY: 0, ...noOther })
    const [a, b] = sim.nodes
    b.x = a.x; b.y = a.y
    for (let i = 0; i < 100; i++) sim.tick()
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeGreaterThan(1)
  })

  it("survives a 5000-tick soak with coincident nodes — no NaN, no Infinity", () => {
    const sim = createForceSim(mkNodes(10), [], { centerX: 0, centerY: 0 })
    sim.nodes[1].x = sim.nodes[0].x
    sim.nodes[1].y = sim.nodes[0].y
    for (let i = 0; i < 5000; i++) {
      if (!sim.tick()) { sim.reheat(); }   // keep it hot for the full soak
    }
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      expect(Number.isFinite(n.vx)).toBe(true)
      expect(Number.isFinite(n.vy)).toBe(true)
    }
  })
})
```

- [x] **Step 2: Run tests to verify the new block fails**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: Task 1 tests PASS; "pushes two nearby nodes apart" and "separates exactly coincident nodes" FAIL (no repulsion yet). ("exerts nothing beyond repelDistanceMax" passes vacuously — that's fine; it guards the implementation once added.)

- [x] **Step 3: Implement repulsion**

In `lib/forceSim.ts`, add below `centering()`:

```ts
  // manyBody.js (direct pairwise path): F = d * strength * alpha / l,
  // l = SQUARED distance, with distanceMax cutoff, distanceMin clamp,
  // and jiggle when components are exactly zero
  function repulsion() {
    const dMin2 = cfg.repelDistanceMin * cfg.repelDistanceMin
    const dMax2 = cfg.repelDistanceMax * cfg.repelDistanceMax
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        let dx = b.x - a.x
        let dy = b.y - a.y
        let l  = dx * dx + dy * dy
        if (l >= dMax2) continue
        if (dx === 0) { dx = jiggle(random); l += dx * dx }
        if (dy === 0) { dy = jiggle(random); l += dy * dy }
        if (l < dMin2) l = Math.sqrt(dMin2 * l)
        const w = cfg.repelStrength * alpha / l
        a.vx += dx * w   // dx points a→b; negative strength drives a away from b
        a.vy += dy * w
        b.vx -= dx * w
        b.vy -= dy * w
      }
    }
  }
```

In `tick()`, insert `repulsion()` immediately BEFORE `centering()` (force order: repulsion → links → centering).

- [x] **Step 4: Run tests to verify all pass**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: PASS (11 tests).

- [x] **Step 5: Commit**

```bash
git add lib/forceSim.ts lib/forceSim.test.ts
git commit -m "feat: repulsion force ported from d3 manyBody (distanceMax cutoff, jiggle)"
```

---

### Task 3: Link force (degree-biased springs)

**Files:**
- Modify: `lib/forceSim.ts` (add `linkForce()`, call it in `tick()`, remove the `void links` placeholder)
- Test: `lib/forceSim.test.ts` (append a describe block)

**Interfaces:**
- Consumes: `links: SimLink[]` precomputed in Task 1 (bias + baseStrength).
- Produces: link force active inside `tick()`. No API change.

Reference source (`link.js` `force()`): displacement uses position PLUS velocity (`target.x + target.vx - source.x - source.vx`), falls back to jiggle when exactly zero, then `l = (l - distance) / l * alpha * strength`, applied asymmetrically: target gets `× bias`, source gets `× (1 - bias)` where `bias = count(source) / (count(source) + count(target))`.

- [x] **Step 1: Write the failing tests**

Append to `lib/forceSim.test.ts`:

```ts
describe("link force (degree-biased springs)", () => {
  // Isolate links: kill repulsion + centering; alphaDecay 0 keeps alpha at 1 forever
  const onlyLinks = { repelStrength: 0, centerStrength: 0, alphaDecay: 0 }

  it("a linked pair converges to the rest length", () => {
    const sim = createForceSim(
      mkNodes(2),
      [{ source: "n0", target: "n1" }],
      { centerX: 0, centerY: 0, ...onlyLinks },
    )
    for (let i = 0; i < 500; i++) sim.tick()
    const [a, b] = sim.nodes
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(sim.config.linkDistance, 0)
  })

  it("degree bias: the leaf swings, the hub resists", () => {
    // Star: n0 is a 3-link hub, n1..n3 are leaves
    const sim = createForceSim(
      mkNodes(4),
      [
        { source: "n0", target: "n1" },
        { source: "n0", target: "n2" },
        { source: "n0", target: "n3" },
      ],
      { centerX: 0, centerY: 0, ...onlyLinks },
    )
    const [hub, leaf, s2, s3] = sim.nodes
    // Explicit positions: stretched spoke on +x; other spokes AT rest length
    // (default linkDistance 100) so they contribute zero force — the only
    // velocities this tick come from the stretched link, making the
    // bias ratio exact: leaf gets 3×, hub gets 1× (bias = 3/(3+1))
    hub.x = 0;  hub.y = 0
    leaf.x = 300; leaf.y = 0
    s2.x = 0;  s2.y = 100
    s3.x = 0;  s3.y = -100
    sim.tick()
    // Not exactly 3×: d3's link force reads position+velocity, so spokes 2/3
    // react within the same tick to the hub's fresh velocity and damp it a
    // little. Ratio lands ~3.2 — assert the bias band, not false precision.
    const ratio = Math.hypot(leaf.vx, leaf.vy) / Math.hypot(hub.vx, hub.vy)
    expect(ratio).toBeGreaterThan(2.5)
    expect(ratio).toBeLessThan(4)
  })

  it("links to unknown ids are dropped, not fatal", () => {
    const sim = createForceSim(mkNodes(2), [{ source: "n0", target: "ghost" }], { centerX: 0, centerY: 0 })
    expect(() => { for (let i = 0; i < 50; i++) sim.tick() }).not.toThrow()
  })
})
```

- [x] **Step 2: Run tests to verify the new block fails**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: first two new tests FAIL (nodes never approach rest length; no velocities from links). "unknown ids" passes already (filtering exists from Task 1) — it pins that behavior.

- [x] **Step 3: Implement the link force**

In `lib/forceSim.ts`: delete the line `void links // consumed by the link force added in a later task`, and add below `repulsion()`:

```ts
  // link.js force(): spring on position+velocity, corrected asymmetrically
  // by degree bias so hubs resist and leaves swing
  function linkForce() {
    for (const link of links) {
      const s = nodes[link.s], t = nodes[link.t]
      let x = t.x + t.vx - s.x - s.vx || jiggle(random)
      let y = t.y + t.vy - s.y - s.vy || jiggle(random)
      let l = Math.sqrt(x * x + y * y)
      l = (l - cfg.linkDistance) / l * alpha * link.baseStrength * cfg.linkStrengthMult
      x *= l
      y *= l
      t.vx -= x * link.bias
      t.vy -= y * link.bias
      s.vx += x * (1 - link.bias)
      s.vy += y * (1 - link.bias)
    }
  }
```

In `tick()`, insert `linkForce()` between `repulsion()` and `centering()`.

- [x] **Step 4: Run tests to verify all pass**

Run: `npx vitest run lib/forceSim.test.ts`
Expected: PASS (14 tests).

- [x] **Step 5: Commit**

```bash
git add lib/forceSim.ts lib/forceSim.test.ts
git commit -m "feat: degree-biased link force ported from d3 forceLink"
```

---

### Task 4: Wire the sim into ProjectGraph.tsx (replace inline physics)

**Files:**
- Modify: `components/ProjectGraph.tsx`
- Test: `lib/forceSim.test.ts` (append one whole-graph integration test)

**Interfaces:**
- Consumes: `createForceSim`, `ForceSim`, `SimBody` from `lib/forceSim.ts`; `buildGraphData`, `GraphNode` from `data/graph.ts`.
- Produces: `ProjectGraph` renders/behaves as before, driven by the new sim. Node objects in the component are now `GraphNode & SimBody` (field `pinned` no longer exists; pinning is `fx`/`fy`).

- [x] **Step 1: Write the failing integration test**

Append to `lib/forceSim.test.ts`:

```ts
import { buildGraphData } from "../data/graph"

describe("whole-site graph integration", () => {
  it("the real graph settles to sleep, spread out and finite", () => {
    const { nodes, links } = buildGraphData()
    const sim = createForceSim(nodes.map(n => ({ ...n })), links, { centerX: 400, centerY: 300 })
    let ticks = 0
    while (ticks < 5000 && !sim.isAsleep()) { sim.tick(); ticks++ }
    expect(sim.isAsleep()).toBe(true)
    let minX = Infinity, maxX = -Infinity
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x)
    }
    expect(maxX - minX).toBeGreaterThan(100)   // layout actually expanded from the seed spiral
  })
})
```

Run: `npx vitest run lib/forceSim.test.ts` — this should PASS already (it exercises Tasks 1-3 together; it exists to catch regressions during the rewiring below and to prove the real topology settles). If it fails, STOP and fix the sim before touching the component.

- [x] **Step 2: Rewire the component**

All edits in `components/ProjectGraph.tsx`:

**(a) Imports** — replace the `buildGraphData` import line and add the sim import:

```ts
import { buildGraphData, GraphNode, GraphLink } from "@/data/graph"
import { createForceSim, ForceSim, SimBody } from "@/lib/forceSim"
```

(`GraphLink` stays — the draw loop still iterates `linksRef` for edge drawing.)

**(b) Types** — replace the `SimNode` type definition:

```ts
type SimNode = GraphNode & SimBody
```

**(c) Delete the physics constants block** (`REPULSION`, `SPRING_LENGTH`, `SPRING_K`, `DAMPING`, `CENTER_PULL` — the five `const` lines under `// ─── Physics constants ───…` and the header comment itself).

**(d) Add a sim ref** next to the other refs:

```ts
  const simRef = useRef<ForceSim<GraphNode> | null>(null)
```

**(e) Replace the entire "Init nodes" `useEffect`** with:

```ts
  // ── Init simulation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 800
    const h = rect?.height ?? 600

    // Clone: the sim mutates node objects; GRAPH_DATA stays pristine across
    // strict-mode double-mounts
    simRef.current = createForceSim(
      GRAPH_DATA.nodes.map(n => ({ ...n })),
      GRAPH_DATA.links,
      { centerX: w / 2, centerY: h / 2 },
    )
    nodesRef.current = simRef.current.nodes

    // Build lookup map once — values are object references, so mutations are visible
    nodeMapRef.current = new Map(nodesRef.current.map(n => [n.id, n]))
  }, [GRAPH_DATA])
```

**(f) In the draw loop**, inside the `if (w !== lastW || h !== lastH)` resize branch, add re-centering after `lastW = w; lastH = h`:

```ts
        const sim = simRef.current
        if (sim) { sim.config.centerX = w / 2; sim.config.centerY = h / 2 }
```

**(g) Replace the whole inline physics section** (everything from the comment `// ── Physics ─────…` through the end of the `// Center gravity + damping + integrate` loop, i.e. the repulsion pair loop, the spring loop, and the integrate loop) with:

```ts
      // ── Physics ─────────────────────────────────────────────────────────────
      // Ported d3-force sim: cools to a true standstill, wakes on drag
      simRef.current?.tick()
```

Also delete the now-unused `const cx = w / 2, cy = h / 2` line above it if nothing else references `cx`/`cy` (check first — as of `a8b630f` nothing else does).

**(h) Drag = d3-style fx/fy pinning + reheat.** In `onPointerDown`, replace

```ts
    if (node) {
      draggingRef.current = node.id
      node.pinned = true
    } else {
```

with

```ts
    if (node) {
      draggingRef.current = node.id
      node.fx = node.x
      node.fy = node.y
      simRef.current?.wake(simRef.current.config.reheatTarget)
    } else {
```

In `onPointerMove`, replace the dragging branch's `if (n) { n.x += dx; n.y += dy }` with:

```ts
      if (n && n.fx != null && n.fy != null) { n.fx += dx; n.fy += dy }
```

In `onPointerUp`, replace

```ts
    if (draggingRef.current) {
      const n = nodeMapRef.current.get(draggingRef.current)
      if (n) n.pinned = false
      draggingRef.current = null
    }
```

with

```ts
    if (draggingRef.current) {
      const n = nodeMapRef.current.get(draggingRef.current)
      if (n) { n.fx = null; n.fy = null }
      draggingRef.current = null
      simRef.current?.wake(0)
    }
```

And in `onPointerDown`'s two-finger branch, replace `if (n) n.pinned = false` with `if (n) { n.fx = null; n.fy = null }` and add `simRef.current?.wake(0)` after `draggingRef.current = null`.

**(i) Sweep for leftovers:** `grep -n "pinned\|REPULSION\|SPRING_\|DAMPING\|CENTER_PULL" components/ProjectGraph.tsx` must return nothing.

- [x] **Step 3: Type-check, lint, test, build**

```bash
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```

Expected: all clean. (`GraphNode` allows optional `x?`/`y?` — the intersection with `SimBody`'s required `x`/`y` narrows to required, so draw-loop property access stays type-safe.)

- [x] **Step 4: Manual smoke check**

Run: `npm run dev`, open `http://localhost:3000/projects`. Verify, in order:
1. Load: nodes bloom outward from a small spiral and glide to a complete standstill within a few seconds.
2. At rest: zero movement. No micro-drift (watch a label edge against a fixed screen point for ~5s).
3. Drag a hub (e.g. a project node): neighbours swim along, distant nodes stir slightly; release → everything exhales back to stillness.
4. Drag a leaf tech node: it moves freely; the hub barely budges.
5. Click a project node: master-detail panel still opens; click again: deselects. Hover: cursor + glow unchanged.
6. Zoom (wheel) and pan: unchanged; page does not scroll while zooming over the canvas.
7. In browser devtools device emulation (touch): pinch-zoom works, tapping a project node opens the mobile bottom sheet, and starting a second finger mid-drag releases the dragged node (no stuck pins). Real-device check happens later in the tuning session.
Kill the dev server when done.

- [x] **Step 5: Commit**

```bash
git add components/ProjectGraph.tsx lib/forceSim.test.ts
git commit -m "feat: drive ProjectGraph with ported d3-force sim (wake/sleep drag)"
```

---

### Task 5: Tuning panel behind the `g` key

**Files:**
- Create: `components/GraphTuningPanel.tsx`
- Modify: `components/ProjectGraph.tsx` (toggle state, keydown listener, render panel)

**Interfaces:**
- Consumes: `SimConfig` from `lib/forceSim.ts`; `simRef` from Task 4.
- Produces: `GraphTuningPanel({ config, reheat }: { config: SimConfig; reheat: () => void })` — default export.

- [x] **Step 1: Create the panel component**

Create `components/GraphTuningPanel.tsx`:

```tsx
"use client"

import { useReducer } from "react"
import { SimConfig } from "@/lib/forceSim"

type TunableKey = Exclude<keyof SimConfig, "centerX" | "centerY" | "alphaMin" | "repelDistanceMin">

const SLIDERS: { key: TunableKey; label: string; min: number; max: number; step: number }[] = [
  { key: "repelStrength",    label: "Repel strength",  min: -200,  max: 0,   step: 1     },
  { key: "repelDistanceMax", label: "Repel max dist",  min: 50,    max: 1000, step: 10   },
  { key: "linkDistance",     label: "Link distance",   min: 20,    max: 300, step: 5     },
  { key: "linkStrengthMult", label: "Link strength ×", min: 0,     max: 3,   step: 0.05  },
  { key: "centerStrength",   label: "Center force",    min: 0,     max: 0.3, step: 0.005 },
  { key: "velocityDecay",    label: "Velocity decay",  min: 0,     max: 0.9, step: 0.01  },
  { key: "alphaDecay",       label: "Alpha decay",     min: 0.001, max: 0.1, step: 0.001 },
  { key: "reheatTarget",     label: "Drag reheat",     min: 0,     max: 1,   step: 0.05  },
]

type Props = {
  config: SimConfig   // the sim's live config object — sliders mutate it in place
  reheat: () => void  // pulse the sim so a change is visible while it sleeps
}

export default function GraphTuningPanel({ config, reheat }: Props) {
  const [, rerender] = useReducer((n: number) => n + 1, 0)

  return (
    <div
      style={{
        position: "absolute", top: 12, right: 12, zIndex: 10, width: 230,
        background: "rgba(6,13,20,0.92)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8, padding: "12px 14px", fontSize: 11, lineHeight: 1.3,
        color: "rgba(255,255,255,0.85)", fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Physics tuning — press g to hide</div>
      {SLIDERS.map(s => (
        <label key={s.key} style={{ display: "block", marginBottom: 6 }}>
          {s.label}: {Number(config[s.key].toPrecision(3))}
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={config[s.key]}
            onChange={e => {
              config[s.key] = Number(e.target.value)
              reheat()
              rerender()
            }}
            style={{ width: "100%", display: "block" }}
          />
        </label>
      ))}
    </div>
  )
}
```

- [x] **Step 2: Wire the toggle into ProjectGraph**

In `components/ProjectGraph.tsx`:

**(a)** Extend the react import: `import { useRef, useEffect, useCallback, useMemo, useState } from "react"`, and add `import GraphTuningPanel from "./GraphTuningPanel"`.

**(b)** Add state next to the refs: `const [showTuning, setShowTuning] = useState(false)`.

**(c)** Add a keydown effect (next to the wheel-listener effect):

```ts
  // Dev tuning panel — press "g" on the projects page (no modifier keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) setShowTuning(v => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
```

**(d)** Render the panel inside the wrapper `<div>` after the `<canvas>`:

```tsx
      {showTuning && simRef.current && (
        <GraphTuningPanel config={simRef.current.config} reheat={() => simRef.current?.reheat()} />
      )}
```

- [x] **Step 3: Type-check, lint, test, build**

```bash
npx tsc --noEmit
npm run lint
npx vitest run
npm run build
```

Expected: all clean.

- [x] **Step 4: Manual smoke check**

`npm run dev` → `http://localhost:3000/projects`:
1. Press `g`: panel appears top-right over the graph. Press `g` again: hides.
2. Drag "Repel strength" to -200: the graph visibly spreads without needing a drag first (the reheat pulse).
3. Drag "Velocity decay" to 0.9: motion becomes treacle-slow. Back to 0.4: normal.
4. Panel does not intercept graph drags outside its box; typing `g` toggles even after clicking the canvas.
Kill the dev server.

- [x] **Step 5: Commit**

```bash
git add components/GraphTuningPanel.tsx components/ProjectGraph.tsx
git commit -m "feat: dev-only physics tuning panel behind g key"
```

---

## After the plan (not agent tasks)

1. **Tuning session (Bryan + Alfred, interactive):** site and Obsidian vault side by side; tune sliders until drag ripple / release exhale / weight match; hard-code the winning values into `DEFAULT_CONFIG`; commit.
2. Judge against the spec's five behaviours. If short of "much much closer" → execute pre-agreed Option A (swap `lib/forceSim.ts` internals for the real `d3-force` package; component API unchanged).
3. Merge `graph-physics` → `main` locally. Pushing waits for Bryan's pending repo walkthrough.

---

## Execution notes (2026-07-29, all 5 tasks complete)

Two deviations from the plan as written, both fixes to the PLAN, not the port:

1. **Task 3 degree-bias test precision.** The plan asserted an exact 3:1 leaf:hub velocity ratio. Real d3 semantics make that impossible: the link force reads position+velocity, so rest-length spokes react within the same tick to the hub's fresh velocity (measured ratio ≈ 3.2). Assertion widened to a 2.5–4 band. Implementation untouched — it matches the d3 source verbatim.
2. **Task 5 panel wiring.** The plan rendered `simRef.current` during render, which the repo's react-hooks/refs lint rule correctly rejects. Fixed with a state mirror: `setSim(simRef.current)` once in the init effect; render reads the state, handlers/draw loop keep the ref.

Verification at completion: `npx vitest run` 15/15 passing · `npx tsc --noEmit` clean · `npm run build` clean · touched files eslint-clean (4 pre-existing lint errors elsewhere on main — `app/projects/page.tsx`, `Globe.tsx` ×2, `PageTransitionWrapper.tsx` — untouched by this branch, left for housekeeping). Playwright smoke: standstill-at-rest, swim-during-drag, exhale-after-release, refreeze, detail-panel-click, panel g-toggle + live slider reheat — all pass.

Remaining (requires Bryan): side-by-side tuning against his Obsidian vault; then hard-code winning values into `DEFAULT_CONFIG`; merge to main locally. NO PUSH.
