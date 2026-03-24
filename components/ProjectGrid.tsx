"use client"

import { motion } from "framer-motion"
import { Project } from "@/data/projects"
import ProjectCard from "./ProjectCard"

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {projects.map((project, i) => {
        const isAboveFold = i < 2
        const delay = isAboveFold ? 0.2 + i * 0.2 : (i - 2) * 0.15

        return (
          <motion.div
            key={project.id}
            className={i % 2 !== 0 ? "mt-10" : ""}
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            {...(isAboveFold
              ? { animate: { opacity: 1, y: 0, scale: 1 } }
              : {
                  whileInView: { opacity: 1, y: 0, scale: 1 },
                  viewport: { once: true, margin: "-60px" },
                }
            )}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
          >
            <ProjectCard project={project} />
          </motion.div>
        )
      })}
    </div>
  )
}
