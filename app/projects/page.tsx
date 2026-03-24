import { projects } from "@/data/projects"
import ProjectCard from "@/components/ProjectCard"

export default function Projects() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-20">
      <h1 className="font-display text-4xl font-semibold text-[var(--foreground)] mb-2">
        Projects
      </h1>
      <p className="text-[var(--text-muted)] text-lg mb-12">
        Things I&apos;ve built — to learn, to explore, to solve.
      </p>

      <div className="grid grid-cols-2 gap-8">
        {projects.map((project) => (
          <div key={project.id} id={project.id}>
            <ProjectCard project={project} />
            <p className="mt-3 px-1 text-sm text-[var(--text-muted)] leading-relaxed">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
