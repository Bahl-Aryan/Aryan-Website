"use client"

import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { useWindowManager } from "@/lib/os/window-manager"

const SPECS: [string, string][] = [
  ["Chip", "Apple M2 Pro"],
  ["Memory", "16GB, mostly browser tabs"],
  ["Now", "building at endeavor"],
  ["School", "MCS @ UIUC, dec 2026"],
  ["Base", "san francisco bay area"],
  ["Editor", "vscode → neovim (in progress)"],
  ["Serial number", "bahlaryan@gmail.com"],
]

const STACK = ["python", "aws", "postgres", "redis", "docker", "typescript"]

function AboutApp() {
  const { openApp } = useWindowManager()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <motion.div
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
        transition={{ duration: 0.4 }}
        className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-semibold text-white shadow-lg"
      >
        AB
      </motion.div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">aryanOS</h2>
        <p className="mt-0.5 font-mono text-xs text-neutral-400">Version 1.0 (Aryan Bahl)</p>
      </div>

      <p className="max-w-xs text-sm leading-relaxed text-neutral-600">
        i love ml and infra. distributed pipelines, agentic runtimes, and the unglamorous plumbing
        that makes products feel fast.
      </p>

      <div className="flex max-w-xs flex-wrap items-center justify-center gap-1.5">
        {STACK.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-black/[0.05] px-2.5 py-0.5 font-mono text-[11px] text-neutral-600"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="w-full max-w-xs space-y-1.5">
        {SPECS.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 text-xs">
            <span className="shrink-0 font-semibold text-neutral-500">{key}</span>
            <span className="truncate text-neutral-700">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <a
          href="mailto:bahlaryan@gmail.com?subject=hello%20from%20aryanOS"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white transition-transform hover:scale-[1.03]"
        >
          <Send className="size-3.5" />
          say hi
        </a>
        <button
          onClick={() => openApp("resume")}
          className="rounded-lg bg-black/[0.06] px-4 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.1]"
        >
          More Info…
        </button>
      </div>
    </div>
  )
}

export { AboutApp }
