import { PageTransition } from "@/components/shared/PageTransition";
import { Reveal } from "@/components/shared/Reveal";
import { WorkCard } from "@/components/work/WorkCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import Link from "next/link";
import { workItems } from "@/lib/content/work";
import { projectItems } from "@/lib/content/projects";

export default function Home() {
  const selectedWork = workItems.slice(0, 2);
  const selectedProjects = projectItems.slice(0, 2);

  return (
    <PageTransition>
      {/* Hero */}
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="display-xl text-[var(--text)] mb-4">
                Engineer & Systems Builder
              </h1>
              <p className="display-l text-[var(--muted)]">
                Building systems that stay fast as they scale.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Selected Work */}
      <Reveal delay={0.1}>
        <section className="section">
          <div className="container-custom">
            <h2 className="display-l text-[var(--text)] mb-8">Selected Work</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {selectedWork.map((work) => (
                <WorkCard
                  key={work.slug}
                  title={work.title}
                  subtitle={work.subtitle}
                  href={`/work/${work.slug}`}
                  badges={work.stack.slice(0, 2)}
                  metric={work.metric}
                />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/work"
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                View all work →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Selected Projects */}
      <Reveal delay={0.2}>
        <section className="section">
          <div className="container-custom">
            <h2 className="display-l text-[var(--text)] mb-8">Selected Projects</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {selectedProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  title={project.title}
                  subtitle={project.subtitle}
                  href={`/projects/${project.slug}`}
                  domain={project.domain}
                  metric={project.metric}
                />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/projects"
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                View all projects →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Leadership Teaser */}
      <Reveal delay={0.3}>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h2 className="display-l text-[var(--text)] mb-4">Leadership</h2>
              <p className="body text-[var(--muted)] mb-4">
                Leading teams and operations at scale. From hackathons to infrastructure,
                focused on systems that enable growth.
              </p>
              <Link
                href="/leadership"
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors"
              >
                Learn more →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  );
}
