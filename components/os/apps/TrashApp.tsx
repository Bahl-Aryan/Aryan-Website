"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileX2 } from "lucide-react"

const JUNK = [
  { name: "scrollable_landing_page.fig", reason: "we don't scroll here" },
  { name: "apple_hello_boot_animation.tsx", reason: "5 seconds is a long time" },
  { name: "placeholder_metrics.json", reason: "never fabricate" },
]

function TrashApp() {
  const [items, setItems] = useState(JUNK)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-2">
        <span className="font-mono text-[10px] text-neutral-400">
          {items.length === 0 ? "Trash is empty" : `${items.length} items — recently deleted`}
        </span>
        <button
          onClick={() => setItems([])}
          disabled={items.length === 0}
          className="rounded-md bg-black/[0.06] px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.1] disabled:opacity-40"
        >
          Empty Trash
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <FileX2 className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600">Trash is empty</p>
          <p className="font-mono text-[11px] text-neutral-400">i ship everything else</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.name}
                exit={{ opacity: 0, scale: 0.8, x: 40, transition: { duration: 0.25 } }}
                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-black/[0.04]"
              >
                <span className="truncate font-mono text-xs text-neutral-700">{item.name}</span>
                <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                  {item.reason}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export { TrashApp }
