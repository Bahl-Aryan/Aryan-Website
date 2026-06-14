"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

type Project = {
  id: string
  name: string
  tagline: string
  stack: string[]
  points: string[]
  metric?: string
  link?: { label: string; href: string }
}

const PROJECTS: Project[] = [
  {
    id: "lead-enrichment",
    name: "Lead Enrichment Workflow",
    tagline: "block-based pipelines to replace manual data scraping",
    stack: ["Celery", "Redis", "FastAPI", "Next.js"],
    points: [
      "built a tool where users configure scraping and enrichment pipelines from blocks, with full run history tracking.",
      "stays reliable under flaky third-party apis with celery and redis, idempotent task guarantees and retry semantics.",
    ],
  },
  {
    id: "speaking-assistant",
    name: "Public Speaking Assistant",
    tagline: "structured feedback on how you actually sound",
    stack: ["React", "Django", "TensorFlow", "MongoDB", "S3"],
    points: [
      "full-stack platform where you privately upload speech recordings and get feedback across clarity, enthusiasm, engagement, and assertiveness.",
      "cut analysis latency by parallelizing the ml classification and offloading file storage to s3.",
    ],
  },
  {
    id: "vae-protein",
    name: "Protein Structure VAE",
    tagline: "compressing protein structures with deep learning",
    stack: ["PyTorch", "Python", "VAEs"],
    points: [
      "built and benchmarked variational autoencoders for protein structure compression as an ml research assistant at illinois tech.",
    ],
  },
  {
    id: "this-website",
    name: "aryanOS (this site)",
    tagline: "the thing you are currently inside of",
    stack: ["Next.js", "TypeScript", "Framer Motion", "Tailwind"],
    points: [
      "a portfolio as a desktop os. draggable, resizable windows that spring out of the dock, spotlight search, and a notes app i can update live.",
      "no scrolling was harmed in the making of this website.",
    ],
    link: { label: "source on github", href: "https://github.com/Bahl-Aryan/Aryan-Website" },
  },
]

function ProjectsApp() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = PROJECTS.find((p) => p.id === selectedId)

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden w-44 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-black/[0.06] bg-black/[0.025] p-2 @md:flex">
        <p className="px-2 pt-1 pb-1.5 font-mono text-[10px] tracking-wide text-neutral-400 uppercase">
          Favorites
        </p>
        <button
          onClick={() => setSelectedId(null)}
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
            !selected ? "bg-blue-500/90 text-white" : "text-neutral-600 hover:bg-black/[0.05]"
          )}
        >
          <Folder className="size-3.5 shrink-0" />
          All Projects
        </button>
        {PROJECTS.map((project) => (
          <button
            key={project.id}
            onClick={() => setSelectedId(project.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs",
              selected?.id === project.id
                ? "bg-blue-500/90 text-white"
                : "text-neutral-600 hover:bg-black/[0.05]"
            )}
          >
            <Folder
              className={cn(
                "size-3.5 shrink-0",
                selected?.id === project.id ? "text-white" : "text-[#3e9eff]"
              )}
            />
            <span className="truncate">{project.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-3 py-2">
          <button
            onClick={() => setSelectedId(null)}
            disabled={!selected}
            aria-label="Back"
            className="rounded p-0.5 text-neutral-400 transition-colors enabled:text-neutral-600 enabled:hover:bg-black/[0.05]"
          >
            <ChevronLeft className="size-4" />
          </button>
          <ChevronRight className="size-4 text-neutral-300" />
          <span className="text-xs font-semibold text-neutral-700">
            {selected ? selected.name : "Projects"}
          </span>
          <span className="ml-auto font-mono text-[10px] text-neutral-400">
            {PROJECTS.length} items
          </span>
        </div>

        {selected ? (
          // ── Detail view ──
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
              {selected.name}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">{selected.tagline}</p>
            {selected.metric && (
              <span className="mt-3 inline-block rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] text-emerald-600">
                {selected.metric}
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-500"
                >
                  {tech}
                </span>
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {selected.points.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-neutral-600">
                  <span className="mt-[7px] size-1 shrink-0 rounded-full bg-[#3e9eff]" />
                  {point}
                </li>
              ))}
            </ul>
            {selected.link && (
              <a
                href={selected.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 font-mono text-xs text-[#1e7fe8] underline-offset-2 hover:underline"
              >
                <ExternalLink className="size-3" />
                {selected.link.label}
              </a>
            )}
          </div>
        ) : (
          // ── Icon grid view ──
          <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-2 overflow-y-auto p-4 @lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedId(project.id)}
                className="group flex flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-colors hover:bg-blue-500/10"
              >
                <Folder className="size-12 fill-[#7cc4ff] text-[#3e9eff]" strokeWidth={1} />
                <span className="line-clamp-2 text-xs leading-tight font-medium text-neutral-700">
                  {project.name}
                </span>
                <span className="line-clamp-1 font-mono text-[10px] text-neutral-400">
                  {project.stack[0]}
                  {project.stack.length > 1 ? ` +${project.stack.length - 1}` : ""}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Status bar */}
        <div className="border-t border-black/[0.06] px-3 py-1.5 font-mono text-[10px] text-neutral-400">
          Macintosh HD › Users › aryan › Projects{selected ? ` › ${selected.name}` : ""}
        </div>
      </div>
    </div>
  )
}

export { ProjectsApp }
