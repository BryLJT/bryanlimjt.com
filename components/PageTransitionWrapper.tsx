"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { usePathname } from "next/navigation"

// Module-level flag — survives component remounts caused by key changes.
// false on both server and client initial load; set true after first mount.
let initialRenderDone = false

export default function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const skipAnimation = useRef(!initialRenderDone)

  if (!initialRenderDone) initialRenderDone = true

  return (
    <motion.main
      key={pathname}
      initial={skipAnimation.current ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex-1"
    >
      {children}
    </motion.main>
  )
}
