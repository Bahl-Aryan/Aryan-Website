"use client"

import { Coffee } from "lucide-react"

function TextEditApp() {
  return (
    <div className="flex h-full flex-col">
      {/* Ruler, because TextEdit */}
      <div className="flex h-5 items-end gap-[7px] overflow-hidden border-b border-black/[0.08] bg-black/[0.03] px-3">
        {Array.from({ length: 60 }, (_, i) => (
          <span
            key={i}
            className={i % 8 === 0 ? "h-2.5 w-px bg-neutral-400" : "h-1.5 w-px bg-neutral-300"}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white/70 px-8 py-6 font-serif text-[15px] leading-relaxed text-neutral-800">
        <p className="mb-4 font-mono text-[11px] text-neutral-400">coffee.txt — edited today</p>
        <p>hi.</p>
        <p className="mt-4">
          if you&apos;re in san francisco, let&apos;s grab a coffee. i like talking about ml, infra,
          and why software should be a little gooey.
        </p>
        <p className="mt-4">first round&apos;s on me.</p>
        <p className="mt-6">
          <a
            href="mailto:bahlaryan@gmail.com?subject=coffee%20in%20sf%3F"
            className="inline-flex items-center gap-1.5 text-[#2563eb] underline underline-offset-2"
          >
            <Coffee className="size-3.5" />
            bahlaryan@gmail.com
          </a>
        </p>
        <p className="mt-8 font-mono text-[11px] text-neutral-400">— aryan</p>
      </div>
    </div>
  )
}

export { TextEditApp }
