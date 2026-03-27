"use client"

import dynamic from "next/dynamic"

const Globe = dynamic(() => import("@/components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full" style={{ height: 760, background: "#060d14" }} />
  ),
})

export default function GlobeWrapper() {
  return (
    <div className="w-full pt-16 md:pt-40" style={{ background: "#060d14" }}>
      <p
        className="text-center font-display"
        style={{
          color: "rgba(250,188,14,0.85)",
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        My Projects
      </p>
      <Globe />
    </div>
  )
}
