"use client"

import { Download } from "lucide-react"

const RESUME_PATH = "/Aryan_Bahl_Resume.pdf"

function ResumeApp() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-2">
        <span className="font-mono text-[10px] text-neutral-400">Aryan_Bahl_Resume.pdf</span>
        <a
          href={RESUME_PATH}
          download="Aryan_Bahl_Resume.pdf"
          className="flex items-center gap-1.5 rounded-md bg-violet-50 px-2.5 py-1 font-mono text-[11px] text-violet-600 transition-colors hover:bg-violet-100"
        >
          <Download className="size-3" />
          download
        </a>
      </div>
      <iframe
        src={`${RESUME_PATH}#toolbar=0&view=FitH`}
        title="Aryan Bahl résumé"
        className="min-h-0 w-full flex-1 bg-neutral-100"
      />
    </div>
  )
}

export { ResumeApp }
