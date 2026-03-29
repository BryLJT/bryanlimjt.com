"use client"

import { useEffect, useRef } from "react"

export default function SchedulingButton() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load CSS once
    if (!document.querySelector('link[href*="scheduling-button-script.css"]')) {
      const link = document.createElement("link")
      link.href = "https://calendar.google.com/calendar/scheduling-button-script.css"
      link.rel = "stylesheet"
      document.head.appendChild(link)
    }

    function initButton() {
      const cal = (window as Record<string, unknown>).calendar as {
        schedulingButton: { load: (opts: Record<string, unknown>) => void }
      } | undefined
      if (ref.current && cal?.schedulingButton) {
        cal.schedulingButton.load({
          url: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ0vOmt8mOJwu_5u0EQGU23x-9T0p9mwWpIu9lKKd1whQQJOT3n6QFtvVz5P0I0SOVkeZIhI54Y9?gv=true",
          color: "#1B2A4A",
          label: "Book a time",
          target: ref.current,
        })
      }
    }

    // Load script and init
    const existing = document.querySelector('script[src*="scheduling-button-script.js"]')
    if (!existing) {
      const script = document.createElement("script")
      script.src = "https://calendar.google.com/calendar/scheduling-button-script.js"
      script.async = true
      script.onload = initButton
      document.head.appendChild(script)
    } else {
      initButton()
    }
  }, [])

  return <div ref={ref} />
}
