"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HoverLift } from "@/components/shared/HoverLift"
import { cn } from "@/lib/utils"

interface WorkCardProps {
  title: string
  subtitle: string
  href: string
  badges?: string[]
  metric?: string
}

export function WorkCard({ title, subtitle, href, badges, metric }: WorkCardProps) {
  return (
    <HoverLift>
      <Link href={href} className="block">
        <Card className="border-[var(--faint)] bg-[var(--panel)] p-6 transition-colors hover:border-[var(--accent)]/30">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="h3 mb-2 text-[var(--text)]">{title}</h3>
              <p className="body text-[var(--muted)]">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {badges?.map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="border-none bg-[var(--faint)] text-[var(--muted)]"
                >
                  {badge}
                </Badge>
              ))}
              {metric && <span className="mono-small ml-auto text-[var(--accent)]">{metric}</span>}
            </div>
          </div>
        </Card>
      </Link>
    </HoverLift>
  )
}
