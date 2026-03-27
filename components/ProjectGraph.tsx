"use client"

import { useRef, useEffect, useCallback } from "react"
import { buildGraphData, GraphNode, GraphLink } from "@/data/graph"
import { projects, Project } from "@/data/projects"

type Props = {
  onSelect?: (project: Project | null) => void
  selected?: Project | null
}

// ─── Physics ────────────────────────────────────────────────────────────────

type PhysicsNode = GraphNode & { vx: number; vy: number; pinned: boolean }

const REPULSION     = 2800
const CENTER_PULL   = 0.006
const DAMPING       = 0.87
const MAX_SPEED     = 10

// Band spring: no force inside [EDGE_REST, EDGE_MAX], gentle push/pull outside
const EDGE_REST     = 50   // push apart if closer than this
const EDGE_MAX      = 160  // pull together if farther than this
const EDGE_SPRING   = 0.007

function tick(
  nodes: PhysicsNode[],
  links: GraphLink[],
  cx: number,
  cy: number,
  alpha: number,
) {
  // Repulsion between every pair
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j]
      let dx = a.x! - b.x!, dy = a.y! - b.y!
      let d  = Math.sqrt(dx * dx + dy * dy)
      if (d < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d = 1 }
      const f = (REPULSION * alpha) / (d * d)
      const fx = (dx / d) * f, fy = (dy / d) * f
      if (!a.pinned) { a.vx += fx; a.vy += fy }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy }
    }
  }

  // Band spring along edges: push apart if too close, pull together if too far
  const map = new Map(nodes.map(n => [n.id, n]))
  for (const { source, target } of links) {
    const s = map.get(source as string), t = map.get(target as string)
    if (!s || !t) continue
    const dx = t.x! - s.x!, dy = t.y! - s.y!
    const d  = Math.sqrt(dx * dx + dy * dy) || 1
    let f = 0
    if (d < EDGE_REST)      f = -(EDGE_REST - d) * EDGE_SPRING * alpha  // too close → repel
    else if (d > EDGE_MAX)  f =  (d - EDGE_MAX)  * EDGE_SPRING * alpha  // too far   → attract
    // dead zone [EDGE_REST, EDGE_MAX]: f stays 0
    const fx = (dx / d) * f, fy = (dy / d) * f
    if (!s.pinned) { s.vx += fx; s.vy += fy }
    if (!t.pinned) { t.vx -= fx; t.vy -= fy }
  }

  // Center gravity + integrate
  for (const n of nodes) {
    if (n.pinned) { n.vx = 0; n.vy = 0; continue }
    n.vx += (cx - n.x!) * CENTER_PULL * alpha
    n.vy += (cy - n.y!) * CENTER_PULL * alpha
    n.vx *= DAMPING
    n.vy *= DAMPING
    const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
    if (sp > MAX_SPEED) { n.vx = n.vx / sp * MAX_SPEED; n.vy = n.vy / sp * MAX_SPEED }
    n.x! += n.vx
    n.y! += n.vy
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function nodeR(type: string) {
  return type === "project" ? 8 : type === "certification" ? 7 : 4
}

function nodeColor(type: string) {
  return type === "project" ? "#fabc0e" : type === "certification" ? "#4ade80" : "rgba(130,155,180,0.5)"
}

// ─── Component ──────────────────────────────────────────────────────────────

const GRAPH_DATA = buildGraphData()

export default function ProjectGraph({ onSelect, selected: selectedProp = null }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const nodesRef     = useRef<PhysicsNode[]>([])
  const linksRef     = useRef<GraphLink[]>(GRAPH_DATA.links)
  const alphaRef     = useRef(1)
  const cameraRef    = useRef({ x: 0, y: 0, zoom: 1 })
  const draggingRef  = useRef<string | null>(null)
  const panningRef   = useRef(false)
  const lastPtrRef   = useRef({ x: 0, y: 0 })
  const hoveredRef   = useRef<string | null>(null)
  const selectedRef  = useRef<Project | null>(null)
  const animRef      = useRef(0)

  // Sync selected prop into ref so animation loop sees it without restarting
  useEffect(() => { selectedRef.current = selectedProp }, [selectedProp])

  // ── Init nodes with circular starting positions ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    const rect   = canvas?.getBoundingClientRect()
    const cx = (rect?.width  ?? 800) / 2
    const cy = (rect?.height ?? 600) / 2
    const n = GRAPH_DATA.nodes.length

    nodesRef.current = GRAPH_DATA.nodes.map((node, i) => {
      const angle  = (2 * Math.PI * i) / n
      const radius = 160 + Math.random() * 80
      return {
        ...node,
        x:      cx + Math.cos(angle) * radius,
        y:      cy + Math.sin(angle) * radius,
        vx:     0,
        vy:     0,
        pinned: false,
      }
    })
    alphaRef.current = 1
  }, [])

  // ── Coordinate helpers ───────────────────────────────────────────────────
  const toWorld = useCallback((sx: number, sy: number) => {
    const { x, y, zoom } = cameraRef.current
    return { x: (sx - x) / zoom, y: (sy - y) / zoom }
  }, [])

  const findNode = useCallback((wx: number, wy: number): PhysicsNode | null => {
    // Iterate in reverse so topmost-drawn node wins
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      if (n.type === "tech") continue          // tech nodes not interactive
      const r  = nodeR(n.type) + 8            // generous hit padding
      const dx = wx - n.x!, dy = wy - n.y!
      if (dx * dx + dy * dy <= r * r) return n
    }
    return null
  }, [])

  // ── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const nodes = nodesRef.current
      const links = linksRef.current
      const cam   = cameraRef.current
      const cx    = rect.width  / 2
      const cy    = rect.height / 2

      // Physics
      if (alphaRef.current > 0.001) {
        tick(nodes, links, cx, cy, alphaRef.current)
        alphaRef.current *= 0.992
      }

      // Clear
      ctx.fillStyle = "#060d14"
      ctx.fillRect(0, 0, rect.width, rect.height)

      ctx.save()
      ctx.translate(cam.x, cam.y)
      ctx.scale(cam.zoom, cam.zoom)

      // Edges
      const nodeMap = new Map(nodes.map(n => [n.id, n]))
      for (const { source, target } of links) {
        const s = nodeMap.get(source as string), t = nodeMap.get(target as string)
        if (!s || !t) continue
        ctx.beginPath()
        ctx.moveTo(s.x!, s.y!)
        ctx.lineTo(t.x!, t.y!)
        ctx.strokeStyle = "rgba(255,255,255,0.06)"
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Nodes
      const hov = hoveredRef.current
      const sel = selectedRef.current

      for (const node of nodes) {
        const x = node.x!, y = node.y!
        const r         = nodeR(node.type)
        const isProject = node.type === "project"
        const isCert    = node.type === "certification"
        const isHov     = node.id === hov
        const isSel     = isProject && sel?.id === node.projectId
        const color     = nodeColor(node.type)

        // Glow
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
          const px = (isProject ? 11 : 10) / cam.zoom
          ctx.font        = `600 ${px}px Inter, sans-serif`
          ctx.fillStyle   = isProject ? "rgba(250,188,14,0.92)" : "rgba(74,222,128,0.88)"
          ctx.textAlign   = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, x, y + r + 4 / cam.zoom)
        } else if (cam.zoom > 1.5) {
          const px = 9 / cam.zoom
          ctx.font        = `400 ${px}px Inter, sans-serif`
          ctx.fillStyle   = `rgba(180,200,220,${Math.min(0.55, (cam.zoom - 1.2) * 0.6)})`
          ctx.textAlign   = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, x, y + r + 3 / cam.zoom)
        }
      }

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, []) // refs only — no deps trigger restarts

  // ── Pointer handlers ─────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    if (node) {
      draggingRef.current = node.id
      node.pinned = true
      alphaRef.current = Math.max(alphaRef.current, 0.5)
    } else {
      panningRef.current = true
    }
    lastPtrRef.current = { x: e.clientX, y: e.clientY }
  }, [toWorld, findNode])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top

    if (draggingRef.current) {
      const cam = cameraRef.current
      const dx  = (e.clientX - lastPtrRef.current.x) / cam.zoom
      const dy  = (e.clientY - lastPtrRef.current.y) / cam.zoom
      const nodes = nodesRef.current
      const n = nodes.find(n => n.id === draggingRef.current)
      if (n) {
        n.x! += dx
        n.y! += dy
        // Nudge directly connected nodes so they visibly react to the drag
        for (const { source, target } of linksRef.current) {
          const neighborId =
            source === draggingRef.current ? (target as string) :
            target === draggingRef.current ? (source as string) : null
          if (!neighborId) continue
          const nb = nodes.find(m => m.id === neighborId)
          if (nb && !nb.pinned) { nb.vx += dx * 0.3; nb.vy += dy * 0.3 }
        }
        alphaRef.current = Math.max(alphaRef.current, 0.6)
      }
      lastPtrRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (panningRef.current) {
      cameraRef.current.x += e.clientX - lastPtrRef.current.x
      cameraRef.current.y += e.clientY - lastPtrRef.current.y
      lastPtrRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    // Hover
    const world = toWorld(sx, sy)
    const node  = findNode(world.x, world.y)
    hoveredRef.current = node?.id ?? null
    canvasRef.current!.style.cursor = node ? "pointer" : "grab"
  }, [toWorld, findNode])

  const onPointerUp = useCallback(() => {
    if (draggingRef.current) {
      const n = nodesRef.current.find(n => n.id === draggingRef.current)
      if (n) n.pinned = false
      draggingRef.current = null
    }
    panningRef.current = false
  }, [])

  const onClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    if (!node || node.type !== "project") return
    const proj = projects.find(p => p.id === node.projectId) ?? null
    if (!proj) return
    // Toggle: clicking the already-selected node deselects it
    onSelect?.(selectedRef.current?.id === proj.id ? null : proj)
  }, [toWorld, findNode, onSelect])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const cam    = cameraRef.current
    const mx     = e.clientX - rect.left, my = e.clientY - rect.top
    const factor = e.deltaY > 0 ? 0.92 : 1.08
    const newZ   = Math.max(0.15, Math.min(5, cam.zoom * factor))
    cam.x = mx - ((mx - cam.x) / cam.zoom) * newZ
    cam.y = my - ((my - cam.y) / cam.zoom) * newZ
    cam.zoom = newZ
  }, [])

  return (
    <div style={{ width: "100%", height: "100%", background: "#060d14", position: "relative", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", cursor: "grab", display: "block" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClick={onClick}
        onWheel={onWheel}
      />

    </div>
  )
}
