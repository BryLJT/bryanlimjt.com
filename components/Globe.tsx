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

export default function Globe() {
  const router    = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef  = useRef<ReturnType<typeof createGlobe> | null>(null)
  const pointerInteracting         = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const phiRef = useRef(1.5)
  const rafRef = useRef<number>(0)

  const [positions, setPositions] = useState<MarkerPos[]>(() =>
    MARKERS_3D.map(p => project(p, 1.5, THETA))
  )

  // Responsive display size — globe shrinks to fit viewport on mobile
  const [displaySize, setDisplaySize] = useState(GLOBE_SIZE)
  useEffect(() => {
    const update = () => setDisplaySize(Math.min(GLOBE_SIZE, window.innerWidth))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width:  GLOBE_SIZE * 2,
      height: GLOBE_SIZE * 2,
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

    const animate = () => {
      if (pointerInteracting.current === null) phiRef.current += 0.003
      const phi = phiRef.current + pointerInteractionMovement.current
      globe.update({ phi })
      setPositions(MARKERS_3D.map(p => project(p, phi, THETA)))
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
    }
  }, [])

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

  const showLabels = displaySize >= 600

  return (
    <div className="relative" style={{ height: displaySize, maxWidth: "100%", overflow: "visible" }}>

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
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width:  displaySize,
          height: displaySize,
          cursor: "grab",
        }}
      />

      {/* Callout lines + labels — SVG sits exactly over the canvas */}
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
        {positions.map((pos, i) => {
          if (!pos.visible) return null
          const { x, y } = pos
          const isRight = x > GLOBE_SIZE / 2
          const sign    = isRight ? 1 : -1

          const ELBOW_ANGLE = 30 * Math.PI / 180
          const ELBOW_LEN   = 80
          const HORIZ_LEN   = 110

          const ex = x + sign * ELBOW_LEN * Math.cos(ELBOW_ANGLE)
          const ey = y - ELBOW_LEN * Math.sin(ELBOW_ANGLE)

          const hx = ex + sign * HORIZ_LEN
          const hy = ey

          return (
            <g key={i}>
              {showLabels ? (
                /* Desktop: full callout lines */
                <>
                  <polyline
                    points={`${x},${y} ${ex},${ey} ${hx},${hy}`}
                    fill="none"
                    stroke="rgba(251,191,36,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx={hx} cy={hy} r="3" fill="rgba(251,191,36,0.7)" />
                  <text
                    x={hx + sign * 8}
                    y={hy + 5}
                    fill="rgba(251,191,36,0.9)"
                    fontSize="14"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    textAnchor={isRight ? "start" : "end"}
                    style={{ pointerEvents: "auto", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={goToProjects}
                  >
                    {MARKERS[i].label}
                  </text>
                </>
              ) : (
                /* Mobile: simple text beside dot, font scaled to screen pixels */
                <text
                  x={x + sign * (18 * GLOBE_SIZE / displaySize)}
                  y={y + (5 * GLOBE_SIZE / displaySize)}
                  fill="rgba(251,191,36,0.9)"
                  fontSize={11 * GLOBE_SIZE / displaySize}
                  fontWeight="600"
                  textAnchor={isRight ? "start" : "end"}
                  style={{ pointerEvents: "auto", cursor: "pointer", fontFamily: "inherit" }}
                  onClick={goToProjects}
                >
                  {MARKERS[i].label}
                </text>
              )}

              {/* Hit target always present */}
              <circle
                cx={x} cy={y} r={18}
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
