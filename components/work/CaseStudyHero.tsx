"use client"

import { MetaRow } from "./MetaRow"
import { Reveal } from "@/components/shared/Reveal"

interface CaseStudyHeroProps {
  title: string
  subtitle: string
  role?: string
  timeframe?: string
  stack?: string[]
  metric?: string
}

export function CaseStudyHero({
  title,
  subtitle,
  role,
  timeframe,
  stack,
  metric,
}: CaseStudyHeroProps) {
  return (
    <Reveal>
      <div className="section">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="display-xl mb-4 text-[var(--text)]">{title}</h1>
            <p className="display-l mb-8 text-[var(--muted)]">{subtitle}</p>
            <MetaRow role={role} timeframe={timeframe} stack={stack} metric={metric} />
          </div>
        </div>
      </div>
    </Reveal>
  )
}
