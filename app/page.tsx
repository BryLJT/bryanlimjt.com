import Hero from "@/components/Hero"
import ProjectGrid from "@/components/ProjectGrid"
import { projects } from "@/data/projects"
import Link from "next/link"

const featuredProjects = projects.filter((p) => p.featured)

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-8 pb-20">
      <Hero />

      <section className="mt-24">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest">
            My projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            View all →
          </Link>
        </div>
        <ProjectGrid projects={featuredProjects} />
      </section>
    </div>
  )
}
