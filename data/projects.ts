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
  featured: boolean
}

export const projects: Project[] = [
  {
    id: "accelchat",
    name: "Accelchat",
    description: "Web chat platform built for Accellearn tuition centre — real-time messaging, file sharing, and content moderation for students aged 7–18.",
    image: "/images/accelchat.jpg",
    tags: ["AWS Cloud Architecture", "Next.js", "Node.js", "Socket.IO"],
    featured: true,
  },
  {
    id: "accelcalendar",
    name: "AccelCalendar",
    description: "Scheduling and calendar management tool for Accellearn — streamlining timetable arrangements, teacher availability, and personalised scheduling. Used by a growing team of 15 teachers, saving hours of administrative time.",
    image: "/images/accelcalendar.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    featured: true,
  },
  {
    id: "alfred",
    name: "Alfred",
    description: "Personal AI assistant and coding collaborator built on Claude Code — with persistent memory, self-improvement, and a Telegram interface.",
    image: "/images/alfred.jpg",
    imageStyle: "contain",
    tags: ["Claude Code", "Python", "Memory Systems"],
    featured: true,
  },
  {
    id: "bryanlimjt-com",
    name: "bryanlimjt.com",
    description: "This website — a personal portfolio and digital business card built with Next.js, Tailwind v4, and framer-motion.",
    image: "/images/website.jpg",
    tags: ["Next.js", "Tailwind CSS", "Vercel"],
    live: "https://bryanlimjt.com",
    github: "https://github.com/BryLJT/bryanlimjt.com",
    featured: true,
  },
  {
    id: "weatherbot",
    name: "Weatherbot",
    description: "Location specific Telegram weather bot for Singapore — daily forecasts, UV index alerts, and scheduled morning push notifications.",
    image: "/images/weatherbot.jpg",
    imageStyle: "cover",
    portrait: true,
    tags: ["Python", "Telegram API", "Data.gov.sg"],
    featured: true,
  },
  {
    id: "nutrient-analysis",
    name: "Nutrient Analysis",
    description: "Desktop app for clinical dietitians — looks up foods across Singapore's HPB and Australia's AFCD nutrient databases, compares values side by side, and exports to Excel for therapeutic-diet analysis.",
    image: "/images/nutrient-analysis.jpg",
    tags: ["Electron", "React", "TypeScript", "Node.js"],
    github: "https://github.com/BryLJT/nutrient-scraper",
    featured: true,
  },
  {
    id: "cupp",
    name: "Cupp",
    description: "Specialty coffee logging app with an AI bag scanner. Photograph a bag and a vision model extracts the bean details, with every field carrying the source text it was read from, so a wrong reading is visible instead of silent. Built with two friends in a four-week sprint; scan time tuned from 35 seconds to under 10.",
    image: "/images/cupp.jpg",
    tags: ["React Native", "Expo", "Supabase", "TypeScript"],
    github: "https://github.com/BryLJT/cupp",
    featured: true,
  },
  {
    id: "statement-sender",
    name: "Statement Sender",
    description: "Desktop app that automates a financial consultant's monthly statement send-out to over 600 clients. An identity gate matches each client's ID across two pages before anything is captured, and capture is kept separate from sending so nothing leaves without a human release. 50 automated tests.",
    tags: ["Electron", "Playwright", "Node.js"],
    featured: true,
  },
  {
    id: "accellearn-invoicing",
    name: "AccelLearn Invoicing",
    description: "Invoice and receipt generator used by a tuition centre's admin team. It reads their live spreadsheet and produces per-student PDFs. I joined as a second developer: fixed two production bugs, added duplicate-name safeguards, and shipped a release to the client.",
    tags: ["Next.js", "Electron", "TypeScript", "React"],
    featured: true,
  },
  {
    id: "mac-mini-server",
    name: "Mac Mini Home Server",
    description: "Self-hosted M4 Mac mini running a private photo library for my family, replacing a cloud subscription. Phones back up automatically over the local network to an external drive.",
    tags: ["Self-Hosting", "Docker", "Immich", "Networking"],
    featured: true,
  },
]
