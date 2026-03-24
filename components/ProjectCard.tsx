import Link from "next/link"
import Image from "next/image"
import { Project } from "@/data/projects"

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects#${project.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-[var(--border)] aspect-[4/3]">
        {/* Placeholder until real images are added */}
        <div className="absolute inset-0 bg-[#1B4A6B] group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm leading-relaxed">{project.description}</p>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="font-medium text-[var(--foreground)]">{project.name}</h3>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs text-[var(--text-muted)] bg-[var(--border)] px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
