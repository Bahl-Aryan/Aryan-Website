"use client"

import { Reveal } from "@/components/shared/Reveal"
import { cn } from "@/lib/utils"

interface CaseStudySectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function CaseStudySection({ title, children, className }: CaseStudySectionProps) {
  return (
    <Reveal>
      <section className={cn("section", className)}>
        <div className="container-custom">
          <div className="max-w-3xl">
            <h2 className="display-l mb-6 text-[var(--text)]">{title}</h2>
            <div className="body space-y-4 text-[var(--muted)]">{children}</div>
          </div>
        </div>
      </section>
    </Reveal>
  )
}
