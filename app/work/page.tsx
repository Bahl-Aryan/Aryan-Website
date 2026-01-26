import { Metadata } from "next";
import { PageTransition } from "@/components/shared/PageTransition";
import { Reveal } from "@/components/shared/Reveal";
import { WorkCard } from "@/components/work/WorkCard";
import { workItems } from "@/lib/content/work";

export const metadata: Metadata = {
  title: "Work | Aryan Bahl",
  description: "Professional case studies: cloud infrastructure, scalable systems, and engineering excellence.",
};

export default function WorkPage() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-3xl mb-12">
              <h1 className="display-xl text-[var(--text)] mb-4">Work</h1>
              <p className="display-l text-[var(--muted)]">
                Professional case studies in cloud infrastructure and scalable systems.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {workItems.map((work, index) => (
                <Reveal key={work.slug} delay={index * 0.1}>
                  <WorkCard
                    title={work.title}
                    subtitle={work.subtitle}
                    href={`/work/${work.slug}`}
                    badges={work.stack.slice(0, 2)}
                    metric={work.metric}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  );
}
