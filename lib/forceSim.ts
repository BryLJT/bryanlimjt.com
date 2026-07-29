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
