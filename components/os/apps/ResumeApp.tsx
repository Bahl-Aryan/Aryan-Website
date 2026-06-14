"use client"

import { useState } from "react"
import {
  Download,
  ExternalLink,
  Highlighter,
  PanelLeft,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const RESUME_PATH = "/Aryan_Bahl_Resume.pdf"
const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200]

function ToolbarButton({
  children,
  onClick,
  disabled,
  label,
  href,
  download,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  label: string
  href?: string
  download?: string
}) {
  const className = cn(
    "flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors",
    disabled ? "cursor-default text-neutral-300" : "hover:bg-black/[0.06] hover:text-neutral-700"
  )
  if (href)
    return (
      <a
        href={href}
        download={download}
        target={download ? undefined : "_blank"}
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        className={className}
      >
        {children}
      </a>
    )
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={className}
    >
      {children}
    </button>
  )
}

function ResumeApp() {
  const [zoomIdx, setZoomIdx] = useState(2) // 100%
  const zoom = ZOOM_LEVELS[zoomIdx]

  return (
    <div className="flex h-full flex-col">
      {/* Preview.app toolbar */}
      <div className="relative flex items-center gap-1 border-b border-black/[0.08] bg-neutral-100/80 px-2 py-1.5">
        <ToolbarButton label="Sidebar (it's a one-page résumé)" disabled>
          <PanelLeft className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-black/[0.08]" />

        <ToolbarButton
          label="Zoom out"
          onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
          disabled={zoomIdx === 0}
        >
          <ZoomOut className="size-4" />
        </ToolbarButton>
        <span className="w-12 text-center font-mono text-[11px] text-neutral-500 tabular-nums">
          {zoom}%
        </span>
        <ToolbarButton
          label="Zoom in"
          onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
          disabled={zoomIdx === ZOOM_LEVELS.length - 1}
        >
          <ZoomIn className="size-4" />
        </ToolbarButton>

        <span className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 text-xs font-medium text-neutral-600 @lg:block">
          Aryan_Bahl_Resume.pdf · Page 1 of 1
        </span>

        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton label="Markup (the résumé is already perfect)" disabled>
            <Highlighter className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Search (just read it, it's one page)" disabled>
            <Search className="size-4" />
          </ToolbarButton>
          <div className="mx-1 h-5 w-px bg-black/[0.08]" />
          <ToolbarButton label="Open in new tab" href={RESUME_PATH}>
            <ExternalLink className="size-4" />
          </ToolbarButton>
          <ToolbarButton label="Download" href={RESUME_PATH} download="Aryan_Bahl_Resume.pdf">
            <Download className="size-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Document on a Preview-gray backdrop */}
      <div className="relative min-h-0 flex-1 bg-neutral-300/70">
        <iframe
          key={zoom}
          src={`${RESUME_PATH}#toolbar=0&view=FitH&zoom=${zoom}`}
          title="Aryan Bahl résumé"
          className="size-full"
        />
      </div>
    </div>
  )
}

export { ResumeApp }
