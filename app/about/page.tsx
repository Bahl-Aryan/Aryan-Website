import { Metadata } from "next"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"

export const metadata: Metadata = {
  title: "About | Aryan Bahl",
  description: "Engineer and systems builder focused on scalable infrastructure and cloud systems.",
}

export default function AboutPage() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-3xl">
              <h1 className="display-xl mb-8 text-[var(--text)]">About</h1>
              <div className="body space-y-6 text-[var(--muted)]">
                <p>
                  I'm an engineer and systems builder focused on building infrastructure that
                  scales. My work spans cloud architecture, distributed systems, and developer
                  tooling—always with an eye toward reliability, latency, and systems that stay fast
                  as they grow.
                </p>
                <p>
                  I've led teams building everything from hackathon infrastructure to production ML
                  systems. Whether it's optimizing PyTorch compilation or migrating monolithic
                  applications to serverless architectures, I'm interested in the technical
                  decisions that enable growth.
                </p>
                <p>
                  Currently, I'm particularly interested in compiler optimizations,
                  retrieval-augmented generation systems, and infrastructure that reduces
                  operational overhead while improving performance.
                </p>
                <div className="border-t border-[var(--faint)] pt-8">
                  <h2 className="h3 mb-4 text-[var(--text)]">What I'm Looking For</h2>
                  <p>
                    Opportunities to work on systems at scale—whether that's cloud infrastructure,
                    developer tooling, or platforms that enable other engineers to build faster. I'm
                    drawn to problems where technical decisions have real impact on product and user
                    experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  )
}
