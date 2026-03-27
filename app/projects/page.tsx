"use client"

import { useState } from "react"
import Image from "next/image"
import ProjectGraph from "@/components/ProjectGraph"
import { Project } from "@/data/projects"

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 48px 96px" }}>
      <h1 className="font-display text-3xl font-semibold text-[var(--foreground)] mb-2">
        Projects
      </h1>

      {/* ── Desktop layout (md and above) ───────────────────────────────────── */}
      <div className="hidden md:block">
        <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 32 }}>
          Click a node · Drag to move · Scroll to zoom
        </p>

        {/* Graph box */}
        <div style={{
          width: "100%",
          height: 620,
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
        }}>
          <ProjectGraph onSelect={setSelected} selected={selected} />
        </div>

        {/* Project detail */}
        {selected && (
          <div style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
              <h2 className="font-display" style={{ fontSize: 32, fontWeight: 600, color: "var(--foreground)" }}>
                {selected.name}
              </h2>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                {selected.live && (
                  <a href={selected.live} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, color: "#fabc0e", fontWeight: 600, textDecoration: "none" }}>
                    Live site ↗
                  </a>
                )}
                {selected.github && (
                  <a href={selected.github} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 14, color: "var(--foreground)", fontWeight: 500, textDecoration: "none", opacity: 0.7 }}>
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "flex-start" }}>
              <div style={{
                position: "relative", width: "100%", aspectRatio: "16/9",
                borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,0.05)",
              }}>
                <Image src={selected.image} alt={selected.name} fill sizes="(max-width: 1200px) 50vw, 600px" className="object-cover" />
              </div>
              <div>
                <p style={{ fontSize: 16, color: "var(--text-muted)", lineHeight: 1.75, marginBottom: 28 }}>
                  {selected.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selected.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 12, fontWeight: 500, padding: "5px 14px", borderRadius: 9999,
                      background: "rgba(0,0,0,0.06)", color: "var(--text-muted)", letterSpacing: "0.02em",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile layout (below md) ─────────────────────────────────────────── */}
      <div className="block md:hidden">
        {/* TODO: mobile project layout — TBD */}
      </div>
    </div>
  )
}
