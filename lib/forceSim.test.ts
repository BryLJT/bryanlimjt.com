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
      if (!sim.tick()) { sim.reheat() }   // keep it hot for the full soak
    }
    for (const n of sim.nodes) {
      expect(Number.isFinite(n.x)).toBe(true)
      expect(Number.isFinite(n.y)).toBe(true)
      expect(Number.isFinite(n.vx)).toBe(true)
      expect(Number.isFinite(n.vy)).toBe(true)
    }
  })
})

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
