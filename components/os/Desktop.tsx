"use client"

import React, { useCallback, useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import {
  Battery,
  Bluetooth,
  FileText,
  Folder,
  Moon,
  Music2,
  Play,
  Radar,
  Search,
  SunMedium,
  Volume2,
  Wifi,
  X,
} from "lucide-react"
import { OSDock } from "@/components/os/Dock"
import { OSWindow } from "@/components/os/Window"
import { MacAppIcon } from "@/components/os/MacIcons"
import { Spotlight } from "@/components/os/Spotlight"
import { APP_ORDER, APPS } from "@/lib/os/apps"
import { useWindowManager, type AppId } from "@/lib/os/window-manager"
import { deliverMessage } from "@/lib/os/message-bus"
import { trashStore } from "@/lib/os/trash-store"
import { useReducedMotionPref } from "@/lib/useReducedMotionPref"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// Wallpapers - vivid gradients with slow-drifting color fields.
// ─────────────────────────────────────────────────────────────
const WALLPAPERS = [
  {
    // Default: clean purple → pink
    name: "Bloom",
    gradient: "linear-gradient(150deg,#4a1d8f 0%,#7a2bd1 34%,#b83ba8 66%,#ec6aa6 100%)",
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

// Soft, cohesive purple/pink color fields so the default wallpaper reads as one
// palette rather than a rainbow.
const BLOBS = [
  {
    size: "70vmax",
    color: "rgba(255, 110, 200, 0.42)", // pink
    from: { top: "-25%", left: "-15%" },
    drift: { x: [0, 80, -40, 0], y: [0, 60, 100, 0] },
    duration: 34,
  },
  {
    size: "60vmax",
    color: "rgba(150, 90, 255, 0.4)", // violet
    from: { bottom: "-30%", right: "-10%" },
    drift: { x: [0, -90, 30, 0], y: [0, -60, -20, 0] },
    duration: 40,
  },
  {
    size: "50vmax",
    color: "rgba(255, 150, 190, 0.3)", // rose
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
  // Classic macOS: the chosen item blinks twice before the menu closes
  const [flashing, setFlashing] = useState<number | null>(null)
  const isFlashing = flashing !== null

  const select = (index: number, item: Extract<MenuItem, { divider?: false }>) => {
    if (isFlashing) return
    setFlashing(index)
    setTimeout(() => setFlashing(null), 70)
    setTimeout(() => setFlashing(index), 140)
    setTimeout(() => {
      item.action?.()
      onClose()
    }, 240)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.12 }}
      className={cn(
        "absolute top-full z-50 mt-1.5 min-w-52 rounded-xl border border-black/[0.08] bg-[#f3f3f6] p-1 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.45)] dark:border-white/[0.12] dark:bg-[#2b2b2f]",
        align === "left" ? "left-0" : "right-0"
      )}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="mx-2 my-1 h-px bg-black/[0.08] dark:bg-white/[0.1]" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => select(i, item)}
            className={cn(
              "flex w-full items-center justify-between gap-6 rounded-lg px-2.5 py-1 text-left text-[13px]",
              item.disabled
                ? "cursor-default text-neutral-400 dark:text-neutral-500"
                : isFlashing
                  ? flashing === i
                    ? "bg-[#2563eb] text-white"
                    : "text-neutral-800 dark:text-neutral-200"
                  : "text-neutral-800 hover:bg-[#2563eb] hover:text-white dark:text-neutral-200"
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

// ─────────────────────────────────────────────────────────────
// Control Center - the real macOS layout, with a working
// dark-mode toggle and display-brightness slider.
// ─────────────────────────────────────────────────────────────
// macOS-style slider: white fill follows the knob, icon lives inside the track
function CCSlider({
  value,
  onChange,
  icon: Icon,
  label,
  min = 0,
}: {
  value: number
  onChange: (value: number) => void
  icon: React.ComponentType<{ className?: string }>
  label: string
  min?: number
}) {
  const trackRef = React.useRef<HTMLDivElement>(null)

  const setFromClientX = useCallback(
    (clientX: number) => {
      const rect = trackRef.current?.getBoundingClientRect()
      if (!rect) return
      const pct = Math.round(((clientX - rect.left) / rect.width) * 100)
      onChange(Math.min(100, Math.max(min, pct)))
    },
    [onChange, min]
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setFromClientX(e.clientX)
    const onMove = (ev: PointerEvent) => setFromClientX(ev.clientX)
    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={100}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(100, value + 5))
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(min, value - 5))
      }}
      className="relative h-[22px] w-full cursor-pointer touch-none overflow-hidden rounded-full bg-black/[0.12] shadow-[inset_0_0.5px_2px_rgba(0,0,0,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 dark:bg-white/[0.14] dark:shadow-[inset_0_0.5px_2px_rgba(0,0,0,0.4)]"
    >
      {/* white fill, knob is its rounded leading edge */}
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-white"
        style={{ width: `max(${value}%, 22px)` }}
      />
      {/* knob definition: a shadowed circle sitting at the fill edge */}
      <div
        className="absolute top-1/2 size-[20px] -translate-y-1/2 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(0,0,0,0.06)]"
        style={{ left: `calc(max(${value}%, 22px) - 21px)` }}
      />
      <Icon className="pointer-events-none absolute top-1/2 left-[5px] size-3 -translate-y-1/2 text-neutral-500" />
    </div>
  )
}

function CCTile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-black/[0.05] p-2.5 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)] dark:bg-white/[0.08] dark:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      {children}
    </div>
  )
}

function ControlCenter({
  theme,
  onToggleTheme,
  brightness,
  onBrightness,
}: {
  theme: "light" | "dark"
  onToggleTheme: (x: number, y: number) => void
  brightness: number
  onBrightness: (value: number) => void
}) {
  const { openApp } = useWindowManager()
  const [volume, setVolume] = useState(60)
  const isDark = theme === "dark"

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={{ duration: 0.15 }}
      className="absolute top-full right-0 z-50 mt-1.5 w-[300px] rounded-2xl border border-black/[0.08] bg-[#f0f0f3] p-2.5 text-neutral-800 shadow-[0_22px_60px_-12px_rgba(0,0,0,0.5)] dark:border-white/[0.12] dark:bg-[#222226] dark:text-neutral-100"
    >
      <div className="grid grid-cols-2 gap-2">
        {/* Connectivity */}
        <CCTile className="space-y-2.5">
          {[
            { icon: Wifi, label: "Wi-Fi", detail: "Home Wi-Fi", on: true },
            { icon: Bluetooth, label: "Bluetooth", detail: "On", on: true },
            { icon: Radar, label: "AirDrop", detail: "it's a website", on: false },
          ].map(({ icon: Icon, label, detail, on }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  on
                    ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
                    : "bg-black/[0.12] text-neutral-500 dark:bg-white/[0.14] dark:text-neutral-400"
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] leading-tight font-semibold">{label}</span>
                <span className="block truncate text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
                  {detail}
                </span>
              </span>
            </div>
          ))}
        </CCTile>

        <div className="flex flex-col gap-2">
          {/* Focus */}
          <CCTile className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black/[0.12] text-neutral-500 dark:bg-white/[0.14] dark:text-neutral-300">
              <Moon className="size-3.5 fill-current" />
            </span>
            <span>
              <span className="block text-[12px] leading-tight font-semibold">Focus</span>
              <span className="block text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
                shipping
              </span>
            </span>
          </CCTile>

          {/* Dark mode - the functional one */}
          <button onClick={(e) => onToggleTheme(e.clientX, e.clientY)} className="flex-1 text-left">
            <CCTile
              className={cn(
                "flex h-full flex-col items-start justify-between transition-colors",
                isDark && "bg-white text-neutral-900 dark:bg-white dark:text-neutral-900"
              )}
            >
              {isDark ? (
                <Moon className="size-4 fill-fuchsia-500 text-fuchsia-500" />
              ) : (
                <SunMedium className="size-4 text-neutral-500" />
              )}
              <span
                className={cn(
                  "text-[11px] leading-tight font-semibold",
                  isDark && "text-fuchsia-500"
                )}
              >
                Dark Mode
                <span className="block text-[10px] font-normal opacity-60">
                  {isDark ? "On" : "Off"}
                </span>
              </span>
            </CCTile>
          </button>
        </div>
      </div>

      {/* Display */}
      <CCTile className="mt-2">
        <p className="mb-1.5 px-0.5 text-[12px] font-semibold">Display</p>
        <CCSlider
          value={brightness}
          onChange={onBrightness}
          icon={SunMedium}
          label="Display brightness"
          min={30}
        />
      </CCTile>

      {/* Sound (the slider works; the audio is imaginary) */}
      <CCTile className="mt-2">
        <p className="mb-1.5 px-0.5 text-[12px] font-semibold">Sound</p>
        <CCSlider value={volume} onChange={setVolume} icon={Volume2} label="Volume" />
      </CCTile>

      {/* Now playing → opens Music */}
      <button onClick={() => openApp("music")} className="mt-2 w-full text-left">
        <CCTile className="flex items-center gap-2.5 transition-colors hover:bg-black/[0.08] dark:hover:bg-white/[0.12]">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#fc5c7d] to-[#fa2d48] text-white">
            <Music2 className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] leading-tight font-semibold">
              Not how it seems
            </span>
            <span className="block truncate text-[10px] leading-tight text-neutral-500 dark:text-neutral-400">
              CapzLock · open Music
            </span>
          </span>
          <Play className="size-4 fill-current text-neutral-500 dark:text-neutral-300" />
        </CCTile>
      </button>
    </motion.div>
  )
}

function MenuBar({
  onSpotlight,
  onSleep,
  onNextWallpaper,
  theme,
  onToggleTheme,
  brightness,
  onBrightness,
}: {
  onSpotlight: () => void
  onSleep: () => void
  onNextWallpaper: () => void
  theme: "light" | "dark"
  onToggleTheme: (x: number, y: number) => void
  brightness: number
  onBrightness: (value: number) => void
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
      { label: "Shut Down…", disabled: true },
    ],
    File: [
      { label: "New Finder Window", action: () => wm.openApp("projects"), shortcut: "⌘N" },
      { label: "New Note", action: () => wm.openApp("notes") },
      { label: "New Terminal", action: () => wm.openApp("terminal") },
      { divider: true },
      { label: "Close All Windows", action: () => visibleApps.forEach((id) => wm.closeApp(id)) },
    ],
    Edit: [
      { label: "Undo", disabled: true, shortcut: "⌘Z" },
      { label: "Copy", disabled: true, shortcut: "⌘C" },
      { label: "Paste", disabled: true, shortcut: "⌘V" },
      { divider: true },
      { label: "Find Aryan", action: () => wm.openApp("contact"), shortcut: "⌘F" },
    ],
    View: [
      { label: "Change Wallpaper", action: onNextWallpaper },
      { divider: true },
      { label: "Enter Full Screen", disabled: true },
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
      { label: "aryanOS Help", action: () => wm.openApp("terminal") },
      { label: "Keyboard Shortcuts: ⌘K · ⌥W · ⌥M · ⌘`", disabled: true },
      { divider: true },
      { label: "Email Aryan", action: () => window.open("mailto:bahlaryan@gmail.com") },
    ],
    battery: [
      { label: "Battery: 100%", disabled: true },
      { label: "Power Source: Battery", disabled: true },
    ],
    wifi: [
      { label: "Wi-Fi: connected", disabled: true },
      { label: "Network: Home Wi-Fi", disabled: true },
    ],
  }

  // Hover-switching is a left-menu behavior (File → Edit → View…); the
  // right-side status items (battery, wifi, control center) open on click only.
  const LEFT_MENUS = ["logo", "File", "Edit", "View", "Go", "Window", "Help"]

  const menuButton = (name: string, display: React.ReactNode, align: "left" | "right" = "left") => (
    <div key={name} className="relative flex h-full items-center">
      <button
        onClick={() => setOpenMenu(openMenu === name ? null : name)}
        onMouseEnter={() =>
          openMenu &&
          openMenu !== name &&
          LEFT_MENUS.includes(openMenu) &&
          LEFT_MENUS.includes(name) &&
          setOpenMenu(name)
        }
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
        className="absolute inset-x-0 top-0 z-40 flex h-8 items-stretch justify-between bg-white/10 px-2 text-white backdrop-blur-xl select-none dark:bg-black/25"
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
          {/* Control Center */}
          <div className="relative flex h-full items-center">
            <button
              onClick={() => setOpenMenu(openMenu === "control" ? null : "control")}
              aria-label="Control Center"
              className={cn(
                "flex h-6 items-center rounded px-2 transition-colors",
                openMenu === "control" ? "bg-white/25" : "hover:bg-white/15"
              )}
            >
              <svg viewBox="0 0 18 18" className="size-[15px] text-white/90" fill="currentColor">
                <rect x="1" y="2.5" width="16" height="5.5" rx="2.75" fillOpacity="0.95" />
                <circle cx="5" cy="5.25" r="2" fill="#00000055" />
                <rect x="1" y="10" width="16" height="5.5" rx="2.75" fillOpacity="0.95" />
                <circle cx="13" cy="12.75" r="2" fill="#00000055" />
              </svg>
            </button>
            <AnimatePresence>
              {openMenu === "control" && (
                <ControlCenter
                  theme={theme}
                  onToggleTheme={onToggleTheme}
                  brightness={brightness}
                  onBrightness={onBrightness}
                />
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={onSpotlight}
            aria-label="Spotlight Search (⌘K)"
            title="Search — ⌘K"
            className="flex items-center gap-1 rounded px-2 transition-colors hover:bg-white/15"
          >
            <Search className="size-4 text-white/90" />
            <span className="hidden font-mono text-[11px] text-white/70 sm:inline">⌘K</span>
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
// Desktop widgets - Sonoma style, top-left.
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
    <div className="group flex size-36 flex-col items-center justify-center rounded-[24px] border border-white/20 bg-black/30 shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
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
      <span className="mt-0.5 text-[10px] font-medium text-white/80 tabular-nums">
        <span className="group-hover:hidden">san francisco</span>
        <span className="hidden group-hover:inline">
          {now?.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </span>
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
      <div className="size-36 rounded-[24px] border border-white/20 bg-white/80 backdrop-blur-xl dark:bg-[#2b2b2f]/85" />
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
      className="size-36 rounded-[24px] border border-white/20 bg-white/85 p-3 text-left shadow-[0_12px_36px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform hover:scale-[1.03] dark:bg-[#2b2b2f]/85"
    >
      <p className="text-[10px] font-bold tracking-wide text-[#fa2d48] uppercase">
        {today.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric" })}
      </p>
      <div className="mt-1 grid grid-cols-7 gap-y-px text-center text-[7.5px] leading-[11px]">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="font-semibold text-neutral-400 dark:text-neutral-500">
            {d}
          </span>
        ))}
        {cells.map((day, i) => (
          <span
            key={i}
            className={cn(
              "text-neutral-600 dark:text-neutral-300",
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
        className="fixed z-[59] min-w-52 rounded-xl border border-black/[0.08] bg-[#f3f3f6] p-1 shadow-[0_18px_50px_-10px_rgba(0,0,0,0.45)] dark:border-white/[0.12] dark:bg-[#2b2b2f]"
      >
        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="mx-2 my-1 h-px bg-black/[0.08] dark:bg-white/[0.1]" />
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
                  ? "cursor-default text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-800 hover:bg-[#2563eb] hover:text-white dark:text-neutral-200"
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
  const { openApp, requestAttention } = useWindowManager()
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

    // Each notification fires once per browser, not once per page load
    const once = (key: string, fire: () => void) => {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, "1")
      fire()
    }

    timers.push(
      setTimeout(
        () =>
          once("aryanos-welcomed", () =>
            push(
              {
                id: 1,
                appId: "about",
                title: "Welcome to aryanOS",
                body: "welcome to my portfolio. take a look around.",
              },
              8000
            )
          ),
        2200
      )
    )
    timers.push(
      setTimeout(
        () =>
          once("aryanos-coffee-invited", () => {
            // Messages bounces in the dock until the "text" is read
            requestAttention("contact")
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
            )
          }),
        30000
      )
    )
    return () => timers.forEach(clearTimeout)
  }, [dismiss, openApp, requestAttention])

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
            className="group/notice rounded-2xl border border-white/30 bg-white/80 p-3 shadow-[0_14px_40px_-10px_rgba(0,0,0,0.4)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#2b2b2f]/90"
          >
            <div className="flex items-start gap-2.5">
              <div className="size-8 shrink-0">
                <MacAppIcon appId={notice.appId} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                  {notice.title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-neutral-600 dark:text-neutral-400">
                  {notice.body}
                </p>
              </div>
              <button
                onClick={() => dismiss(notice.id)}
                aria-label="Dismiss notification"
                className="hidden rounded-full p-0.5 text-neutral-400 group-hover/notice:block hover:bg-black/[0.06] dark:hover:bg-white/[0.1]"
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
                    className="rounded-lg bg-black/[0.06] px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-black/[0.12] dark:bg-white/[0.1] dark:text-neutral-200 dark:hover:bg-white/[0.16]"
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
// Desktop icons - click to open (this is a website, not a Mac™).
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
  const wm = useWindowManager()
  const [files, setFiles] = useState(DESKTOP_FILES)

  // Files restored from the Trash reappear on the desktop
  useEffect(() => {
    return trashStore.onRestore((file) => setFiles((prev) => [...prev, file]))
  }, [])

  const handleDragEnd = (file: (typeof DESKTOP_FILES)[number], point: { x: number; y: number }) => {
    const rect = wm.getDockIconRect("trash")
    if (
      rect &&
      point.x >= rect.left - 14 &&
      point.x <= rect.right + 14 &&
      point.y >= rect.top - 14 &&
      point.y <= rect.bottom + 14
    ) {
      trashStore.trash(file)
      setFiles((prev) => prev.filter((f) => f.name !== file.name))
      wm.requestAttention("trash")
    }
  }

  return (
    <div className="absolute top-12 right-4 z-0 flex flex-col items-end gap-4">
      <AnimatePresence>
        {files.map((file) => (
          <DesktopIconButton
            key={file.name}
            file={file}
            onOpen={() => wm.openApp(file.appId)}
            onDragEnd={(point) => handleDragEnd(file, point)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function DesktopIconButton({
  file,
  onOpen,
  onDragEnd,
}: {
  file: (typeof DESKTOP_FILES)[number]
  onOpen: () => void
  onDragEnd: (point: { x: number; y: number }) => void
}) {
  // framer can fire onTap after a drag; suppress opens that follow one
  const draggedRef = React.useRef(false)

  return (
    <motion.button
      drag
      dragMomentum={false}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.1, zIndex: 60 }}
      exit={{ opacity: 0, scale: 0.3, transition: { duration: 0.25 } }}
      onDragStart={() => {
        draggedRef.current = true
      }}
      onDragEnd={(_, info) => {
        onDragEnd(info.point)
        setTimeout(() => {
          draggedRef.current = false
        }, 0)
      }}
      onTap={() => {
        if (!draggedRef.current) onOpen()
      }}
      className="group flex w-20 cursor-grab flex-col items-center gap-1 active:cursor-grabbing"
    >
      <div className="rounded-lg p-1.5 transition-colors group-hover:bg-white/20">
        <FileGlyph kind={file.kind} />
      </div>
      <span className="max-w-full truncate rounded px-1.5 py-px text-[11px] font-medium text-white transition-colors [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] group-hover:bg-[#2563eb] group-hover:[text-shadow:none]">
        {file.name}
      </span>
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────
// Sleep overlay - click or any key to wake.
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
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [brightness, setBrightness] = useState(100)

  // Restore saved appearance
  useEffect(() => {
    const id = setTimeout(() => {
      if (localStorage.getItem("aryanos-theme") === "dark") setTheme("dark")
    }, 0)
    return () => clearTimeout(id)
  }, [])

  const toggleTheme = useCallback((x: number, y: number) => {
    const apply = () =>
      setTheme((prev) => {
        const next = prev === "light" ? "dark" : "light"
        localStorage.setItem("aryanos-theme", next)
        return next
      })

    // Circular reveal from the toggle, where the browser supports it
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.style.setProperty("--reveal-x", `${x}px`)
      document.documentElement.style.setProperty("--reveal-y", `${y}px`)
      doc.startViewTransition(() => flushSync(apply))
    } else {
      apply()
    }
  }, [])
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
    // Only the bare desktop gets the custom menu - windows, dock, and
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
      className={cn("absolute inset-0 overflow-hidden", theme === "dark" && "dark")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      onContextMenu={handleContextMenu}
      onPointerDown={handleDesktopPointerDown}
    >
      <Wallpaper index={wallpaper} />
      {/* Dark mode dims the wallpaper a touch */}
      <motion.div
        className="pointer-events-none absolute inset-0 bg-black"
        animate={{ opacity: theme === "dark" ? 0.32 : 0 }}
        transition={{ duration: 0.5 }}
      />
      <div className="boot-noise" style={{ opacity: 0.05 }} />
      <MenuBar
        onSpotlight={toggleSpotlight}
        onSleep={() => setAsleep(true)}
        onNextWallpaper={nextWallpaper}
        theme={theme}
        onToggleTheme={toggleTheme}
        brightness={brightness}
        onBrightness={setBrightness}
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

      {/* Display brightness (Control Center slider) - dims everything below the menu bar */}
      {brightness < 100 && (
        <div
          className="pointer-events-none absolute inset-0 z-[35] bg-black"
          style={{ opacity: ((100 - brightness) / 100) * 0.65 }}
        />
      )}

      <Notifications />
      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <SleepOverlay asleep={asleep} onWake={wake} />

      {ctxMenu && (
        <ContextMenu
          position={ctxMenu}
          onClose={() => setCtxMenu(null)}
          items={[
            { label: "New Folder", disabled: true },
            { label: "Get Info", action: () => wm.openApp("about") },
            { divider: true },
            { label: "Change Wallpaper", action: nextWallpaper },
            { label: "Sort By: Name", disabled: true },
            { label: "Clean Up", disabled: true },
            { divider: true },
            { label: "Open Terminal Here", action: () => wm.openApp("terminal") },
          ]}
        />
      )}
    </motion.div>
  )
}

export { Desktop }
