"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { certifications, Certification } from "@/data/certifications"

function CertCard({ cert, onClick, scale, opacity }: {
  cert: Certification
  onClick?: () => void
  scale: number
  opacity: number
}) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 340,
        flexShrink: 0,
        transform: `scale(${scale})`,
        opacity,
        transition: "transform 0.35s ease, opacity 0.35s ease",
        cursor: onClick ? "pointer" : "default",
        background: "white",
        borderRadius: 20,
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        boxShadow: scale === 1
          ? "0 8px 32px rgba(0,0,0,0.12)"
          : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Badge image with colored fallback */}
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 20,
          background: cert.color, opacity: 0.12,
        }} />
        <Image
          src={cert.badge}
          alt={cert.name}
          fill
          sizes="160px"
          className="object-contain"
          style={{ padding: 8 }}
        />
      </div>

      {/* Text */}
      <div style={{ textAlign: "center" }}>
        <p style={{
          fontSize: 13,
          fontWeight: 600,
          color: cert.color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}>
          {cert.issuer}
        </p>
        <p style={{
          fontSize: 17,
          fontWeight: 600,
          color: "#1a1a1a",
          lineHeight: 1.4,
          marginBottom: 8,
        }}>
          {cert.name}
        </p>
        <p style={{ fontSize: 13, color: "#888" }}>{cert.date}</p>
      </div>
    </div>
  )
}

export default function CertificationsCarousel() {
  const [active, setActive] = useState(0)
  const total = certifications.length
  const dragStartX = useRef<number | null>(null)

  const prev = () => setActive(i => (i - 1 + total) % total)
  const next = () => setActive(i => (i + 1) % total)

  const leftIdx  = (active - 1 + total) % total
  const rightIdx = (active + 1) % total

  const onPointerDown = (e: React.PointerEvent) => { dragStartX.current = e.clientX }
  const onPointerUp   = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    const d = e.clientX - dragStartX.current
    if (d < -50) next()
    else if (d > 50) prev()
    dragStartX.current = null
  }

  return (
    <section style={{ padding: "48px 0 64px" }}>
      {/* Section header */}
      <div className="max-w-5xl mx-auto px-8 mb-10">
        <h2 className="font-display text-2xl font-semibold text-[var(--foreground)]">
          Certifications
        </h2>
      </div>

      {/* Carousel */}
      <div
        className="relative flex items-center justify-center"
        style={{ userSelect: "none" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Left arrow */}
        <button
          onClick={prev}
          aria-label="Previous certification"
          className="flex absolute left-8 z-10 w-10 h-10 rounded-full items-center justify-center text-xl transition-colors"
          style={{ background: "rgba(0,0,0,0.07)", color: "#555" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
        >
          ‹
        </button>

        {/* Left pivot — desktop only */}
        <div className="hidden sm:block">
          <CertCard
            cert={certifications[leftIdx]}
            onClick={prev}
            scale={0.82}
            opacity={0.4}
          />
        </div>

        {/* Center active */}
        <CertCard
          cert={certifications[active]}
          scale={1}
          opacity={1}
        />

        {/* Right pivot — desktop only */}
        <div className="hidden sm:block">
          <CertCard
            cert={certifications[rightIdx]}
            onClick={next}
            scale={0.82}
            opacity={0.4}
          />
        </div>

        {/* Right arrow */}
        <button
          onClick={next}
          aria-label="Next certification"
          className="flex absolute right-8 z-10 w-10 h-10 rounded-full items-center justify-center text-xl transition-colors"
          style={{ background: "rgba(0,0,0,0.07)", color: "#555" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.12)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.07)")}
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 justify-center mt-8">
        {certifications.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to certification ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === active ? 20 : 6,
              background: i === active ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.18)",
            }}
          />
        ))}
      </div>
    </section>
  )
}
