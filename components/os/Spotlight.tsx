"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Search } from "lucide-react"
import { MacAppIcon } from "@/components/os/MacIcons"
import { APPS, SPOTLIGHT_APPS } from "@/lib/os/apps"
import { useWindowManager, type AppId } from "@/lib/os/window-manager"
import { cn } from "@/lib/utils"

// The panel mounts fresh each time Spotlight opens, so query/selection
// state needs no reset logic.
function SpotlightPanel({ onClose }: { onClose: () => void }) {
  const { openApp } = useWindowManager()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  const results = SPOTLIGHT_APPS.filter((id) => {
    const app = APPS[id]
    return (
      !q ||
      app.title.toLowerCase().includes(q) ||
      app.dockLabel.toLowerCase().includes(q) ||
      app.spotlight.toLowerCase().includes(q)
    )
  })
  const selectedIndex = Math.min(selected, Math.max(results.length - 1, 0))

  // Keep the keyboard-selected row visible in the scrollable list
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-spotlight-idx="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const launch = (appId: AppId) => {
    openApp(appId)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelected(Math.min(selectedIndex + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelected(Math.max(selectedIndex - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      launch(results[selectedIndex])
    } else if (e.key === "Escape") {
      onClose()
    }
  }

  return (
    <motion.div
      className="w-[min(560px,90vw)] overflow-hidden rounded-2xl border border-white/30 bg-white/70 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      initial={{ scale: 0.92, y: -12 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 border-b border-black/[0.06] px-4 py-3">
        <Search className="size-5 text-neutral-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Spotlight Search"
          className="flex-1 bg-transparent text-lg text-neutral-800 placeholder-neutral-400 outline-none"
        />
      </div>
      <div ref={listRef} className="max-h-[320px] overflow-y-auto p-1.5">
        {results.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-xs text-neutral-400">
            no results — but the dock has everything
          </p>
        ) : (
          results.map((appId, i) => (
            <button
              key={appId}
              data-spotlight-idx={i}
              onClick={() => launch(appId)}
              onMouseEnter={() => setSelected(i)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left",
                i === selectedIndex ? "bg-[#2563eb] text-white" : "text-neutral-800"
              )}
            >
              <div className="size-8 shrink-0">
                <MacAppIcon appId={appId} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{APPS[appId].title}</p>
                <p
                  className={cn(
                    "truncate font-mono text-[11px]",
                    i === selectedIndex ? "text-white/70" : "text-neutral-400"
                  )}
                >
                  {APPS[appId].spotlight}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="flex items-center justify-between border-t border-black/[0.06] px-4 py-2 font-mono text-[10px] text-neutral-400">
        <span>↑↓ navigate · ↩ open · esc close</span>
        <span>⌥W close window · ⌥M minimize · ⌘` cycle</span>
      </div>
    </motion.div>
  )
}

function Spotlight({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[60] flex items-start justify-center pt-[18vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <SpotlightPanel onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Spotlight }
