import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageTransition } from "@/components/shared/PageTransition";
import { Reveal } from "@/components/shared/Reveal";
import { CaseStudySection } from "@/components/work/CaseStudySection";
import { UnderTheHoodAccordion } from "@/components/shared/UnderTheHoodAccordion";
import { getProjectItem, projectItems } from "@/lib/content/projects";

export async function generateStaticParams() {
  return projectItems.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectItem(slug);

  if (!project) {
    return {
      title: "Not Found",
    };
  }

  return {
    title: `${project.title} | Aryan Bahl`,
    description: project.subtitle,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectItem(slug);

  if (!project) {
    notFound();
  }

  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="display-xl text-[var(--text)] mb-4">{project.title}</h1>
              <p className="display-l text-[var(--muted)] mb-8">{project.subtitle}</p>
            </div>
          </div>
        </section>
      </Reveal>
      <CaseStudySection title="Problem">
        <p>{project.problem}</p>
      </CaseStudySection>
      <CaseStudySection title="Approach">
        <p>{project.approach}</p>
      </CaseStudySection>
      <CaseStudySection title="Key Implementation Details">
        <p>{project.implementation}</p>
      </CaseStudySection>
      <CaseStudySection title="Results / Benchmarks">
        <ul className="list-disc list-inside space-y-2">
          {project.results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      </CaseStudySection>
      <CaseStudySection title="What I Learned">
        <p>{project.learnings}</p>
      </CaseStudySection>
      <div className="container-custom max-w-3xl">
        <div className="mono-small text-[var(--muted)]/60 mb-4">
          Scale / Reliability / Latency
        </div>
      </div>
      <UnderTheHoodAccordion items={project.underTheHood} />
    </PageTransition>
  );
}
