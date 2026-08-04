"use client"

import Image from "next/image"
import { Project } from "@/data/projects"

type Props = {
  project: Project
  /** Width of the container when the project uses a portrait (9/16) image. */
  portraitWidth: number
  /** Passed through to next/image for responsive sizing. */
  sizes: string
}

/**
 * Renders a project's visual block: the real screenshot when one exists,
 * and a typographic panel when it doesn't.
 *
 * The fallback matters because `image` is optional — a project can go live
 * on the site before anyone has taken a screenshot of it. Without this,
 * shipping a project would be blocked on producing an asset.
 */
export default function ProjectImage({ project, portraitWidth, sizes }: Props) {
  return (
    <div style={{
      width: project.portrait ? portraitWidth : "100%",
      margin: project.portrait ? "0 auto" : undefined,
      flexShrink: 0,
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: project.portrait ? "9/16" : "16/9",
        borderRadius: 10,
        overflow: "hidden",
        background: "#060d14",
      }}>
        {project.image ? (
          <Image
            src={project.image}
            alt={project.name}
            fill
            sizes={sizes}
            className={project.imageStyle === "contain" ? "object-contain" : "object-cover"}
          />
        ) : (
          <Fallback project={project} />
        )}
      </div>
    </div>
  )
}

/**
 * Typographic stand-in used when a project has no screenshot yet.
 *
 * Deliberately does NOT restate the name as a label or repeat the tag chips:
 * in the detail panel this block sits directly between the project heading and
 * the tag row, so either would read as a stutter. Instead the name is set
 * oversized and very low contrast, so it works as texture rather than content.
 */
function Fallback({ project }: { project: Project }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      // Warm wash so the panel reads as designed rather than as a failed image.
      backgroundImage:
        "radial-gradient(130% 100% at 8% 0%, rgba(250,188,14,0.13), transparent 62%)",
    }}>
      <span
        aria-hidden="true"
        style={{
          // Wraps rather than clipping: a name cut mid-word reads as an
          // overflow bug, not as a deliberate treatment.
          fontSize: "clamp(26px, 4.4vw, 54px)",
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1.0,
          color: "rgba(250,188,14,0.17)",
          padding: "0 clamp(18px, 6%, 44px)",
          textWrap: "balance",
          userSelect: "none",
        }}
      >
        {project.name}
      </span>
    </div>
  )
}
