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
    tags: ["Next.js", "Node.js", "Socket.IO", "TypeScript"],
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
    id: "weatherbot",
    name: "Weatherbot",
    description: "Telegram weather bot for Singapore — daily forecasts, UV index alerts, and scheduled morning push notifications.",
    image: "/images/weatherbot.jpg",
    tags: ["Python", "Telegram API", "Data.gov.sg"],
    featured: true,
  },
  {
    id: "nus-research",
    name: "NUS Research",
    description: "Two research projects under NUS Dept of Microbiology — DNA repair mechanisms and SARS-CoV-2 Orf10 protein interactions. Won SSEF Gold and Singapore-Japan Conference 1st Prize.",
    image: "/images/research.jpg",
    tags: ["Research", "Microbiology", "SARS-CoV-2"],
    featured: true,
  },
  {
    id: "placeholder-1",
    name: "Placeholder 1",
    description: "Test card for scroll animation.",
    image: "/images/placeholder1.jpg",
    tags: ["Test"],
    featured: true,
  },
  {
    id: "placeholder-2",
    name: "Placeholder 2",
    description: "Test card for scroll animation.",
    image: "/images/placeholder2.jpg",
    tags: ["Test"],
    featured: true,
  },
]
