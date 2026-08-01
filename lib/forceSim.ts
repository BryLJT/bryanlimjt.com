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
  collideRadius: number    // collision body radius per node
  collideStrength: number  // collision correction strength 0..1
  centerX: number
  centerY: number
}

// Defaults extracted from Obsidian 1.12.7's own graph worker (sim.js in
// obsidian-1.12.7.asar): alpha lifecycle, velocityDecay, center 0.1,
// linkStrength = slider × degree-default, drag = fx/fy + alpha jump 0.3.
// Obsidian's spatial trio is linkDistance 250 / collideRadius 60 /
// repel -1000 with repel distanceMin 30 and NO distanceMax; this graph
// runs the same world at 0.4× (linkDistance 100), so lengths scale by
// s = 0.4 and the repel constant by s² — trajectories stay geometrically
// identical: repel -160, distanceMin 12, collideRadius 24.
// 2026-08-01: repel bumped -160 → -224 (Obsidian-equivalent -1400) for
// label readability on mobile — nodes sat too close to read labels.
export const DEFAULT_CONFIG: Omit<SimConfig, "centerX" | "centerY"> = {
  alphaDecay:       1 - Math.pow(0.001, 1 / 300),  // Obsidian sim.js:243 (= d3 default)
  alphaMin:         0.001,
  velocityDecay:    0.4,     // Obsidian integrates vx *= .6
  reheatTarget:     0.3,     // Obsidian drag: alpha = alphaTarget = 0.3
  repelStrength:    -224,    // Obsidian -1400 × s² (default -1000; +40% for label spacing)
  repelDistanceMin: 12,      // Obsidian 30 × s
  repelDistanceMax: 2000,    // Obsidian has none (∞); 2000 ≫ world size ≈ none, tunable
  linkDistance:     100,     // Obsidian 250 × s — current graph density
  linkStrengthMult: 1,       // Obsidian default link slider = 1
  centerStrength:   0.1,     // Obsidian default center force
  collideRadius:    24,      // Obsidian 60 × s
  collideStrength:  0.5,     // Obsidian collide strength (dimensionless)
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
  let alpha       = 1
  let alphaTarget = 0

  const asleep = () => alpha < cfg.alphaMin && alphaTarget < cfg.alphaMin

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

  // x.js / y.js — gentle positional pull toward the center, alpha-scaled
  function centering() {
    for (const n of nodes) {
      n.vx += (cfg.centerX - n.x) * cfg.centerStrength * alpha
      n.vy += (cfg.centerY - n.y) * cfg.centerStrength * alpha
    }
  }

  // forceCollide, ported from Obsidian's sim.js fallback (= d3 collide.js,
  // 1 iteration, uniform radius): pushes apart nodes whose PROJECTED
  // positions (x+vx) overlap combined radii. Deliberately not alpha-scaled,
  // matching the source — collisions resolve even as the sim cools.
  function collide() {
    const sum = cfg.collideRadius * 2
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      const ax = a.x + a.vx, ay = a.y + a.vy
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        let dx = ax - b.x - b.vx
        let dy = ay - b.y - b.vy
        let l  = dx * dx + dy * dy
        if (l < sum * sum) {
          if (dx === 0) { dx = jiggle(random); l += dx * dx }
          if (dy === 0) { dy = jiggle(random); l += dy * dy }
          l = Math.sqrt(l)
          const f = (sum - l) / l * cfg.collideStrength
          dx *= f
          dy *= f
          a.vx += dx * 0.5   // uniform radii → equal mass split
          a.vy += dy * 0.5
          b.vx -= dx * 0.5
          b.vy -= dy * 0.5
        }
      }
    }
  }

  function tick(): boolean {
    if (asleep()) return false

    // simulation.js tick(): alpha eases toward its target
    alpha += (alphaTarget - alpha) * cfg.alphaDecay

    // Force order matches Obsidian's fallback sim: [x, y, link, manyBody, collide]
    centering()
    linkForce()
    repulsion()
    collide()

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
