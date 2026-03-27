export type Certification = {
  id: string
  name: string
  issuer: string
  date: string       // "Month YYYY"
  badge: string      // path to badge image, e.g. /images/badges/aws-aif.png
  color: string      // accent color for the card
}

export const certifications: Certification[] = [
  {
    id: "aws-aif",
    name: "AWS Certified AI Practitioner",
    issuer: "Amazon Web Services",
    date: "March 2026",
    badge: "/images/badges/aws-aif.png",
    color: "#FF9900",
  },
  {
    id: "azure-ai-900",
    name: "Azure AI Fundamentals",
    issuer: "Microsoft",
    date: "October 2025",
    badge: "/images/badges/azure-ai-900.png",
    color: "#0078D4",
  },
  {
    id: "alteryx-designer-core",
    name: "Alteryx Designer Core",
    issuer: "Alteryx",
    date: "December 2025",
    badge: "/images/badges/alteryx-core.png",
    color: "#0078C8",
  },
]
