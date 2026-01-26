"use client";

import { cn } from "@/lib/utils";

interface MetaRowProps {
  role?: string;
  timeframe?: string;
  stack?: string[];
  metric?: string;
}

export function MetaRow({ role, timeframe, stack, metric }: MetaRowProps) {
  return (
    <div className="flex flex-wrap gap-6 text-sm text-[var(--muted)] border-b border-[var(--faint)] pb-6">
      {role && (
        <div>
          <span className="mono-small text-[var(--muted)]/60">Role</span>
          <p className="mt-1 text-[var(--text)]">{role}</p>
        </div>
      )}
      {timeframe && (
        <div>
          <span className="mono-small text-[var(--muted)]/60">Timeframe</span>
          <p className="mt-1 text-[var(--text)]">{timeframe}</p>
        </div>
      )}
      {stack && stack.length > 0 && (
        <div>
          <span className="mono-small text-[var(--muted)]/60">Stack</span>
          <p className="mt-1 text-[var(--text)]">{stack.join(", ")}</p>
        </div>
      )}
      {metric && (
        <div>
          <span className="mono-small text-[var(--muted)]/60">Metric</span>
          <p className="mt-1 mono-small text-[var(--accent)]">{metric}</p>
        </div>
      )}
    </div>
  );
}
