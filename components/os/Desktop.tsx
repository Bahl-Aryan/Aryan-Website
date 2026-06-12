"use client"

import React, { useCallback, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Battery, FileText, Folder, Search, Wifi, X } from "lucide-react"
import { OSDock } from "@/components/os/Dock"
import { OSWindow } from "@/components/os/Window"
import { MacAppIcon } from "@/components/os/MacIcons"
import { Spotlight } from "@/components/os/Spotlight"
import { APP_ORDER, APPS } from "@/lib/os/apps"
import { useWindowManager, type AppId } from "@/lib/os/window-manager"
import { deliverMessage } from "@/lib/os/message-bus"
import { useReducedMotionPref } from "@/lib/useReducedMotionPref"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// Wallpapers — vivid gradients with slow-drifting color fields.
// ─────────────────────────────────────────────────────────────
const WALLPAPERS = [
  {
    name: "Bloom",
    gradient: "linear-gradient(150deg,#3b1d8f 0%,#7a2bd1 35%,#c33aa0 70%,#e8602c 100%)",
  },
  {
    name: "Reef",
    gradient: "linear-gradient(160deg,#06205c 0%,#0e57a3 40%,#0fb8ad 75%,#71e07e 100%)",
  },
  {
    name: "Dusk",
    gradient: "linear-gradient(155deg,#10081f 0%,#3b1d5e 40%,#a83a6e 75%,#ffb36b 100%)",
  },
  {
    name: "Midnight",
    gradient: "linear-gradient(160deg,#0a0a14 0%,#1b1b3a 45%,#3b2a63 80%,#5b3b8a 100%)",
  },
]

const BLOBS = [
  {
    size: "70vmax",
    color: "rgba(255, 94, 247, 0.5)",
    from: { top: "-25%", left: "-15%" },
    drift: { x: [0, 80, -40, 0], y: [0, 60, 100, 0] },
    duration: 34,
  },
  {
    size: "60vmax",
    color: "rgba(2, 245, 255, 0.38)",
    from: { bottom: "-30%", right: "-10%" },
    drift: { x: [0, -90, 30, 0], y: [0, -60, -20, 0] },
    duration: 40,
  },
  {
    size: "50vmax",
    color: "rgba(255, 166, 0, 0.32)",
    from: { top: "20%", right: "10%" },
    drift: { x: [0, 60, -80, 0], y: [0, 90, 40, 0] },
    duration: 46,
  },
]

function Wallpaper({ index }: { index: number }) {
  const prefersReducedMotion = useReducedMotionPref()
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      animate={{ background: WALLPAPERS[index].gradient }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{ background: WALLPAPERS[index].gradient }}
    >
      {BLOBS.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full mix-blend-screen"
          style={{
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 65%)`,
            ...blob.from,
          }}
          animate={prefersReducedMotion ? undefined : blob.drift}
          transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,5,30,0.4)_100%)]" />
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// Menu bar with real dropdowns.
// ─────────────────────────────────────────────────────────────
type MenuItem =
  | { divider: true }
  | { divider?: false; label: string; action?: () => void; disabled?: boolean; shortcut?: string }

function MenuDropdown({
  items,
  onClose,
  align = "left",
}: {
  items: MenuItem[]
  onClose: () => void
  align?: "left" | "right"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.12 }}
      className={cn(
        "absolute top-full z-50 mt-1.5 min-w-52 rounded-xl border border-white/25 bg-white/75 p-1 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
        align === "left" ? "left-0" : "right-0"
      )}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="mx-2 my-1 h-px bg-black/[0.08]" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => {
              item.action?.()
              onClose()
            }}
            className={cn(
              "flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1 text-left text-[13px]",
              item.disabled
                ? "cursor-default text-neutral-400"
                : "text-neutral-800 hover:bg-[#2563eb] hover:text-white"
            )}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span className="font-mono text-[11px] opacity-50">{item.shortcut}</span>
            )}
          </button>
        )
      )}
    </motion.div>
  )
}

function MenuBar({
  onSpotlight,
  onSleep,
  onNextWallpaper,
}: {
  onSpotlight: () => void
  onSleep: () => void
  onNextWallpaper: () => void
}) {
  const wm = useWindowManager()
  const [now, setNow] = useState<Date | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const first = setTimeout(tick, 0) // async first tick avoids a hydration mismatch
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const visibleApps = APP_ORDER.filter((id) => wm.windows[id]?.open && !wm.windows[id]?.minimized)
  const close = () => setOpenMenu(null)

  const MENUS: Record<string, MenuItem[]> = {
    logo: [
      { label: "About aryanOS", action: () => wm.openApp("about") },
      { divider: true },
      { label: "Change Wallpaper", action: onNextWallpaper },
      { divider: true },
      { label: "Sleep", action: onSleep },
      { label: "Restart…", action: () => window.location.reload() },
      { label: "Shut Down… (please don't)", disabled: true },
    ],
    File: [
      { label: "New Finder Window", action: () => wm.openApp("projects"), shortcut: "⌘N" },
      { label: "New Note", action: () => wm.openApp("notes") },
      { label: "New Terminal", action: () => wm.openApp("terminal") },
      { divider: true },
      { label: "Close All Windows", action: () => visibleApps.forEach((id) => wm.closeApp(id)) },
    ],
    Edit: [
      { label: "Undo Career Choices", disabled: true, shortcut: "⌘Z" },
      { label: "Copy", disabled: true, shortcut: "⌘C" },
      { label: "Paste (from stack overflow)", disabled: true, shortcut: "⌘V" },
      { divider: true },
      { label: "Find Aryan", action: () => wm.openApp("contact"), shortcut: "⌘F" },
    ],
    View: [
      { label: "Change Wallpaper", action: onNextWallpaper },
      { divider: true },
      { label: "Enter Full Screen (it already is)", disabled: true },
    ],
    Go: [
      { label: "Projects", action: () => wm.openApp("projects") },
      { label: "Timeline", action: () => wm.openApp("timeline") },
      { label: "Notes", action: () => wm.openApp("notes") },
      { label: "Messages", action: () => wm.openApp("contact") },
      { label: "Terminal", action: () => wm.openApp("terminal") },
      { divider: true },
      { label: "Résumé", action: () => wm.openApp("resume") },
    ],
    Window: [
      {
        label: "Minimize All",
        action: () => visibleApps.forEach((id) => wm.minimizeApp(id)),
        shortcut: "⌥M",
      },
      {
        label: "Close All",
        action: () => visibleApps.forEach((id) => wm.closeApp(id)),
        shortcut: "⌥W",
      },
      { divider: true },
      ...((visibleApps.length
        ? visibleApps.map((id) => ({
            label: APPS[id].title,
            action: () => wm.focusApp(id),
          }))
        : [{ label: "No open windows", disabled: true }]) as MenuItem[]),
    ],
    Help: [
      { label: "aryanOS Help (open Terminal, type `help`)", action: () => wm.openApp("terminal") },
      { label: "Keyboard Shortcuts (⌘K · ⌥W · ⌥M · ⌘`)", disabled: true },
      { divider: true },
      { label: "Email Aryan", action: () => window.open("mailto:bahlaryan@gmail.com") },
    ],
    battery: [
      { label: "Battery: 100%", disabled: true },
      { label: "Power Source: cold brew", disabled: true },
    ],
    wifi: [
      { label: "Wi-Fi: connected", disabled: true },
      { label: "Network: probably-fine-5G", disabled: true },
    ],
  }

  const menuButton = (name: string, display: React.ReactNode, align: "left" | "right" = "left") => (
    <div key={name} className="relative flex h-full items-center">
      <button
        onClick={() => setOpenMenu(openMenu === name ? null : name)}
        onMouseEnter={() => openMenu && openMenu !== name && setOpenMenu(name)}
        className={cn(
          "flex h-6 items-center rounded px-2 text-[13px] leading-none transition-colors",
          openMenu === name ? "bg-white/25" : "hover:bg-white/15"
        )}
      >
        {display}
      </button>
      <AnimatePresence>
        {openMenu === name && <MenuDropdown items={MENUS[name]} onClose={close} align={align} />}
      </AnimatePresence>
    </div>
  )

  return (
    <>
      {/* click-away layer while a menu is open */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={close} />}
      <div
        className="absolute inset-x-0 top-0 z-40 flex h-8 items-stretch justify-between bg-white/10 px-2 text-white backdrop-blur-xl select-none"
        data-no-desktop-menu
      >
        <div className="flex items-stretch gap-0.5">
          {menuButton(
            "logo",
            <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-gradient-to-br from-violet-400 to-fuchsia-400 text-[10px] font-bold tracking-tight text-white shadow-sm">
              ab
            </span>
          )}
          <span className="flex items-center px-1.5 text-[13px] leading-none font-bold tracking-tight">
            {wm.topApp ? APPS[wm.topApp].title : "Finder"}
          </span>
          <div className="hidden items-stretch gap-0.5 md:flex">
            {["File", "Edit", "View", "Go", "Window", "Help"].map((name) => menuButton(name, name))}
          </div>
        </div>
        <div className="flex items-stretch gap-0.5">
          {menuButton(
            "battery",
            <Battery className="size-[17px] text-white/90" aria-label="Battery" />,
            "right"
          )}
          {menuButton(
            "wifi",
            <Wifi className="size-4 text-white/90" aria-label="Wi-Fi" />,
            "right"
          )}
          <button
            onClick={onSpotlight}
            aria-label="Spotlight"
            className="flex items-center rounded px-2 transition-colors hover:bg-white/15"
          >
            <Search className="size-4 text-white/90" />
          </button>
          <span className="flex items-center px-1.5 text-[13px] leading-none font-medium tabular-nums">
            {now
              ? now.toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Desktop widgets — Sonoma style, top-left.
// ─────────────────────────────────────────────────────────────
function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
  }, [])

  const seconds = now ? now.getSeconds() : 0
  const minutes = now ? now.getMinutes() : 0
  const hours = now ? now.getHours() % 12 : 10
  const secDeg = seconds * 6
  const minDeg = minutes * 6 + seconds * 0.1
  const hourDeg = hours * 30 + minutes * 0.5

  return (
    <div className="flex size-36 flex-col items-center justify-center rounded-[24px] border border-white/20 bg-black/30 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <svg viewBox="0 0 100 100" className="size-24">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.95)" />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1="50"
            y1="8"
            x2="50"
            y2={i % 3 === 0 ? "15" : "12"}
            stroke="#999"
            strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
            transform={`rotate(${i * 30} 50 50)`}
          />
        ))}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="27"
          stroke="#1a1a1a"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourDeg} 50 50)`}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="16"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${minDeg} 50 50)`}
        />
        <line
          x1="50"
          y1="56"
          x2="50"
          y2="14"
          stroke="#fa2d48"
          strokeWidth="1.5"
          strokeLinecap="round"
          transform={`rotate(${secDeg} 50 50)`}
        />
        <circle cx="50" cy="50" r="2.5" fill="#fa2d48" />
      </svg>
      <span className="mt-0.5 text-[10px] font-medium text-white/80">san francisco</span>
    </div>
  )
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"]

function CalendarWidget() {
  const { openApp } = useWindowManager()
  const [today, setToday] = useState<Date | null>(null)
  useEffect(() => {
    const id = setTimeout(() => setToday(new Date()), 0)
    return () => clearTimeout(id)
  }, [])

  if (!today)
    return (
      <div className="size-36 rounded-[24px] border border-white/20 bg-white/80 backdrop-blur-xl" />
    )

  const year = today.getFullYear()
  const month = today.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <button
      onClick={() => openApp("timeline")}
      className="size-36 rounded-[24px] border border-white/20 bg-white/85 p-3 text-left shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform hover:scale-[1.03]"
    >
      <p className="text-[10px] font-bold tracking-wide text-[#fa2d48] uppercase">
        {today.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </p>
      <div className="mt-1 grid grid-cols-7 gap-y-px text-center text-[7.5px] leading-[11px]">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="font-semibold text-neutral-400">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={cn(
              "text-neutral-600",
              day === today.getDate() &&
                "mx-auto flex size-[11px] items-center justify-center rounded-full bg-[#fa2d48] font-bold text-white"
            )}
          >
            {day ?? ""}
          </span>
        ))}
      </div>
    </button>
  )
}

function DesktopWidgets() {
  return (
    <div className="absolute top-12 left-4 z-0 hidden flex-col gap-3 md:flex">
      <ClockWidget />
      <CalendarWidget />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Right-click context menu for the bare desktop.
// ─────────────────────────────────────────────────────────────
function ContextMenu({
  position,
  items,
  onClose,
}: {
  position: { x: number; y: number }
  items: MenuItem[]
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  // Keep the menu inside the viewport
  const style = {
    left: Math.min(position.x, (typeof window !== "undefined" ? window.innerWidth : 1440) - 230),
    top: Math.min(position.y, (typeof window !== "undefined" ? window.innerHeight : 900) - 280),
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[58]"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.1 }}
        style={style}
        className="fixed z-[59] min-w-52 rounded-xl border border-white/25 bg-white/75 p-1 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="mx-2 my-1 h-px bg-black/[0.08]" />
          ) : (
            <button
              key={i}
              disabled={item.disabled}
              onClick={() => {
                item.action?.()
                onClose()
              }}
              className={cn(
                "flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1 text-left text-[13px]",
                item.disabled
                  ? "cursor-default text-neutral-400"
                  : "text-neutral-800 hover:bg-[#2563eb] hover:text-white"
              )}
            >
              {item.label}
            </button>
          )
        )}
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// Notification Center-style toasts.
// ─────────────────────────────────────────────────────────────
type Notice = {
  id: number
  appId: AppId
  title: string
  body: string
  actions?: { label: string; onClick: () => void }[]
}

function Notifications() {
  const { openApp } = useWindowManager()
  const [notices, setNotices] = useState<Notice[]>([])
  const dismiss = useCallback((id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id))
  }, [])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    const push = (notice: Notice, ttl: number) => {
      setNotices((prev) => [...prev, notice])
      timers.push(setTimeout(() => dismiss(notice.id), ttl))
    }

    timers.push(
      setTimeout(
        () =>
          push(
            {
              id: 1,
              appId: "about",
              title: "Welcome to aryanOS",
              body: "poke around — nothing here can break. probably.",
            },
            8000
          ),
        2200
      )
    )
    timers.push(
      setTimeout(
        () =>
          push(
            {
              id: 2,
              appId: "contact",
              title: "Aryan Bahl",
              body: "in sf? let's grab a coffee ☕",
              actions: [
                {
                  label: "Reply",
                  onClick: () => {
                    // Deliver the text into the Messages thread, then open it
                    deliverMessage("in sf? let's grab a coffee ☕")
                    openApp("contact")
                  },
                },
                {
                  label: "Accept",
                  onClick: () => window.open("mailto:bahlaryan@gmail.com?subject=coffee%3F"),
                },
              ],
            },
            18000
          ),
        45000
      )
    )
    return () => timers.forEach(clearTimeout)
  }, [dismiss, openApp])

  return (
    <div className="absolute top-10 right-3 z-[55] flex w-[330px] flex-col gap-2">
      <AnimatePresence>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 90, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="group/notice rounded-2xl border border-white/30 bg-white/70 p-3 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.4)] backdrop-blur-2xl"
          >
            <div className="flex items-start gap-2.5">
              <div className="size-8 shrink-0">
                <MacAppIcon appId={notice.appId} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800">{notice.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-neutral-600">{notice.body}</p>
              </div>
              <button
                onClick={() => dismiss(notice.id)}
                aria-label="Dismiss notification"
                className="hidden rounded-full p-0.5 text-neutral-400 group-hover/notice:block hover:bg-black/[0.06]"
              >
                <X className="size-3.5" />
              </button>
            </div>
            {notice.actions && (
              <div className="mt-2 flex justify-end gap-1.5">
                {notice.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      action.onClick()
                      dismiss(notice.id)
                    }}
                    className="rounded-lg bg-black/[0.06] px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.12]"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Desktop icons — click to open (this is a website, not a Mac™).
// ─────────────────────────────────────────────────────────────
const DESKTOP_FILES: { name: string; appId: AppId; kind: "pdf" | "txt" | "folder" }[] = [
  { name: "Resume.pdf", appId: "resume", kind: "pdf" },
  { name: "coffee.txt", appId: "textedit", kind: "txt" },
  { name: "projects", appId: "projects", kind: "folder" },
]

function FileGlyph({ kind }: { kind: "pdf" | "txt" | "folder" }) {
  if (kind === "folder")
    return (
      <Folder className="size-11 fill-[#7cc4ff] text-[#5ab1ff] drop-shadow-md" strokeWidth={1} />
    )
  return (
    <div className="relative flex h-12 w-10 items-center justify-center rounded-md border border-black/10 bg-white/95 shadow-md">
      <FileText className="size-5 text-neutral-400" strokeWidth={1.5} />
      {kind === "pdf" && (
        <span className="absolute right-0 bottom-1 left-0 text-center text-[8px] font-bold text-red-500">
          PDF
        </span>
      )}
    </div>
  )
}

function DesktopIcons() {
  const { openApp } = useWindowManager()

  return (
    <div className="absolute top-12 right-4 z-0 flex flex-col items-end gap-4">
      {DESKTOP_FILES.map((file) => (
        <motion.button
          key={file.name}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={(e) => {
            e.stopPropagation()
            openApp(file.appId)
          }}
          className="group flex w-20 flex-col items-center gap-1"
        >
          <div className="rounded-lg p-1.5 transition-colors group-hover:bg-white/20">
            <FileGlyph kind={file.kind} />
          </div>
          <span className="max-w-full truncate rounded px-1.5 py-px text-[11px] font-medium text-white transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] group-hover:bg-[#2563eb] group-hover:[text-shadow:none]">
            {file.name}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Sleep overlay — click or any key to wake.
// ─────────────────────────────────────────────────────────────
function SleepOverlay({ asleep, onWake }: { asleep: boolean; onWake: () => void }) {
  const [time, setTime] = useState("")

  useEffect(() => {
    if (!asleep) return
    const tick = () =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }))
    const first = setTimeout(tick, 0)
    const id = setInterval(tick, 1000)
    window.addEventListener("keydown", onWake)
    return () => {
      clearTimeout(first)
      clearInterval(id)
      window.removeEventListener("keydown", onWake)
    }
  }, [asleep, onWake])

  return (
    <AnimatePresence>
      {asleep && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.8 }}
          onClick={onWake}
          className="absolute inset-0 z-[200] flex cursor-pointer flex-col items-center justify-center gap-3 bg-black"
          aria-label="Wake from sleep"
        >
          <motion.span
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-5xl font-light text-white/80 tabular-nums"
          >
            {time}
          </motion.span>
          <span className="font-mono text-[11px] text-white/30">click anywhere to wake</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────────────────────
// Keyboard shortcuts: ⌘K/⌘Space → Spotlight, ⌥W close,
// ⌥M minimize, ⌘` cycle windows.
// ─────────────────────────────────────────────────────────────
function useShortcuts(toggleSpotlight: () => void) {
  const wm = useWindowManager()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if ((meta && e.key.toLowerCase() === "k") || (meta && e.code === "Space")) {
        e.preventDefault()
        toggleSpotlight()
        return
      }
      if (e.altKey && e.code === "KeyW" && wm.topApp) {
        e.preventDefault()
        wm.closeApp(wm.topApp)
        return
      }
      if (e.altKey && e.code === "KeyM" && wm.topApp) {
        e.preventDefault()
        wm.minimizeApp(wm.topApp)
        return
      }
      if (meta && e.key === "`") {
        e.preventDefault()
        const visible = APP_ORDER.filter(
          (id) => wm.windows[id]?.open && !wm.windows[id]?.minimized
        ).sort((a, b) => (wm.windows[a]?.z ?? 0) - (wm.windows[b]?.z ?? 0))
        if (visible.length > 1) wm.focusApp(visible[0])
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [wm, toggleSpotlight])
}

// ─────────────────────────────────────────────────────────────
// Desktop
// ─────────────────────────────────────────────────────────────
function Desktop() {
  const wm = useWindowManager()
  const { windows, anyEverOpened } = wm
  const prefersReducedMotion = useReducedMotionPref()
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [wallpaper, setWallpaper] = useState(0)
  const wallpaperRef = React.useRef(0)
  const [asleep, setAsleep] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null)
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(
    null
  )
  const toggleSpotlight = useCallback(() => setSpotlightOpen((s) => !s), [])
  const wake = useCallback(() => setAsleep(false), [])
  useShortcuts(toggleSpotlight)

  // Rubber-band selection on the bare desktop (cosmetic, but very mac)
  const handleDesktopPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return
    const x0 = e.clientX
    const y0 = e.clientY
    const onMove = (ev: PointerEvent) => setMarquee({ x0, y0, x1: ev.clientX, y1: ev.clientY })
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      setMarquee(null)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only the bare desktop gets the custom menu — windows, dock, and
    // menu bar keep their normal behavior.
    if ((e.target as HTMLElement).closest("[data-no-desktop-menu]")) return
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }, [])

  const nextWallpaper = useCallback(() => {
    const next = (wallpaperRef.current + 1) % WALLPAPERS.length
    wallpaperRef.current = next
    setWallpaper(next)
    return WALLPAPERS[next].name
  }, [])

  // Expose wallpaper/sleep to the rest of the OS (Terminal, menus)
  useEffect(() => {
    wm.setDesktopActions({ nextWallpaper, sleep: () => setAsleep(true) })
  }, [wm, nextWallpaper])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onContextMenu={handleContextMenu}
      onPointerDown={handleDesktopPointerDown}
    >
      <Wallpaper index={wallpaper} />
      <div className="boot-noise" style={{ opacity: 0.05 }} />
      <MenuBar
        onSpotlight={toggleSpotlight}
        onSleep={() => setAsleep(true)}
        onNextWallpaper={nextWallpaper}
      />
      <DesktopWidgets />
      <DesktopIcons />

      {/* Rubber-band selection */}
      {marquee && (
        <div
          className="pointer-events-none absolute z-[5] rounded-[3px] border border-blue-300/70 bg-blue-400/20"
          style={{
            left: Math.min(marquee.x0, marquee.x1),
            top: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
          }}
        />
      )}

      {/* First-run hint */}
      <AnimatePresence>
        {!anyEverOpened && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.2, duration: 0.8 }}
            className="pointer-events-none absolute inset-x-0 bottom-28 z-0 text-center font-mono text-xs text-white/70 select-none"
          >
            everything lives in the dock ↓ &nbsp;·&nbsp; ⌘K to search
          </motion.p>
        )}
      </AnimatePresence>

      {/* Windows (pointer-events pass through the empty layer to the desktop) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <AnimatePresence>
          {APP_ORDER.filter((id) => windows[id]?.open && !windows[id]?.minimized).map((id) => (
            <OSWindow key={id} appId={id} />
          ))}
        </AnimatePresence>
      </div>

      {/* Dock */}
      <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center" data-no-desktop-menu>
        <OSDock />
      </div>

      <Notifications />
      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <SleepOverlay asleep={asleep} onWake={wake} />

      {ctxMenu && (
        <ContextMenu
          position={ctxMenu}
          onClose={() => setCtxMenu(null)}
          items={[
            { label: "New Folder (the desktop is full)", disabled: true },
            { label: "Get Info", action: () => wm.openApp("about") },
            { divider: true },
            { label: "Change Wallpaper", action: nextWallpaper },
            { label: "Sort By: vibes ✓", disabled: true },
            { label: "Clean Up (it's already clean)", disabled: true },
            { divider: true },
            { label: "Open Terminal Here", action: () => wm.openApp("terminal") },
          ]}
        />
      )}
    </motion.div>
  )
}

export { Desktop }
