"use client"

import { useState } from "react"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { Check, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const LAYOUT_SPRING = { type: "spring", stiffness: 420, damping: 36 } as const

type Kind = "work" | "clubs" | "school"

type CalEvent = {
  year: number // year used for grouping (start year, most recent first)
  period: string
  role: string
  org: string
  kind: Kind
  detail: string
  ongoing?: boolean
}

const EVENTS: CalEvent[] = [
  {
    year: 2026,
    period: "Mar 2026 — present",
    role: "Member of Technical Staff",
    org: "Endeavor",
    kind: "work",
    ongoing: true,
    detail:
      "Building AI for the physical world (SF Bay Area). End-to-end production integrations for five enterprise clients, an agentic ingestion runtime, and event-driven pipeline re-architecture.",
  },
  {
    year: 2025,
    period: "Jun 2025 — Mar 2026",
    role: "Head of Engineering",
    org: "Nora Music",
    kind: "work",
    detail:
      "Led eng efforts to build an app for superfans — horizontally-scalable architecture with Redis and read replicas, 75% faster data ingestion, 400% longer average sessions.",
  },
  {
    year: 2025,
    period: "Mar 2025 — Jan 2026",
    role: "Machine Learning Engineer",
    org: "Boston Bioprocess",
    kind: "work",
    detail:
      "Fine-tuned open-source LLMs on AWS SageMaker and built a full-stack recommendation system; automated experiment summarization with streamed LLM output.",
  },
  {
    year: 2025,
    period: "Mar 2025 — Feb 2026",
    role: "Outreach Lead",
    org: "HackIllinois",
    kind: "clubs",
    detail: "Raised $110k+ and doubled engagement for a 1,000+ person hackathon.",
  },
  {
    year: 2025,
    period: "Jan 2025 — Sep 2025",
    role: "Systems Lead",
    org: "Reflections | Projections",
    kind: "clubs",
    detail: "Led 10 engineers to build and deploy infrastructure for 1,000+ attendees.",
  },
  {
    year: 2025,
    period: "May 2025",
    role: "B.S. Computer Science",
    org: "UIUC",
    kind: "school",
    detail: "B.S. in Computer Science with a minor in Statistics. MCS expected Dec 2026.",
  },
  {
    year: 2024,
    period: "Sep 2024 — Feb 2025",
    role: "Software Engineer · API/Android",
    org: "HackIllinois",
    kind: "clubs",
    detail: "Built APIs and revamped the Android app.",
  },
  {
    year: 2024,
    period: "Jun 2024 — Aug 2024",
    role: "Data Science Intern",
    org: "Medpace",
    kind: "work",
    detail:
      "Clinical research timeline forecasting with PyTorch; client-facing dashboards and analytics in R/Shiny (Cincinnati, OH).",
  },
  {
    year: 2024,
    period: "Jan 2024 — Dec 2024",
    role: "Software Engineer",
    org: "Reflections | Projections",
    kind: "clubs",
    detail: "Mobile app development for UIUC's longest-running tech conference.",
  },
  {
    year: 2023,
    period: "Dec 2023 — Jan 2025",
    role: "ML Research Assistant",
    org: "Illinois Institute of Technology",
    kind: "work",
    detail: "Built and benchmarked VAEs for protein structure compression.",
  },
]

const CALENDARS: { kind: Kind; label: string; dot: string; bar: string; check: string }[] = [
  {
    kind: "work",
    label: "Work",
    dot: "bg-violet-500",
    bar: "bg-violet-400",
    check: "bg-violet-500",
  },
  { kind: "clubs", label: "Clubs", dot: "bg-blue-500", bar: "bg-blue-400", check: "bg-blue-500" },
  {
    kind: "school",
    label: "School",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
    check: "bg-emerald-500",
  },
]

const VIEWS = ["Day", "Week", "Month", "Year"]

function TimelineApp() {
  const [enabled, setEnabled] = useState<Record<Kind, boolean>>({
    work: true,
    clubs: true,
    school: true,
  })
  const [expanded, setExpanded] = useState<string | null>(null)

  const visible = EVENTS.filter((e) => enabled[e.kind])
  const years = [...new Set(visible.map((e) => e.year))].sort((a, b) => b - a)
  const toggle = (kind: Kind) => setEnabled((prev) => ({ ...prev, [kind]: !prev[kind] }))

  return (
    <div className="flex h-full">
      {/* Sidebar: calendars with working checkboxes */}
      <div className="hidden w-40 shrink-0 flex-col border-r border-black/[0.06] bg-black/[0.025] p-3 @md:flex">
        <p className="px-1 pb-2 font-mono text-[10px] tracking-wide text-neutral-400 uppercase">
          My Calendars
        </p>
        {CALENDARS.map((cal) => (
          <button
            key={cal.kind}
            onClick={() => toggle(cal.kind)}
            className="flex items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs text-neutral-700 hover:bg-black/[0.04]"
          >
            <span
              className={cn(
                "flex size-3.5 items-center justify-center rounded-[4px] transition-colors",
                enabled[cal.kind] ? cal.check : "border border-neutral-300 bg-white"
              )}
            >
              {enabled[cal.kind] && <Check className="size-2.5 text-white" strokeWidth={3.5} />}
            </span>
            {cal.label}
            <span className="ml-auto font-mono text-[10px] text-neutral-400">
              {EVENTS.filter((e) => e.kind === cal.kind).length}
            </span>
          </button>
        ))}
        <div className="mt-auto px-1 font-mono text-[10px] leading-relaxed text-neutral-400">
          {visible.length} events
          <br />
          2023 — present
        </div>
      </div>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
          <div className="flex rounded-lg bg-black/[0.05] p-0.5">
            {VIEWS.map((view) => (
              <span
                key={view}
                className={cn(
                  "rounded-md px-2.5 py-0.5 text-xs",
                  view === "Year"
                    ? "bg-white font-semibold text-neutral-800 shadow-sm"
                    : "text-neutral-400"
                )}
              >
                {view}
              </span>
            ))}
          </div>
          <span className="ml-auto rounded-md bg-black/[0.05] px-2.5 py-1 font-mono text-[11px] text-neutral-500">
            Today: now @ Endeavor
          </span>
        </div>

        {/* Agenda grouped by year */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <LayoutGroup>
            <AnimatePresence mode="popLayout" initial={false}>
              {years.map((year) => (
                <motion.section
                  key={year}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={LAYOUT_SPRING}
                  className="mb-5"
                >
                  <motion.div
                    layout="position"
                    className="sticky top-0 z-10 -mx-2 mb-1.5 flex items-baseline gap-2 rounded-md bg-white/80 px-2 py-1 backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-bold tracking-tight text-neutral-900">{year}</h3>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {visible.filter((e) => e.year === year).length}{" "}
                      {visible.filter((e) => e.year === year).length === 1 ? "event" : "events"}
                    </span>
                  </motion.div>
                  <div className="space-y-1.5">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {visible
                        .filter((e) => e.year === year)
                        .map((event) => {
                          const cal = CALENDARS.find((c) => c.kind === event.kind)!
                          const key = `${event.role}-${event.org}`
                          const isOpen = expanded === key
                          return (
                            <motion.div
                              key={key}
                              layout
                              initial={{ opacity: 0, scale: 0.97 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.13 } }}
                              transition={LAYOUT_SPRING}
                              className={cn(
                                "overflow-hidden rounded-lg transition-colors",
                                isOpen
                                  ? "bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.05]"
                                  : "hover:bg-black/[0.03]"
                              )}
                            >
                              <button
                                onClick={() => setExpanded(isOpen ? null : key)}
                                className="flex w-full gap-2.5 px-2.5 py-2 text-left"
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 w-1 shrink-0 self-stretch rounded-full",
                                    cal.bar
                                  )}
                                />
                                <motion.div layout="position" className="min-w-0 flex-1">
                                  <div className="flex items-baseline justify-between gap-3">
                                    <p className="truncate text-sm font-semibold text-neutral-900">
                                      {event.role}
                                      <span className="font-normal text-neutral-400"> · </span>
                                      <span className="font-normal text-neutral-600">
                                        {event.org}
                                      </span>
                                    </p>
                                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] text-neutral-400">
                                      {event.period}
                                      {event.ongoing && (
                                        <span className="inline-block size-1.5 animate-pulse rounded-full bg-red-400" />
                                      )}
                                      <ChevronRight
                                        className={cn(
                                          "size-3 text-neutral-300 transition-transform duration-200",
                                          isOpen && "rotate-90"
                                        )}
                                      />
                                    </span>
                                  </div>
                                </motion.div>
                              </button>
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={LAYOUT_SPRING}
                                    className="overflow-hidden"
                                  >
                                    <p className="px-2.5 pb-2.5 pl-6 text-xs leading-relaxed text-neutral-500">
                                      {event.detail}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )
                        })}
                    </AnimatePresence>
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>
          </LayoutGroup>
          {visible.length === 0 && (
            <p className="py-10 text-center font-mono text-xs text-neutral-400">
              all calendars hidden — check one on the left
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export { TimelineApp }
