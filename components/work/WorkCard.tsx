"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverLift } from "@/components/shared/HoverLift";
import { cn } from "@/lib/utils";

interface WorkCardProps {
  title: string;
  subtitle: string;
  href: string;
  badges?: string[];
  metric?: string;
}

export function WorkCard({ title, subtitle, href, badges, metric }: WorkCardProps) {
  return (
    <HoverLift>
      <Link href={href} className="block">
        <Card className="p-6 bg-[var(--panel)] border-[var(--faint)] hover:border-[var(--accent)]/30 transition-colors">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="h3 text-[var(--text)] mb-2">{title}</h3>
              <p className="body text-[var(--muted)]">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {badges?.map((badge) => (
                <Badge
                  key={badge}
                  variant="secondary"
                  className="bg-[var(--faint)] text-[var(--muted)] border-none"
                >
                  {badge}
                </Badge>
              ))}
              {metric && (
                <span className="mono-small text-[var(--accent)] ml-auto">
                  {metric}
                </span>
              )}
            </div>
          </div>
        </Card>
      </Link>
    </HoverLift>
  );
}
