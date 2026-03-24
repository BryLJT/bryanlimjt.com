export type Project = {
  id: string
  name: string
  description: string
  image: string
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
    description: "Scheduling and calendar management tool for Accellearn — streamlining timetable arrangements, teacher availability, and personalised user experience.",
    image: "/images/accelcalendar.jpg",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    featured: true,
  },
  {
    id: "alfred",
    name: "Alfred",
    description: "Personal AI assistant and coding collaborator built on Claude Code — with persistent memory, self-improvement, and a Telegram interface.",
    image: "/images/alfred.jpg",
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
    tags: ["Python", "Telegram API", "Data.gov.sg"],
    featured: true,
  },
]
