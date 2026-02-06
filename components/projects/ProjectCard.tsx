"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HoverLift } from "@/components/shared/HoverLift"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  title: string
  subtitle: string
  href: string
  domain: string
  metric?: string
}

export function ProjectCard({ title, subtitle, href, domain, metric }: ProjectCardProps) {
  return (
    <HoverLift>
      <Link href={href} className="block">
        <Card className="border-[var(--faint)] bg-[var(--panel)] p-6 transition-colors hover:border-[var(--accent)]/30">
          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h3 className="h3 text-[var(--text)]">{title}</h3>
                <Badge
                  variant="secondary"
                  className="border-none bg-[var(--accent)]/20 text-[var(--accent)]"
                >
                  {domain}
                </Badge>
              </div>
              <p className="body text-[var(--muted)]">{subtitle}</p>
            </div>
            {metric && (
              <div className="flex items-center">
                <span className="mono-small ml-auto text-[var(--accent)]">{metric}</span>
              </div>
            )}
          </div>
        </Card>
      </Link>
    </HoverLift>
  )
}
