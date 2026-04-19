export interface DocPage {
  slug: string;
  title: string;
  description?: string;
}

export interface DocSection {
  title: string;
  items: DocPage[];
}

export const navSections: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { slug: "introduction", title: "Introduction", description: "What is agentic-starter?" },
      { slug: "getting-started", title: "Getting Started", description: "Up and running in 10 minutes" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { slug: "architecture", title: "Architecture", description: "How all pieces fit together" },
      { slug: "sdd", title: "SDD Methodology", description: "Spec-Driven Development — 5 phases" },
      { slug: "guardrails", title: "Guardrails", description: "Semantic validation + retry" },
      { slug: "observability", title: "Observability", description: "AgentTracer, traces, debugging" },
      { slug: "evals", title: "Evals", description: "Behavioral tests for agent intelligence" },
    ],
  },
];

export function getAllSlugs(): string[] {
  return navSections.flatMap((s) => s.items.map((i) => i.slug));
}

export function getPageMeta(slug: string): DocPage | undefined {
  for (const section of navSections) {
    const page = section.items.find((i) => i.slug === slug);
    if (page) return page;
  }
}
