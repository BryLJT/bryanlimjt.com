"use client"

import { useRef, useEffect, useCallback } from "react"
import { buildGraphData, GraphNode, GraphLink } from "@/data/graph"
import { projects, Project } from "@/data/projects"

type Props = {
  onSelect?: (project: Project | null) => void
  selected?: Project | null
}

// ─── Types ───────────────────────────────────────────────────────────────────

type SimNode = GraphNode & { x: number; y: number; vx: number; vy: number; pinned: boolean }

// ─── Physics constants ────────────────────────────────────────────────────────

const REPULSION     = 2000   // charge strength between every pair of nodes
const SPRING_LENGTH = 100    // rest length for edge springs
const SPRING_K      = 0.01   // spring stiffness
const DAMPING       = 0.85   // velocity damping per tick
const CENTER_PULL   = 0.003  // gentle gravity toward canvas center

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

// ─── Static graph data ────────────────────────────────────────────────────────

const GRAPH_DATA = buildGraphData()

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectGraph({ onSelect, selected: selectedProp = null }: Props) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const nodesRef    = useRef<SimNode[]>([])
  const linksRef    = useRef<GraphLink[]>(GRAPH_DATA.links)
  const nodeMapRef  = useRef<Map<string, SimNode>>(new Map())
  const cameraRef   = useRef({ x: 0, y: 0, zoom: 1 })
  const draggingRef = useRef<string | null>(null)
  const panningRef  = useRef(false)
  const lastPtrRef  = useRef({ x: 0, y: 0 })
  const hoveredRef  = useRef<string | null>(null)
  const selectedRef = useRef<Project | null>(null)
  const animRef     = useRef(0)

  // Sync selected prop into ref — animation loop reads ref, no restart needed
  useEffect(() => { selectedRef.current = selectedProp ?? null }, [selectedProp])

  // ── Init nodes ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const rect = canvasRef.current?.getBoundingClientRect()
    const w = rect?.width ?? 800
    const h = rect?.height ?? 600
    const n = GRAPH_DATA.nodes.length

    nodesRef.current = GRAPH_DATA.nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / n
      const r     = 150 + Math.random() * 80
      return {
        ...node,
        x:      w / 2 + Math.cos(angle) * r,
        y:      h / 2 + Math.sin(angle) * r,
        vx:     0,
        vy:     0,
        pinned: false,
      }
    })

    // Build lookup map once — values are object references, so mutations are visible
    nodeMapRef.current = new Map(nodesRef.current.map(n => [n.id, n]))
  }, [])

  // ── Coordinate helpers ────────────────────────────────────────────────────────
  const toWorld = useCallback((sx: number, sy: number) => {
    const { x, y, zoom } = cameraRef.current
    return { x: (sx - x) / zoom, y: (sy - y) / zoom }
  }, [])

  const findNode = useCallback((wx: number, wy: number): SimNode | null => {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      if (n.type === "tech") continue          // tech nodes are decorative, not clickable
      const r  = nodeRadius(n.type) + 8       // generous hit area
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
      }

      const nodes = nodesRef.current
      const links = linksRef.current
      const nMap  = nodeMapRef.current
      const cam   = cameraRef.current
      const cx = w / 2, cy = h / 2

      // ── Physics ─────────────────────────────────────────────────────────────
      // Runs every frame with no alpha decay — continuous simulation (Obsidian feel)

      // Repulsion between every pair
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
          const f  = REPULSION / (dist * dist)
          const fx = f * dx / dist, fy = f * dy / dist
          if (!a.pinned) { a.vx -= fx; a.vy -= fy }
          if (!b.pinned) { b.vx += fx; b.vy += fy }
        }
      }

      // Spring attraction along edges
      for (const { source, target } of links) {
        const s = nMap.get(source as string), t = nMap.get(target as string)
        if (!s || !t) continue
        const dx = t.x - s.x, dy = t.y - s.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01
        const f  = (dist - SPRING_LENGTH) * SPRING_K
        const fx = f * dx / dist, fy = f * dy / dist
        if (!s.pinned) { s.vx += fx; s.vy += fy }
        if (!t.pinned) { t.vx -= fx; t.vy -= fy }
      }

      // Center gravity + damping + integrate
      for (const n of nodes) {
        if (n.pinned) { n.vx = 0; n.vy = 0; continue }
        n.vx += (cx - n.x) * CENTER_PULL
        n.vy += (cy - n.y) * CENTER_PULL
        n.vx *= DAMPING
        n.vy *= DAMPING
        n.x += n.vx
        n.y += n.vy
      }

      // ── Draw ─────────────────────────────────────────────────────────────────

      ctx.fillStyle = "#060d14"
      ctx.fillRect(0, 0, w, h)

      ctx.save()
      ctx.translate(cam.x, cam.y)
      ctx.scale(cam.zoom, cam.zoom)

      // Edges
      for (const { source, target } of links) {
        const s = nMap.get(source as string), t = nMap.get(target as string)
        if (!s || !t) continue
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(t.x, t.y)
        ctx.strokeStyle = "rgba(255,255,255,0.06)"
        ctx.lineWidth   = 1
        ctx.stroke()
      }

      // Nodes
      const hov = hoveredRef.current
      const sel = selectedRef.current

      for (const node of nodes) {
        const { x, y } = node
        const r         = nodeRadius(node.type)
        const isProject = node.type === "project"
        const isCert    = node.type === "certification"
        const isHov     = node.id === hov
        const isSel     = isProject && sel?.id === node.projectId
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
          ctx.font         = `600 ${11 / cam.zoom}px Inter, sans-serif`
          ctx.fillStyle    = isProject ? "rgba(250,188,14,0.92)" : "rgba(74,222,128,0.88)"
          ctx.textAlign    = "center"
          ctx.textBaseline = "top"
          ctx.fillText(node.label, x, y + r + 4 / cam.zoom)
        } else if (cam.zoom > 1.5) {
          ctx.font         = `400 ${9 / cam.zoom}px Inter, sans-serif`
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
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    if (node) {
      draggingRef.current = node.id
      node.pinned = true
    } else {
      panningRef.current = true
    }
    lastPtrRef.current = { x: e.clientX, y: e.clientY }
  }, [toWorld, findNode])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    if (draggingRef.current) {
      const cam = cameraRef.current
      const dx  = (e.clientX - lastPtrRef.current.x) / cam.zoom
      const dy  = (e.clientY - lastPtrRef.current.y) / cam.zoom
      const n   = nodeMapRef.current.get(draggingRef.current)
      if (n) { n.x += dx; n.y += dy }
      lastPtrRef.current = { x: e.clientX, y: e.clientY }
      return
    }

    if (panningRef.current) {
      cameraRef.current.x += e.clientX - lastPtrRef.current.x
      cameraRef.current.y += e.clientY - lastPtrRef.current.y
      lastPtrRef.current   = { x: e.clientX, y: e.clientY }
      return
    }

    // Hover detection
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top)
    const node  = findNode(world.x, world.y)
    hoveredRef.current = node?.id ?? null
    canvasRef.current!.style.cursor = node ? "pointer" : "grab"
  }, [toWorld, findNode])

  const onPointerUp = useCallback(() => {
    if (draggingRef.current) {
      const n = nodeMapRef.current.get(draggingRef.current)
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
    const proj  = projects.find(p => p.id === node.projectId) ?? null
    if (!proj) return
    // Toggle: clicking the selected node again deselects it
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
    // Zoom toward cursor position
    cam.x    = mx - ((mx - cam.x) / cam.zoom) * newZ
    cam.y    = my - ((my - cam.y) / cam.zoom) * newZ
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
