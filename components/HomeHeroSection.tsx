"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Hero from "./Hero"
import CertificationsCarousel from "./CertificationsCarousel"

// Scroll-driven background: cream → dark navy as the hero scrolls out of view
export default function HomeHeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"], // 0 = top of hero at top of viewport, 1 = hero fully scrolled past
  })

  // Parchment cream (#f5f0e8) → deep navy (#060d14)
  // Transition completes by the time 80% of the hero has scrolled past
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.8],
    ["#f5f0e8", "#060d14"]
  )

  return (
    <motion.div ref={ref} style={{ backgroundColor }} className="w-full relative">
      <Hero />
      <CertificationsCarousel />
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
