"use client"

import { useRef, useEffect, useCallback, useMemo, useState } from "react"
import { buildGraphData, GraphNode, GraphLink } from "@/data/graph"
import { createForceSim, ForceSim, SimBody } from "@/lib/forceSim"
import GraphTuningPanel from "./GraphTuningPanel"
import { projects, Project } from "@/data/projects"
import { certifications, Certification } from "@/data/certifications"

type Props = {
  onSelect?: (project: Project | null) => void
  selected?: Project | null
  onSelectCert?: (cert: Certification | null) => void
  selectedCert?: Certification | null
}

// ─── Types ───────────────────────────────────────────────────────────────────

type SimNode = GraphNode & SimBody

// ─── Visual helpers ───────────────────────────────────────────────────────────

function nodeRadius(type: string) {
  return type === "project" ? 9 : type === "certification" ? 7 : 4
}

function nodeColor(type: string) {
  return type === "project"
    ? "#fabc0e"
    : type === "certification"
    ? "#4ade80"
    : "rgba(130,155,180,0.5)"
}

// ─── Camera helpers ───────────────────────────────────────────────────────────

function clampCamera(cam: { x: number; y: number; zoom: number }, w: number, h: number) {
  // Keep the world centre (w/2, h/2) within a 30% margin of the canvas in every direction
  const MARGIN = 0.3
  const cx = w / 2, cy = h / 2
  const screenCx = cx * cam.zoom + cam.x
  const screenCy = cy * cam.zoom + cam.y
  cam.x = Math.max(-MARGIN * w, Math.min((1 + MARGIN) * w, screenCx)) - cx * cam.zoom
  cam.y = Math.max(-MARGIN * h, Math.min((1 + MARGIN) * h, screenCy)) - cy * cam.zoom
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGraph({ onSelect, selected: selectedProp = null, onSelectCert, selectedCert: selectedCertProp = null }: Props) {
  const GRAPH_DATA  = useMemo(() => buildGraphData(), [])
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const nodesRef    = useRef<SimNode[]>([])
  const linksRef    = useRef<GraphLink[]>(GRAPH_DATA.links)
  const nodeMapRef  = useRef<Map<string, SimNode>>(new Map())
  const cameraRef   = useRef({ x: 0, y: 0, zoom: 1 })
  const draggingRef   = useRef<string | null>(null)
  const panningRef    = useRef(false)
  const lastPtrRef    = useRef({ x: 0, y: 0 })
  const pointersRef   = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchDistRef  = useRef<number | null>(null)
  const hoveredRef      = useRef<string | null>(null)
  const selectedRef     = useRef<Project | null>(null)
  const selectedCertRef = useRef<Certification | null>(null)
  const animRef         = useRef(0)
  const simRef          = useRef<ForceSim<GraphNode> | null>(null)
  const [showTuning, setShowTuning] = useState(false)
  // State mirror of simRef for render-time use (reading a ref during render
  // violates react-hooks/refs); handlers and the draw loop keep using the ref
  const [sim, setSim] = useState<ForceSim<GraphNode> | null>(null)

  // Sync selected props into refs — animation loop reads refs, no restart needed
  useEffect(() => { selectedRef.current = selectedProp ?? null }, [selectedProp])
  useEffect(() => { selectedCertRef.current = selectedCertProp ?? null }, [selectedCertProp])

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
    setSim(simRef.current)
  }, [GRAPH_DATA])

  // ── Coordinate helpers ────────────────────────────────────────────────────────
  const toWorld = useCallback((sx: number, sy: number) => {
    const { x, y, zoom } = cameraRef.current
    return { x: (sx - x) / zoom, y: (sy - y) / zoom }
  }, [])

  const findNode = useCallback((wx: number, wy: number): SimNode | null => {
    const nodes = nodesRef.current
    const zoom  = cameraRef.current.zoom
    // Iterate backwards: last-drawn node is visually on top, so it wins on overlap.
    // Flipping this loop would break click priority for overlapping nodes — don't.
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      if (n.type === "tech") continue                    // tech nodes are decorative, not clickable
      const r  = nodeRadius(n.type) + 8 / zoom          // 8px screen-space hit margin, constant regardless of zoom
      const dx = wx - n.x, dy = wy - n.y
      if (dx * dx + dy * dy <= r * r) return n
    }
    return null
  }, [])

  // ── Animation loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let lastW = 0, lastH = 0

    const draw = () => {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height

      // Only reallocate GPU texture when container dimensions actually change
      if (w !== lastW || h !== lastH) {
        canvas.width  = w * dpr
        canvas.height = h * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        lastW = w; lastH = h
        const sim = simRef.current
        if (sim) { sim.config.centerX = w / 2; sim.config.centerY = h / 2 }
      }

      const nodes = nodesRef.current
      const links = linksRef.current
      const nMap  = nodeMapRef.current
      const cam   = cameraRef.current

      // ── Physics ─────────────────────────────────────────────────────────────
      // Ported d3-force sim: cools to a true standstill, wakes on drag
      simRef.current?.tick()

      // ── Draw ─────────────────────────────────────────────────────────────────

      ctx.fillStyle = "#060d14"
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.translate(cam.x, cam.y)
      ctx.scale(cam.zoom, cam.zoom)

      // Edges — style set once before loop, all edges share the same appearance
      ctx.strokeStyle = "rgba(255,255,255,0.06)"
      ctx.lineWidth   = 1
      for (const { source, target } of links) {
        const s = nMap.get(source as string), t = nMap.get(target as string)
        if (!s || !t) continue
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.stroke()
      }

      // Nodes
      const hov     = hoveredRef.current
      const sel     = selectedRef.current
      const selCert = selectedCertRef.current

      for (const node of nodes) {
        const { x, y } = node
        const r         = nodeRadius(node.type)
        const isProject = node.type === "project"
        const isCert    = node.type === "certification"
        const isHov     = node.id === hov
        const isSel     = (isProject && sel?.id === node.projectId) || (isCert && selCert?.id === node.id)
        const color     = nodeColor(node.type)

        // Glow (project + cert only)
        if (isProject || isCert) {
          const glowR  = isHov || isSel ? r * 4 : r + 10
          const gAlpha = isHov || isSel ? "0.35" : "0.18"
          const gColor = isProject
            ? `rgba(250,188,14,${gAlpha})`
            : `rgba(74,222,128,${gAlpha})`
          const grd = ctx.createRadialGradient(x, y, r, x, y, glowR)
          grd.addColorStop(0, gColor)
          grd.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(x, y, glowR, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        }

        // Circle
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        // Label
        if (isProject || isCert) {
          ctx.font         = `600 ${Math.max(8, Math.min(14, 11 / cam.zoom))}px Inter, sans-serif`
          ctx.fillStyle    = isProject ? "rgba(250,188,14,0.92)" : "rgba(74,222,128,0.88)"
          ctx.textAlign    = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, x, y + r + 4 / cam.zoom)
        } else if (cam.zoom > 1.5) {
          ctx.font         = `400 ${Math.max(8, Math.min(13, 9 / cam.zoom))}px Inter, sans-serif`
          ctx.fillStyle    = `rgba(180,200,220,${Math.min(0.55, (cam.zoom - 1.2) * 0.6)})`
          ctx.textAlign    = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, x, y + r + 3 / cam.zoom)
        }
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  // ── Pointer handlers ──────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // Second finger down — cancel drag/pan, enter pinch mode
    if (pointersRef.current.size >= 2) {
      if (draggingRef.current) {
        const n = nodeMapRef.current.get(draggingRef.current)
        if (n) { n.fx = null; n.fy = null }
        draggingRef.current = null
        simRef.current?.wake(0)
      }
      panningRef.current = false
      return
    }

    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    if (node) {
      draggingRef.current = node.id
      node.fx = node.x
      node.fy = node.y
      // Obsidian drag protocol: alpha jumps to the target immediately
      // (sim.js: alpha=.3 AND alphaTarget=.3), not a gradual climb
      simRef.current?.reheat(simRef.current.config.reheatTarget)
      simRef.current?.wake(simRef.current.config.reheatTarget)
    } else {
      panningRef.current = true
    }
    lastPtrRef.current = { x: e.clientX, y: e.clientY }
  }, [toWorld, findNode])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const ptrs = Array.from(pointersRef.current.values())

    // Pinch-to-zoom (two fingers)
    if (ptrs.length >= 2) {
      const [a, b] = ptrs
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      if (pinchDistRef.current !== null) {
        const factor = dist / pinchDistRef.current
        const midX   = (a.x + b.x) / 2 - rect.left
        const midY   = (a.y + b.y) / 2 - rect.top
        const cam    = cameraRef.current
        const newZ   = Math.max(0.3, Math.min(3, cam.zoom * factor))
        cam.x    = midX - ((midX - cam.x) / cam.zoom) * newZ
        cam.y    = midY - ((midY - cam.y) / cam.zoom) * newZ
        cam.zoom = newZ
        clampCamera(cam, rect.width, rect.height)
      }
      pinchDistRef.current = dist
      return
    }

    if (draggingRef.current) {
      const cam = cameraRef.current
      const dx  = (e.clientX - lastPtrRef.current.x) / cam.zoom
      const dy  = (e.clientY - lastPtrRef.current.y) / cam.zoom
      const n   = nodeMapRef.current.get(draggingRef.current)
      if (n && n.fx != null && n.fy != null) { n.fx += dx; n.fy += dy }
      lastPtrRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (panningRef.current) {
      const cam = cameraRef.current
      cam.x += e.clientX - lastPtrRef.current.x
      cam.y += e.clientY - lastPtrRef.current.y
      clampCamera(cam, rect.width, rect.height)
      lastPtrRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    // Hover detection
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    hoveredRef.current = node?.id ?? null
    canvasRef.current!.style.cursor = node ? "pointer" : "grab"
  }, [toWorld, findNode])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId)
    if (pointersRef.current.size < 2) pinchDistRef.current = null
    if (draggingRef.current) {
      const n = nodeMapRef.current.get(draggingRef.current)
      if (n) { n.fx = null; n.fy = null }
      draggingRef.current = null
      simRef.current?.wake(0)
    }
    panningRef.current = false
  }, [])

  const onClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    if (!node) return

    if (node.type === "project") {
      const proj = projects.find(p => p.id === node.projectId) ?? null
      if (!proj) return
      // Toggle: clicking the selected node again deselects it
      onSelect?.(selectedRef.current?.id === proj.id ? null : proj)
    } else if (node.type === "certification") {
      const cert = certifications.find(c => c.id === node.id) ?? null
      if (!cert) return
      onSelectCert?.(selectedCertRef.current?.id === cert.id ? null : cert)
    }
  }, [toWorld, findNode, onSelect, onSelectCert])

  // Wheel zoom — must be { passive: false } so preventDefault actually works.
  // React 18 registers synthetic wheel listeners as passive, which silently ignores
  // preventDefault, causing the page to scroll while zooming. Manual addEventListener bypasses this.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const cam    = cameraRef.current
      const mx     = e.clientX - rect.left, my = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.92 : 1.08
      const newZ   = Math.max(0.3, Math.min(3, cam.zoom * factor))
      cam.x    = mx - ((mx - cam.x) / cam.zoom) * newZ
      cam.y    = my - ((my - cam.y) / cam.zoom) * newZ
      cam.zoom = newZ
      clampCamera(cam, rect.width, rect.height)
    }
    canvas.addEventListener("wheel", handler, { passive: false })
    return () => canvas.removeEventListener("wheel", handler)
  }, [])

  // Dev tuning panel — press "g" on the projects page (no modifier keys)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) setShowTuning(v => !v)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div style={{ width: "100%", height: "100%", background: "#060d14", position: "relative", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "grab", display: "block", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={(e) => onPointerUp(e)}
        onClick={onClick}
      />
      {showTuning && sim && (
        <GraphTuningPanel config={sim.config} reheat={() => sim.reheat()} />
      )}
    </div>
  )
}
