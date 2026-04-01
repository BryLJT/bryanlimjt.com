"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

// Scroll-driven background: cream → dark navy as the hero scrolls out of view.
// Children are passed in from app/page.tsx (a server component) so that static
// content like Hero can be server-rendered to HTML without waiting for JS.
export default function HomeHeroSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["#f5f0e8", "#060d14"]
  )

  return (
    <motion.div ref={ref} style={{ backgroundColor }} className="w-full relative">
      {children}
      {/* Bottom fade — bridges the hard seam between hero and dark globe section */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30px",
          background: "linear-gradient(to bottom, transparent 0%, #060d14 100%)",
        }}
      />
    </motion.div>
  )
}
