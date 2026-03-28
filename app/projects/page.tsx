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

        {/* Master-detail: graph shrinks left, detail slides in right */}
        <div style={{ display: "flex", height: 620 }}>

          {/* Graph box — full width by default, half width when a project is selected */}
          <div style={{
            width: selected ? "50%" : "100%",
            flexShrink: 0,
            height: "100%",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.08)",
            transition: "width 0.4s ease",
          }}>
            <ProjectGraph onSelect={setSelected} selected={selected} />
          </div>

          {/* Detail panel — clips to 0 when nothing selected, expands on click */}
          <div style={{
            width: selected ? "50%" : "0%",
            flexShrink: 0,
            height: "100%",
            overflow: "hidden",
            transition: "width 0.4s ease",
          }}>
            {/* Inner scroll container with left padding for the gap */}
            <div style={{
              width: "100%",
              height: "100%",
              paddingLeft: 24,
              paddingRight: 4,
              paddingTop: 4,
              paddingBottom: 4,
              overflowY: "auto",
              boxSizing: "border-box",
              opacity: selected ? 1 : 0,
              transition: "opacity 0.25s ease 0.2s",
            }}>
              {selected && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                  {/* Title + links */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <h2 className="font-display" style={{ fontSize: 26, fontWeight: 600, color: "var(--foreground)", lineHeight: 1.2, margin: 0 }}>
                      {selected.name}
                    </h2>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexShrink: 0 }}>
                      {selected.live && (
                        <a href={selected.live} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 13, color: "#fabc0e", fontWeight: 600, textDecoration: "none" }}>
                          Live ↗
                        </a>
                      )}
                      {selected.github && (
                        <a href={selected.github} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500, textDecoration: "none", opacity: 0.6 }}>
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Image */}
                  <div style={{
                    position: "relative", width: "100%", aspectRatio: "16/9",
                    borderRadius: 10, overflow: "hidden", background: "rgba(0,0,0,0.05)",
                    flexShrink: 0,
                  }}>
                    <Image
                      src={selected.image}
                      alt={selected.name}
                      fill
                      sizes="(max-width: 1200px) 50vw, 576px"
                      className="object-cover"
                    />
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
                    {selected.description}
                  </p>

                  {/* Tags */}
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
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile layout (below md) ─────────────────────────────────────────── */}
      <div className="block md:hidden">
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
          Tap a node · Pinch to zoom
        </p>

        {/* Graph */}
        <div style={{
          width: "100%", height: "65vh",
          borderRadius: 16, overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.08)",
        }}>
          <ProjectGraph onSelect={setSelected} selected={selected} />
        </div>

        {/* Backdrop */}
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 49 }}
          />
        )}

        {/* Bottom sheet */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          background: "var(--background)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.2)",
          transform: selected ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          maxHeight: "72vh", overflowY: "auto",
          padding: "0 24px 48px",
        }}>
          {/* Handle bar */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(128,128,128,0.3)" }} />
          </div>

          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Title + close */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <h2 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "var(--foreground)", margin: 0, lineHeight: 1.2 }}>
                  {selected.name}
                </h2>
                <button
                  onClick={() => setSelected(null)}
                  style={{ flexShrink: 0, fontSize: 18, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                >
                  ✕
                </button>
              </div>

              {/* Links */}
              {(selected.live || selected.github) && (
                <div style={{ display: "flex", gap: 16 }}>
                  {selected.live && (
                    <a href={selected.live} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#fabc0e", fontWeight: 600, textDecoration: "none" }}>
                      Live ↗
                    </a>
                  )}
                  {selected.github && (
                    <a href={selected.github} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500, opacity: 0.6, textDecoration: "none" }}>
                      GitHub ↗
                    </a>
                  )}
                </div>
              )}

              {/* Image */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "rgba(0,0,0,0.05)", flexShrink: 0 }}>
                <Image src={selected.image} alt={selected.name} fill sizes="100vw" className="object-cover" />
              </div>

              {/* Description */}
              <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
                {selected.description}
              </p>

              {/* Tags */}
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
          )}
        </div>
      </div>
    </div>
  )
}
