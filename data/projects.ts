export type Project = {
  id: string
  name: string
  description: string
  image?: string                      // optional: projects without a screenshot render a typographic panel
  imageStyle?: "cover" | "contain"   // default "cover"; use "contain" for portrait images
  portrait?: boolean                  // true = use 9/16 aspect ratio container instead of 16/9
  tags: string[]
  github?: string
  live?: string
  /**
   * Link to a video walkthrough. Kept separate from `live` on purpose — `live`
   * renders as "Live", which would wrongly imply the product runs at that URL.
   */
  demo?: string
  /**
   * The four projects surfaced ahead of the rest (Bryan's pick, 2026-08-04).
   * Read by nothing yet — the featured column and node sparkle from the
   * 2026-07-28 refresh are the intended consumers.
   */
  featured: boolean
  /**
   * [lat, lng] of this project's marker on the landing-page globe.
   *
   * Deliberately DECORATIVE — the placements are a pleasing spread, not a claim
   * about where anything runs or who it serves. Chosen so markers distribute
   * across the sphere instead of clumping in one hemisphere.
   *
   * Required on purpose. The globe used to hardcode its own marker list inside
   * Globe.tsx, which silently drifted from this file three ways (a missing
   * project, plus "WeatherBot"/"AccelChat" vs "Weatherbot"/"Accelchat"). Making
   * this mandatory means a project cannot be added without deciding where it
   * sits, so the two lists can no longer disagree.
   */
  location: [number, number]
}

export const projects: Project[] = [
  {
    id: "accelchat",
    name: "Accelchat",
    description: "Web chat platform built for Accellearn tuition centre — real-time messaging, file sharing, and content moderation for students aged 7–18.",
    image: "/images/accelchat.jpg",
    tags: ["AWS Cloud Architecture", "Next.js", "Node.js", "Socket.IO"],
    featured: true,
    location: [40.7128, -74.0060],    // New York
  },
  {
    id: "accelcalendar",
    name: "AccelCalendar",
    description: "Scheduling and calendar management tool for Accellearn — streamlining timetable arrangements, teacher availability, and personalised scheduling. Used by a growing team of 15 teachers, saving hours of administrative time.",
    image: "/images/accelcalendar.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    featured: true,
    location: [51.5074, -0.1278],     // London
  },
  {
    id: "alfred",
    name: "Alfred",
    description: "Personal AI assistant and coding collaborator built on Claude Code — with persistent memory, self-improvement, and a Telegram interface.",
    image: "/images/alfred.jpg",
    imageStyle: "contain",
    tags: ["Claude Code", "Python", "Memory Systems"],
    featured: true,
    location: [1.3521, 103.8198],     // Singapore
  },
  {
    id: "bryanlimjt-com",
    name: "bryanlimjt.com",
    description: "This website — a personal portfolio and digital business card built with Next.js, Tailwind v4, and framer-motion.",
    image: "/images/website.jpg",
    tags: ["Next.js", "Tailwind CSS", "Vercel"],
    live: "https://bryanlimjt.com",
    github: "https://github.com/BryLJT/bryanlimjt.com",
    featured: false,
    location: [37.7595, -122.4367],   // San Francisco
  },
  {
    id: "weatherbot",
    name: "Weatherbot",
    description: "Location specific Telegram weather bot for Singapore — daily forecasts, UV index alerts, and scheduled morning push notifications.",
    image: "/images/weatherbot.jpg",
    imageStyle: "cover",
    portrait: true,
    tags: ["Python", "Telegram API", "Data.gov.sg"],
    featured: false,
    location: [35.6762, 139.6503],    // Tokyo
  },
  {
    id: "nutrient-analysis",
    name: "Nutrient Analysis",
    description: "Desktop app for clinical dietitians — looks up foods across Singapore's HPB and Australia's AFCD nutrient databases, compares values side by side, and exports to Excel for therapeutic-diet analysis.",
    image: "/images/nutrient-analysis.jpg",
    tags: ["Electron", "React", "TypeScript", "Node.js"],
    github: "https://github.com/BryLJT/nutrient-scraper",
    featured: false,
    location: [-33.8688, 151.2093],   // Sydney
  },
  {
    id: "cupp",
    name: "Cupp",
    description: "Specialty coffee logging app with an AI bag scanner. Photograph a bag and a vision model extracts the bean details, with every field carrying the source text it was read from, so a wrong reading is visible instead of silent. Built with two friends in a four-week sprint; scan time tuned from 35 seconds to under 10.",
    image: "/images/cupp.jpg",
    tags: ["React Native", "Expo", "Supabase", "TypeScript"],
    github: "https://github.com/BryLJT/cupp",
    demo: "https://youtu.be/5ildYIXu0D8",
    featured: true,
    location: [6.2486, -75.5636],     // Medellin
  },
  {
    id: "statement-sender",
    name: "Statement Sender",
    description: "Desktop app that automates a financial consultant's monthly statement send-out to over 600 clients. An identity gate matches each client's ID across two pages before anything is captured, and capture is kept separate from sending so nothing leaves without a human release. 50 automated tests.",
    tags: ["Electron", "Playwright", "Node.js"],
    featured: false,
    location: [25.2048, 55.2708],     // Dubai
  },
  {
    id: "accellearn-invoicing",
    name: "AccelLearn Invoicing",
    description: "Invoice and receipt generator used by a tuition centre's admin team. It reads their live spreadsheet and produces per-student PDFs. I joined as a second developer: fixed two production bugs, added duplicate-name safeguards, and shipped a release to the client.",
    tags: ["Next.js", "Electron", "TypeScript", "React"],
    featured: false,
    location: [19.0760, 72.8777],     // Mumbai
  },
  {
    id: "mac-mini-server",
    name: "Mac Mini Home Server",
    description: "Self-hosted M4 Mac mini running a private photo library for my family, replacing a cloud subscription. Phones back up automatically over the local network to an external drive.",
    tags: ["Self-Hosting", "Docker", "Immich", "Networking"],
    featured: false,
    location: [-33.9249, 18.4241],    // Cape Town
  },
  {
    id: "rvmj",
    name: "RVMJ",
    description: "Mahjong scoreboard and permanent leaderboard for my friend group. Players tap a seat to join a live table, scores settle across all four seats automatically, and rare hands get logged to a 23-hand catalogue with a photo of the winning tiles. 37 players on the board and 659 automated tests behind it.",
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL"],
    github: "https://github.com/BryLJT/rvmj",
    live: "https://rvmj.vercel.app",
    featured: false,
    // No `image` on purpose: the board lists 37 real people by name, and a
    // screenshot here would republish them to a portfolio audience. The
    // typographic fallback in ProjectImage covers it.
    location: [22.3193, 114.1694],    // Hong Kong
  },
]
