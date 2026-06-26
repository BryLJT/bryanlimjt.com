import { projects } from "./projects"
import { certifications } from "./certifications"

export type GraphNode = {
  id: string
  label: string
  type: "project" | "tech" | "certification"
  projectId?: string
  // injected by force simulation at runtime
  x?: number
  y?: number
}

export type GraphLink = {
  source: string
  target: string
}

export type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

export function buildGraphData(): GraphData {
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []
  const techSeen = new Set<string>()

  for (const p of projects) {
    nodes.push({ id: p.id, label: p.name, type: "project", projectId: p.id })

    for (const tag of p.tags) {
      const techId = `tech:${tag}`
      if (!techSeen.has(techId)) {
        techSeen.add(techId)
        nodes.push({ id: techId, label: tag, type: "tech" })
      }
      links.push({ source: p.id, target: techId })
    }
  }

  // Certification nodes — linked to existing tech where relevant, and to each other
  const certIds: string[] = []
  for (const cert of certifications) {
    nodes.push({ id: cert.id, label: cert.name, type: "certification" })
    certIds.push(cert.id)
  }

  // Cross-links: certs → existing tech tags where there's real overlap
  const certLinks: Record<string, string[]> = {
    "aws-saa":              ["tech:AWS Cloud Architecture"],
    "aws-aif":              ["tech:AWS Cloud Architecture", "tech:Python"],
    "azure-ai-900":         ["tech:Python"],
    "alteryx-designer-core": [],
  }
  for (const [certId, techIds] of Object.entries(certLinks)) {
    for (const techId of techIds) {
      if (techSeen.has(techId)) links.push({ source: certId, target: techId })
    }
  }

  // Chain certs together so they form a visible cluster
  for (let i = 0; i < certIds.length - 1; i++) {
    links.push({ source: certIds[i], target: certIds[i + 1] })
  }

  return { nodes, links }
}
