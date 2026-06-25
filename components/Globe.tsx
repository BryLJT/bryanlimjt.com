"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import createGlobe from "cobe"

const GLOBE_SIZE  = 900  // WebGL render size (kept large for quality)
const THETA = 0.1

const MARKERS = [
  { location: [1.3521,    103.8198] as [number, number], label: "Alfred"         },
  { location: [37.7595,  -122.4367] as [number, number], label: "bryanlimjt.com" },
  { location: [40.7128,   -74.0060] as [number, number], label: "AccelChat"      },
  { location: [51.5074,   -0.1278 ] as [number, number], label: "AccelCalendar"  },
  { location: [35.6762,   139.6503] as [number, number], label: "WeatherBot"     },
]

// cobe projects markers from radius ee(0.8) + markerElevation(0.05) = 0.85,
// not the unit sphere. Scaling here keeps SVG callouts on the marker centers.
const MARKER_ELEV = 0.85

const MARKERS_3D = MARKERS.map(({ location: [lat, lng] }) => {
  const r = lat * Math.PI / 180
  const a = lng * Math.PI / 180 - Math.PI
  const o = Math.cos(r)
  return [
    -o * Math.cos(a) * MARKER_ELEV,
     Math.sin(r)     * MARKER_ELEV,
     o * Math.sin(a) * MARKER_ELEV,
  ] as [number, number, number]
})

// Re-implements cobe's O() for a square canvas with scale=1, offset=[0,0]
function project(
  [px, py, pz]: [number, number, number],
  phi: number,
  theta: number
): { x: number; y: number; visible: boolean } {
  const cosT = Math.cos(theta), cosP = Math.cos(phi)
  const sinT = Math.sin(theta), sinP = Math.sin(phi)
  const c = cosP * px + sinP * pz
  const s = sinP * sinT * px + cosT * py - cosP * sinT * pz
  return {
    x: (c + 1) / 2 * GLOBE_SIZE,
    y: (-s + 1) / 2 * GLOBE_SIZE,
    visible: -sinP * cosT * px + sinT * py + cosP * cosT * pz >= 0,
  }
}

type MarkerPos = { x: number; y: number; visible: boolean }

// Callout elbow geometry — shared by initial render and the per-frame updater
const ELBOW_ANGLE = 30 * Math.PI / 180
const ELBOW_LEN   = 80
const HORIZ_LEN   = 110

function callout(x: number, y: number) {
  const isRight = x > GLOBE_SIZE / 2
  const sign    = isRight ? 1 : -1
  const ex = x + sign * ELBOW_LEN * Math.cos(ELBOW_ANGLE)
  const ey = y - ELBOW_LEN * Math.sin(ELBOW_ANGLE)
  const hx = ex + sign * HORIZ_LEN
  const hy = ey
  return { isRight, sign, ex, ey, hx, hy }
}

// DOM handles for one marker's SVG pieces, mutated imperatively each frame
type MarkerEls = {
  g:    SVGGElement | null
  poly: SVGPolylineElement | null
  dot:  SVGCircleElement | null
  text: SVGTextElement | null
  hit:  SVGCircleElement | null
}

export default function Globe() {
  const router       = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const globeRef     = useRef<ReturnType<typeof createGlobe> | null>(null)
  const pointerInteracting         = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const phiRef = useRef(1.5)
  const rafRef = useRef<number>(0)

  // Per-marker DOM handles. The SVG tree is rendered once by React; the
  // animation loop writes coordinates straight to these nodes, so a rotating
  // globe no longer triggers a React re-render on every frame.
  const markerEls = useRef<MarkerEls[]>(
    MARKERS.map(() => ({ g: null, poly: null, dot: null, text: null, hit: null }))
  )

  // Responsive display size — globe shrinks to fit viewport on mobile
  const [displaySize, setDisplaySize] = useState(GLOBE_SIZE)
  useEffect(() => {
    const update = () => setDisplaySize(Math.min(GLOBE_SIZE, window.innerWidth))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const showLabels = displaySize >= 600

  // Mirror resize-driven state into refs so the rAF loop reads current values
  // without re-subscribing (avoids stale closures).
  const showLabelsRef  = useRef(showLabels)
  const displaySizeRef = useRef(displaySize)
  showLabelsRef.current  = showLabels
  displaySizeRef.current = displaySize

  // Imperatively position every marker's SVG pieces for the given frame.
  const applyPositions = useCallback((positions: MarkerPos[]) => {
    const showL = showLabelsRef.current
    const ds    = displaySizeRef.current
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const el  = markerEls.current[i]
      if (!el || !el.g) continue

      if (!pos.visible) {
        el.g.style.display = "none"
        continue
      }
      el.g.style.display = ""

      const { x, y } = pos
      const { isRight, sign, ex, ey, hx, hy } = callout(x, y)

      if (showL) {
        el.poly?.setAttribute("points", `${x},${y} ${ex},${ey} ${hx},${hy}`)
        if (el.dot) {
          el.dot.setAttribute("cx", String(hx))
          el.dot.setAttribute("cy", String(hy))
        }
        if (el.text) {
          el.text.setAttribute("x", String(hx + sign * 8))
          el.text.setAttribute("y", String(hy + 5))
          el.text.setAttribute("text-anchor", isRight ? "start" : "end")
        }
      } else if (el.text) {
        el.text.setAttribute("x", String(x + sign * (18 * GLOBE_SIZE / ds)))
        el.text.setAttribute("y", String(y + (5 * GLOBE_SIZE / ds)))
        el.text.setAttribute("text-anchor", isRight ? "start" : "end")
      }

      if (el.hit) {
        el.hit.setAttribute("cx", String(x))
        el.hit.setAttribute("cy", String(y))
      }
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Size the WebGL drawing buffer to the actual on-screen size instead of a
    // fixed 3600x3600. cobe sets canvas.width = opts.width * devicePixelRatio,
    // so passing the CSS size with a 2x-capped DPR yields a sharp 1:1 buffer
    // rather than ~4x (retina) to ~16x (non-retina) fill-rate overdraw.
    const dpr     = Math.min(window.devicePixelRatio || 1, 2)
    const cssSize = Math.min(GLOBE_SIZE, window.innerWidth)

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: dpr,
      width:  cssSize,
      height: cssSize,
      phi:   1.5,
      theta: THETA,
      dark:  1,
      diffuse: 1.2,
      mapSamples:    16000,
      mapBrightness: 6,
      baseColor:   [0.3,  0.3,  0.3 ],
      markerColor: [0.98, 0.75, 0.14],
      glowColor:   [1,    1,    1   ],
      markers: MARKERS.map(m => ({ location: m.location, size: 0.07 })),
    })

    globeRef.current = globe

    // Paint one static frame immediately so the globe is never blank before
    // the animation loop starts.
    globe.update({ phi: phiRef.current })
    applyPositions(MARKERS_3D.map(p => project(p, phiRef.current, THETA)))

    let running = false
    let inView  = true

    const animate = () => {
      if (pointerInteracting.current === null) phiRef.current += 0.003
      const phi = phiRef.current + pointerInteractionMovement.current
      globe.update({ phi })
      applyPositions(MARKERS_3D.map(p => project(p, phi, THETA)))
      rafRef.current = requestAnimationFrame(animate)
    }

    // Only spend frames when the globe is actually on-screen and the tab is
    // visible — no point rotating + rendering while it's scrolled out of view.
    const start = () => { if (!running) { running = true; rafRef.current = requestAnimationFrame(animate) } }
    const stop  = () => { if (running) { running = false; cancelAnimationFrame(rafRef.current) } }
    const sync  = () => { (inView && !document.hidden) ? start() : stop() }

    const io = new IntersectionObserver(
      ([entry]) => { inView = entry.isIntersecting; sync() },
      { threshold: 0 }
    )
    if (containerRef.current) io.observe(containerRef.current)
    document.addEventListener("visibilitychange", sync)

    return () => {
      io.disconnect()
      document.removeEventListener("visibilitychange", sync)
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
    }
  }, [applyPositions])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = e.clientX;
    (e.target as HTMLElement).style.cursor = "grabbing"
  }, [])

  const handlePointerUp = useCallback(() => {
    pointerInteracting.current = null
    phiRef.current += pointerInteractionMovement.current
    pointerInteractionMovement.current = 0
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
  }, [])

  const handlePointerOut = useCallback(() => {
    pointerInteracting.current = null
    phiRef.current += pointerInteractionMovement.current
    pointerInteractionMovement.current = 0
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (pointerInteracting.current !== null) {
      pointerInteractionMovement.current = (e.clientX - pointerInteracting.current) / 200
    }
  }, [])

  const goToProjects = useCallback(() => router.push("/projects"), [router])

  // Initial coordinates (phi = 1.5) for the one-time React render. The
  // animation loop overwrites these imperatively from the first frame.
  const initial = MARKERS_3D.map(p => project(p, 1.5, THETA))

  return (
    <div ref={containerRef} className="relative" style={{ height: displaySize, maxWidth: "100%", overflow: "visible" }}>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 140, background: "linear-gradient(to bottom, #060d14, transparent)", zIndex: 10 }}
      />
      {/* Left fade */}
      <div className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{ width: "10vw", background: "linear-gradient(to right, #060d14, transparent)", zIndex: 10 }}
      />
      {/* Right fade */}
      <div className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{ width: "10vw", background: "linear-gradient(to left, #060d14, transparent)", zIndex: 10 }}
      />

      {/* Globe canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerOut}
        onPointerMove={handlePointerMove}
        onPointerCancel={handlePointerUp}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width:  displaySize,
          height: displaySize,
          cursor: "grab",
          touchAction: "none",
        }}
      />

      {/* Callout lines + labels — SVG sits exactly over the canvas.
          Rendered once; positions are updated imperatively each frame. */}
      <svg
        viewBox={`0 0 ${GLOBE_SIZE} ${GLOBE_SIZE}`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width:  displaySize,
          height: displaySize,
          overflow: "visible",
          pointerEvents: "none",
          zIndex: 15,
        }}
      >
        {MARKERS.map((m, i) => {
          const p0 = initial[i]
          const c0 = callout(p0.x, p0.y)
          return (
            <g
              key={i}
              ref={node => { markerEls.current[i].g = node }}
              style={{ display: p0.visible ? "" : "none" }}
            >
              {showLabels ? (
                /* Desktop: full callout lines */
                <>
                  <polyline
                    ref={node => { markerEls.current[i].poly = node }}
                    points={`${p0.x},${p0.y} ${c0.ex},${c0.ey} ${c0.hx},${c0.hy}`}
                    fill="none"
                    stroke="rgba(251,191,36,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    ref={node => { markerEls.current[i].dot = node }}
                    cx={c0.hx} cy={c0.hy} r="3" fill="rgba(251,191,36,0.7)"
                  />
                  <text
                    ref={node => { markerEls.current[i].text = node }}
                    x={c0.hx + c0.sign * 8}
                    y={c0.hy + 5}
                    fill="rgba(251,191,36,0.9)"
                    fontSize="14"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    textAnchor={c0.isRight ? "start" : "end"}
                    style={{ pointerEvents: "auto", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={goToProjects}
                  >
                    {m.label}
                  </text>
                </>
              ) : (
                /* Mobile: simple text beside dot, font scaled to screen pixels */
                <text
                  ref={node => { markerEls.current[i].text = node }}
                  x={p0.x + c0.sign * (18 * GLOBE_SIZE / displaySize)}
                  y={p0.y + (5 * GLOBE_SIZE / displaySize)}
                  fill="rgba(251,191,36,0.9)"
                  fontSize={11 * GLOBE_SIZE / displaySize}
                  fontWeight="600"
                  textAnchor={c0.isRight ? "start" : "end"}
                  style={{ pointerEvents: "auto", cursor: "pointer", fontFamily: "inherit" }}
                  onClick={goToProjects}
                >
                  {m.label}
                </text>
              )}

              {/* Hit target always present */}
              <circle
                ref={node => { markerEls.current[i].hit = node }}
                cx={p0.x} cy={p0.y} r={18}
                fill="transparent"
                style={{ pointerEvents: "auto", cursor: "pointer" }}
                onClick={goToProjects}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
