export type Certification = {
  id: string
  name: string
  issuer: string
  date: string        // "Month YYYY"
  badge: string       // path to badge image, e.g. /images/badges/aws-aif.png
  color: string       // accent color for the card
  description: string // short writeup shown in the detail panel
}

export const certifications: Certification[] = [
  {
    id: "aws-saa",
    name: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "May 2026",
    badge: "/images/badges/aws-saa.png",
    color: "#2A9D8F",
    description:
      "Validates the ability to design and deploy well-architected systems on AWS — covering resilient, high-performing, secure, and cost-optimized architectures across compute, storage, networking, and databases, aligned to the AWS Well-Architected Framework. Scored 790/1000.",
  },
  {
    id: "aws-aif",
    name: "AWS Certified AI Practitioner",
    issuer: "Amazon Web Services",
    date: "March 2026",
    badge: "/images/badges/aws-aif.png",
    color: "#FF9900",
    description:
      "Validates knowledge of AI, ML, and generative AI fundamentals on AWS — covering core AI/ML concepts, key AWS AI services, generative AI use cases, and responsible AI practices. Passed on first attempt.",
  },
  {
    id: "azure-ai-900",
    name: "Azure AI Fundamentals",
    issuer: "Microsoft",
    date: "October 2025",
    badge: "/images/badges/azure-ai-900.png",
    color: "#0078D4",
    description:
      "Foundational certification covering core AI and machine learning concepts on Microsoft Azure — including supervised and unsupervised learning, computer vision, natural language processing, and conversational AI.",
  },
  {
    id: "alteryx-designer-core",
    name: "Alteryx Designer Core",
    issuer: "Alteryx",
    date: "December 2025",
    badge: "/images/badges/alteryx-core.png",
    color: "#0078C8",
    description:
      "Validates proficiency in Alteryx Designer for self-service data analytics — covering data blending, ETL workflows, and data analytics.",
  },
]
