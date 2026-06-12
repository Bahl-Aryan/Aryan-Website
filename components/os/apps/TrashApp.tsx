"use client"

import { useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, FileX2, Folder, Undo2 } from "lucide-react"
import { trashStore, type DesktopFile } from "@/lib/os/trash-store"

const JUNK = [
  { name: "scrollable_landing_page.fig", reason: "we don't scroll here" },
  { name: "apple_hello_boot_animation.tsx", reason: "5 seconds is a long time" },
  { name: "placeholder_metrics.json", reason: "never fabricate" },
]

function FileIcon({ kind }: { kind: DesktopFile["kind"] }) {
  if (kind === "folder") return <Folder className="size-4 shrink-0 fill-[#7cc4ff] text-[#3e9eff]" />
  return <FileText className="size-4 shrink-0 text-neutral-400" />
}

function TrashApp() {
  const [junk, setJunk] = useState(JUNK)
  const trashed = useSyncExternalStore(trashStore.subscribe, trashStore.getTrashed, () => [])
  const itemCount = junk.length + trashed.length

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-2">
        <span className="font-mono text-[10px] text-neutral-400">
          {itemCount === 0 ? "Trash is empty" : `${itemCount} items`}
        </span>
        <button
          onClick={() => {
            setJunk([])
            trashStore.empty()
          }}
          disabled={itemCount === 0}
          className="rounded-md bg-black/[0.06] px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-black/[0.1] disabled:opacity-40"
        >
          Empty Trash
        </button>
      </div>

      {itemCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <FileX2 className="size-8 text-neutral-300" />
          <p className="text-sm font-medium text-neutral-600">Trash is empty</p>
          <p className="font-mono text-[11px] text-neutral-400">i ship everything else</p>
        </div>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {/* Files dragged here from the desktop — restorable */}
          <AnimatePresence>
            {trashed.map((file) => (
              <motion.div
                key={file.name}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="group/row flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-black/[0.04]"
              >
                <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-neutral-700">
                  <FileIcon kind={file.kind} />
                  <span className="truncate">{file.name}</span>
                </span>
                <button
                  onClick={() => trashStore.putBack(file.name)}
                  className="flex shrink-0 items-center gap-1 rounded-md bg-black/[0.06] px-2 py-0.5 font-mono text-[10px] text-neutral-600 opacity-0 transition-opacity group-hover/row:opacity-100 hover:bg-black/[0.1]"
                >
                  <Undo2 className="size-3" />
                  Put Back
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* The permanent residents */}
          <AnimatePresence>
            {junk.map((item) => (
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
