import { Metadata } from "next"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { projectItems } from "@/lib/content/projects"

export const metadata: Metadata = {
  title: "Projects | Aryan Bahl",
  description: "Independent projects and research: compilers, RAG systems, and infrastructure.",
}

export default function ProjectsPage() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="mb-12 max-w-3xl">
              <h1 className="display-xl mb-4 text-[var(--text)]">Projects</h1>
              <p className="display-l text-[var(--muted)]">
                Independent projects and deep dives into systems, compilers, and infrastructure.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {projectItems.map((project, index) => (
                <Reveal key={project.slug} delay={index * 0.1}>
                  <ProjectCard
                    title={project.title}
                    subtitle={project.subtitle}
                    href={`/projects/${project.slug}`}
                    domain={project.domain}
                    metric={project.metric}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  )
}
