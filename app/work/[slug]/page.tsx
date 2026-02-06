import { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageTransition } from "@/components/shared/PageTransition"
import { CaseStudyHero } from "@/components/work/CaseStudyHero"
import { CaseStudySection } from "@/components/work/CaseStudySection"
import { UnderTheHoodAccordion } from "@/components/shared/UnderTheHoodAccordion"
import { getWorkItem, workItems } from "@/lib/content/work"

export async function generateStaticParams() {
  return workItems.map((item) => ({
    slug: item.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const work = getWorkItem(slug)

  if (!work) {
    return {
      title: "Not Found",
    }
  }

  return {
    title: `${work.title} | Aryan Bahl`,
    description: work.subtitle,
  }
}

export default async function WorkCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = getWorkItem(slug)

  if (!work) {
    notFound()
  }

  return (
    <PageTransition>
      <CaseStudyHero
        title={work.title}
        subtitle={work.subtitle}
        role={work.role}
        timeframe={work.timeframe}
        stack={work.stack}
        metric={work.metric}
      />
      <CaseStudySection title="Context">
        <p>{work.context}</p>
      </CaseStudySection>
      <CaseStudySection title="Constraints">
        <p>{work.constraints}</p>
      </CaseStudySection>
      <CaseStudySection title="Decisions">
        <p>{work.decisions}</p>
      </CaseStudySection>
      <CaseStudySection title="Results">
        <ul className="list-inside list-disc space-y-2">
          {work.results.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      </CaseStudySection>
      <CaseStudySection title="Reflection">
        <p>{work.reflection}</p>
      </CaseStudySection>
      <div className="container-custom max-w-3xl">
        <div className="mono-small mb-4 text-[var(--muted)]/60">Scale / Reliability / Latency</div>
      </div>
      <UnderTheHoodAccordion items={work.underTheHood} />
    </PageTransition>
  )
}
