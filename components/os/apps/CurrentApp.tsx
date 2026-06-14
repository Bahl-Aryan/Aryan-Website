"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

type Process = {
  name: string
  detail: string
  cpu: number // base value; live value jitters around it
  threads: number
  status: "running" | "idle"
  since: string
}

const PROCESSES: Process[] = [
  {
    name: "endeavor_integrations",
    detail:
      "building ai for the physical world at endeavor. own production integrations for five enterprise clients (~$400k contract value), doing po extraction, matching, and erp write-back.",
    cpu: 38.2,
    threads: 5,
    status: "running",
    since: "Mar 2026",
  },
  {
    name: "agentic_ingestion_runtime",
    detail:
      "an agentic ingestion runtime for a multi-tenant ontology platform. langgraph stategraph wrapping claude via deepagents, redis checkpointer for mid-run resume, langsmith tracing per run.",
    cpu: 24.6,
    threads: 8,
    status: "running",
    since: "Apr 2026",
  },
  {
    name: "step_functions_migration",
    detail:
      "re-architected an always-on ecs worker into an event-driven step functions orchestrator. 90% cheaper, and killed a 20% job-failure rate.",
    cpu: 14.1,
    threads: 3,
    status: "running",
    since: "Mar 2026",
  },
  {
    name: "mcs_uiuc",
    detail: "finishing my master's in cs at uiuc.",
    cpu: 12.4,
    threads: 4,
    status: "running",
    since: "until Dec 2026",
  },
  {
    name: "learn_neovim",
    detail: "trying to get better at neovim. exiting vim is the easy part now.",
    cpu: 6.8,
    threads: 1,
    status: "running",
    since: "recently",
  },
  {
    name: "this_website",
    detail: "a portfolio that thinks it's an operating system. you're inside it right now.",
    cpu: 8.9,
    threads: 2,
    status: "running",
    since: "Jun 2026",
  },
  {
    name: "sleep",
    detail: "deprioritized, but i'm working on it.",
    cpu: 1.8,
    threads: 1,
    status: "idle",
    since: "2021",
  },
]

const TABS = ["CPU", "Memory", "Energy", "Disk", "Network"]
const HISTORY_LEN = 36

function Sparkline({ history }: { history: number[] }) {
  const max = 120
  const points = history
    .map((v, i) => `${(i / (HISTORY_LEN - 1)) * 100},${30 - (Math.min(v, max) / max) * 28}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-9 w-full">
      <polyline
        points={`0,30 ${points} 100,30`}
        fill="url(#loadFill)"
        stroke="none"
        opacity="0.35"
      />
      <polyline
        points={points}
        fill="none"
        stroke="#19b84c"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <defs>
        <linearGradient id="loadFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#19b84c" />
          <stop offset="100%" stopColor="#19b84c" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function CurrentApp() {
  const [expanded, setExpanded] = useState<string | null>(PROCESSES[0].name)
  const [live, setLive] = useState<Record<string, number>>(() =>
    Object.fromEntries(PROCESSES.map((p) => [p.name, p.cpu]))
  )
  const historyRef = useRef<number[]>([])
  const [history, setHistory] = useState<number[]>(() => Array(HISTORY_LEN).fill(0))

  // Jitter the numbers like a real Activity Monitor
  useEffect(() => {
    const tick = () => {
      setLive(() => {
        const next: Record<string, number> = {}
        for (const p of PROCESSES) {
          const jitter = (Math.random() - 0.5) * p.cpu * 0.35
          next[p.name] = Math.max(0.1, p.cpu + jitter)
        }
        const total = Object.values(next).reduce((a, b) => a + b, 0)
        historyRef.current = [...historyRef.current.slice(-(HISTORY_LEN - 1)), total]
        setHistory([
          ...Array(Math.max(0, HISTORY_LEN - historyRef.current.length)).fill(0),
          ...historyRef.current,
        ])
        return next
      })
    }
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1600)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const totalCpu = Object.values(live).reduce((sum, v) => sum + v, 0)

  return (
    <div className="flex h-full flex-col">
      {/* Tab strip */}
      <div className="flex items-center gap-1 border-b border-black/[0.06] px-3 py-2">
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs",
              i === 0 ? "bg-black/[0.07] font-semibold text-neutral-800" : "text-neutral-400"
            )}
          >
            {tab}
          </span>
        ))}
        <span className="ml-auto font-mono text-[10px] text-neutral-400">
          what&apos;s running on my brain
        </span>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_64px_64px_88px] gap-2 border-b border-black/[0.06] bg-black/[0.02] px-4 py-1.5 font-mono text-[10px] tracking-wide text-neutral-400 uppercase @max-md:grid-cols-[1fr_64px]">
        <span>Process Name</span>
        <span className="text-right">% Brain</span>
        <span className="text-right @max-md:hidden">Threads</span>
        <span className="text-right @max-md:hidden">Since</span>
      </div>

      {/* Process rows */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {PROCESSES.map((proc, i) => (
          <motion.button
            key={proc.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: "easeOut" }}
            onClick={() => setExpanded(expanded === proc.name ? null : proc.name)}
            className={cn(
              "block w-full border-b border-black/[0.04] text-left transition-colors",
              expanded === proc.name ? "bg-blue-50/80" : "hover:bg-black/[0.025]"
            )}
          >
            <div className="grid grid-cols-[1fr_64px_64px_88px] items-center gap-2 px-4 py-2 @max-md:grid-cols-[1fr_64px]">
              <span className="flex items-center gap-2 truncate font-mono text-xs text-neutral-800">
                <motion.span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    proc.status === "running" ? "bg-emerald-500" : "bg-neutral-300"
                  )}
                  animate={
                    proc.status === "running"
                      ? { opacity: [1, 0.4, 1], scale: [1, 0.85, 1] }
                      : undefined
                  }
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
                {proc.name}
              </span>
              <span className="text-right font-mono text-xs text-neutral-600 tabular-nums">
                {(live[proc.name] ?? proc.cpu).toFixed(1)}
              </span>
              <span className="text-right font-mono text-xs text-neutral-400 tabular-nums @max-md:hidden">
                {proc.threads}
              </span>
              <span className="truncate text-right font-mono text-[11px] text-neutral-400 @max-md:hidden">
                {proc.since}
              </span>
            </div>
            <AnimatePresence initial={false}>
              {expanded === proc.name && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 pl-7 text-xs leading-relaxed text-neutral-500">
                    {proc.detail}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* Footer: live load graph */}
      <div className="border-t border-black/[0.06] px-4 pt-2 pb-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400">
          <span>System: shipping</span>
          <motion.span
            key={Math.round(totalCpu)}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="tabular-nums"
          >
            Load: {totalCpu.toFixed(1)}%
          </motion.span>
        </div>
        <Sparkline history={history} />
      </div>
    </div>
  )
}

export { CurrentApp }
