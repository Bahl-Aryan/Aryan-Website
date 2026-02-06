import { Metadata } from "next"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Card } from "@/components/ui/card"
import { leadershipItems } from "@/lib/content/leadership"

export const metadata: Metadata = {
  title: "Leadership | Aryan Bahl",
  description: "Leading teams and operations at scale. From hackathons to infrastructure.",
}

export default function LeadershipPage() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="mb-12 max-w-3xl">
              <h1 className="display-xl mb-4 text-[var(--text)]">Leadership</h1>
              <p className="display-l text-[var(--muted)]">
                Leading teams and operations at scale. Focused on systems that enable growth.
              </p>
            </div>
            <div className="space-y-8">
              {leadershipItems.map((item, index) => (
                <Reveal key={index} delay={index * 0.1}>
                  <Card className="border-[var(--faint)] bg-[var(--panel)] p-8">
                    <div className="flex flex-col gap-6">
                      <div>
                        <div className="mb-2 flex items-center gap-4">
                          <h2 className="display-l text-[var(--text)]">{item.title}</h2>
                          <span className="mono-small text-[var(--muted)]/60">
                            {item.timeframe}
                          </span>
                        </div>
                        <p className="h3 mb-4 text-[var(--muted)]">{item.role}</p>
                        <p className="body text-[var(--muted)]">{item.description}</p>
                      </div>
                      <div>
                        <h3 className="h3 mb-3 text-[var(--text)]">Achievements</h3>
                        <ul className="body list-inside list-disc space-y-2 text-[var(--muted)]">
                          {item.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mono-small text-[var(--accent)]">{item.scale}</div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  )
}
