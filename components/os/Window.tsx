"use client"

import React, { useCallback, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { animate, motion, useMotionValue, type TargetAndTransition } from "framer-motion"
import { APPS } from "@/lib/os/apps"
import { useWindowManager, type AppId, type Bounds } from "@/lib/os/window-manager"
import { useReducedMotionPref } from "@/lib/useReducedMotionPref"
import { cn } from "@/lib/utils"

const MENUBAR_H = 40
const DOCK_CLEARANCE = 96
const GENESIS_SPRING = { type: "spring", stiffness: 300, damping: 24, mass: 0.9 } as const
const BOUNDS_SPRING = { type: "spring", stiffness: 380, damping: 34 } as const

let cascadeCount = 0

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"

// Sequoia-style edge tiling: drag to an edge → translucent preview → release
type SnapZone = "left" | "right" | "top"

function zoneBounds(zone: SnapZone): Bounds {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const y = MENUBAR_H + 6
  const h = vh - MENUBAR_H - DOCK_CLEARANCE - 6
  if (zone === "top") return { x: 12, y, w: vw - 24, h }
  if (zone === "left") return { x: 8, y, w: vw / 2 - 12, h }
  return { x: vw / 2 + 4, y, w: vw / 2 - 12, h }
}

function detectZone(px: number, py: number): SnapZone | null {
  const vw = window.innerWidth
  if (vw < 640) return null
  if (py <= MENUBAR_H + 2) return "top"
  if (px <= 10) return "left"
  if (px >= vw - 10) return "right"
  return null
}

const RESIZE_HANDLES: { dir: ResizeDir; className: string }[] = [
  { dir: "n", className: "top-0 left-3 right-3 h-1.5 cursor-ns-resize" },
  { dir: "s", className: "bottom-0 left-3 right-3 h-1.5 cursor-ns-resize" },
  { dir: "e", className: "right-0 top-3 bottom-3 w-1.5 cursor-ew-resize" },
  { dir: "w", className: "left-0 top-3 bottom-3 w-1.5 cursor-ew-resize" },
  { dir: "ne", className: "top-0 right-0 size-3.5 cursor-nesw-resize" },
  { dir: "nw", className: "top-0 left-0 size-3.5 cursor-nwse-resize" },
  { dir: "se", className: "bottom-0 right-0 size-3.5 cursor-nwse-resize" },
  { dir: "sw", className: "bottom-0 left-0 size-3.5 cursor-nesw-resize" },
]

function computeInitialBounds(appId: AppId): Bounds {
  const def = APPS[appId]
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw < 640) {
    return { x: 10, y: MENUBAR_H + 8, w: vw - 20, h: vh - MENUBAR_H - DOCK_CLEARANCE - 16 }
  }
  const w = Math.min(def.defaultSize.w, vw - 48)
  const h = Math.min(def.defaultSize.h, vh - MENUBAR_H - DOCK_CLEARANCE - 24)
  const offset = (cascadeCount++ % 5) * 28
  return {
    x: Math.max(16, (vw - w) / 2 + offset - 56),
    y: Math.max(MENUBAR_H + 8, (vh - DOCK_CLEARANCE - h) / 2 + offset * 0.6),
    w,
    h,
  }
}

function OSWindow({ appId }: { appId: AppId }) {
  const app = APPS[appId]
  const wm = useWindowManager()
  const prefersReducedMotion = useReducedMotionPref()
  const entry = wm.windows[appId]
  const isFocused = wm.topApp === appId

  // Live bounds are owned by motion values so drag/resize never re-renders React.
  const [initialBounds] = useState<Bounds>(() => wm.getBounds(appId) ?? computeInitialBounds(appId))
  const x = useMotionValue(initialBounds.x)
  const y = useMotionValue(initialBounds.y)
  const w = useMotionValue(initialBounds.w)
  const h = useMotionValue(initialBounds.h)
  const prevBounds = useRef<Bounds | null>(null) // pre-maximize bounds
  const [maximized, setMaximized] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [snapZone, setSnapZone] = useState<SnapZone | null>(null)
  const snapRef = useRef<SnapZone | null>(null)
  // Bumped after each interaction so render-time exit math reads fresh positions
  const [, setRev] = useState(0)

  const commitBounds = useCallback(() => {
    wm.setBounds(appId, { x: x.get(), y: y.get(), w: w.get(), h: h.get() })
    setRev((r) => r + 1)
  }, [appId, wm, x, y, w, h])

  // ── Genesis: spring out of the dock icon ─────────────────────
  const genesis = useMemo(() => {
    const icon = wm.getDockIconRect(appId)
    if (!icon || prefersReducedMotion) return { dx: 0, dy: 0 }
    return {
      dx: icon.left + icon.width / 2 - (initialBounds.x + initialBounds.w / 2),
      dy: icon.top + icon.height / 2 - (initialBounds.y + initialBounds.h / 2),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Exit: genie back into the dock icon (resolved at exit time) ──
  const getExitTarget = useCallback((): TargetAndTransition => {
    const icon = wm.getDockIconRect(appId)
    const reason = wm.getExitReason(appId)
    if (prefersReducedMotion || !icon || reason === "close") {
      return {
        scale: 0.92,
        opacity: 0,
        transition: { duration: prefersReducedMotion ? 0.01 : 0.16, ease: "easeIn" },
      }
    }
    return {
      x: icon.left + icon.width / 2 - (x.get() + w.get() / 2),
      y: icon.top + icon.height / 2 - (y.get() + h.get() / 2),
      scale: 0.05,
      opacity: 0,
      transition: { type: "spring", stiffness: 360, damping: 32, opacity: { duration: 0.28 } },
    }
  }, [appId, wm, prefersReducedMotion, x, y, w, h])

  // ── Dragging via the titlebar (with edge tiling) ─────────────
  const handleTitlebarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || maximized) return
      if ((e.target as HTMLElement).closest("button")) return
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      setDragging(true)
      const start = { px: e.clientX, py: e.clientY, x: x.get(), y: y.get(), w: w.get(), h: h.get() }

      const onMove = (ev: PointerEvent) => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        x.set(Math.min(Math.max(start.x + ev.clientX - start.px, -w.get() + 96), vw - 96))
        y.set(Math.min(Math.max(start.y + ev.clientY - start.py, MENUBAR_H), vh - 48))
        const zone = detectZone(ev.clientX, ev.clientY)
        if (zone !== snapRef.current) {
          snapRef.current = zone
          setSnapZone(zone)
        }
      }
      const onUp = () => {
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerup", onUp)
        setDragging(false)
        const zone = snapRef.current
        snapRef.current = null
        setSnapZone(null)
        if (zone) {
          const target = zoneBounds(zone)
          const spring = prefersReducedMotion ? { duration: 0.01 } : BOUNDS_SPRING
          animate(x, target.x, spring)
          animate(y, target.y, spring)
          animate(w, target.w, spring)
          animate(h, target.h, spring)
          if (zone === "top") {
            // Tiling to the top behaves like zoom: green light / dbl-click restores
            prevBounds.current = { x: start.x, y: start.y, w: start.w, h: start.h }
            setMaximized(true)
          }
          setTimeout(commitBounds, 350)
        } else {
          commitBounds()
        }
      }
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerup", onUp)
    },
    [maximized, x, y, w, h, commitBounds, prefersReducedMotion]
  )

  // ── Resizing from edges and corners ──────────────────────────
  const handleResizePointerDown = useCallback(
    (dir: ResizeDir) => (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || maximized) return
      e.stopPropagation()
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      const start = { px: e.clientX, py: e.clientY, x: x.get(), y: y.get(), w: w.get(), h: h.get() }
      const { minSize } = app

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - start.px
        const dy = ev.clientY - start.py
        const vw = window.innerWidth
        const vh = window.innerHeight

        if (dir.includes("e")) w.set(Math.min(Math.max(start.w + dx, minSize.w), vw - start.x - 8))
        if (dir.includes("s")) h.set(Math.min(Math.max(start.h + dy, minSize.h), vh - start.y - 8))
        if (dir.includes("w")) {
          const nw = Math.min(Math.max(start.w - dx, minSize.w), start.x + start.w - 8)
          w.set(nw)
          x.set(start.x + start.w - nw)
        }
        if (dir.includes("n")) {
          const nh = Math.min(Math.max(start.h - dy, minSize.h), start.y + start.h - MENUBAR_H)
          h.set(nh)
          y.set(start.y + start.h - nh)
        }
      }
      const onUp = () => {
        el.removeEventListener("pointermove", onMove)
        el.removeEventListener("pointerup", onUp)
        commitBounds()
      }
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerup", onUp)
    },
    [maximized, app, x, y, w, h, commitBounds]
  )

  // ── Maximize / restore ───────────────────────────────────────
  const toggleMaximize = useCallback(() => {
    const spring = prefersReducedMotion ? { duration: 0.01 } : BOUNDS_SPRING
    if (!maximized) {
      prevBounds.current = { x: x.get(), y: y.get(), w: w.get(), h: h.get() }
      animate(x, 12, spring)
      animate(y, MENUBAR_H + 6, spring)
      animate(w, window.innerWidth - 24, spring)
      animate(h, window.innerHeight - MENUBAR_H - DOCK_CLEARANCE - 6, spring)
      setMaximized(true)
    } else {
      const prev = prevBounds.current ?? computeInitialBounds(appId)
      animate(x, prev.x, spring)
      animate(y, prev.y, spring)
      animate(w, prev.w, spring)
      animate(h, prev.h, spring)
      setMaximized(false)
    }
    setTimeout(commitBounds, 350)
  }, [maximized, appId, x, y, w, h, commitBounds, prefersReducedMotion])

  if (!entry) return null
  const AppContent = app.component
  const previewBounds = dragging && snapZone ? zoneBounds(snapZone) : null

  return (
    <motion.div
      style={{ x, y, width: w, height: h, zIndex: entry.z }}
      className="pointer-events-auto fixed top-0 left-0"
      onPointerDownCapture={() => wm.focusApp(appId)}
      data-no-desktop-menu
    >
      {/* Snap preview (portaled out — this wrapper's transform would trap `fixed`) */}
      {previewBounds &&
        typeof document !== "undefined" &&
        createPortal(
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none fixed z-[51] rounded-2xl border border-white/45 bg-white/15 shadow-[inset_0_0_40px_rgba(255,255,255,0.1)] backdrop-blur-[2px]"
            style={{
              left: previewBounds.x,
              top: previewBounds.y,
              width: previewBounds.w,
              height: previewBounds.h,
            }}
          />,
          document.body
        )}
      <motion.div
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white/80 backdrop-blur-2xl",
          "border-black/[0.08] dark:border-white/[0.12] dark:bg-[#28282c]/90",
          isFocused
            ? "shadow-[0_28px_90px_-18px_rgba(0,0,0,0.32),0_4px_18px_rgba(0,0,0,0.08)]"
            : "shadow-[0_16px_50px_-16px_rgba(0,0,0,0.18)]"
        )}
        initial={
          prefersReducedMotion
            ? { opacity: 0 }
            : { x: genesis.dx, y: genesis.dy, scale: 0.05, opacity: 0, borderRadius: 32 }
        }
        animate={{
          x: 0,
          y: 0,
          scale: dragging ? 1.012 : 1,
          opacity: 1,
          borderRadius: 16,
        }}
        variants={{ exit: (resolve: () => TargetAndTransition) => resolve() }}
        custom={getExitTarget}
        exit="exit"
        transition={
          prefersReducedMotion
            ? { duration: 0.01 }
            : { ...GENESIS_SPRING, opacity: { duration: 0.22, ease: "easeOut" } }
        }
      >
        {/* ─── Titlebar ─── */}
        <div
          className={cn(
            "relative flex h-10 shrink-0 touch-none items-center border-b border-black/[0.06] px-3 select-none dark:border-white/[0.08]",
            !maximized && "cursor-grab active:cursor-grabbing"
          )}
          onPointerDown={handleTitlebarPointerDown}
          onDoubleClick={toggleMaximize}
        >
          {/* Traffic lights */}
          <div className="group flex items-center gap-2">
            <button
              aria-label={`Close ${app.title}`}
              onClick={() => wm.closeApp(appId)}
              className={cn(
                "flex size-3 items-center justify-center rounded-full transition-colors",
                isFocused ? "bg-[#ff5f57]" : "bg-black/15 dark:bg-white/20"
              )}
            >
              <span className="text-[8px] leading-none text-black/0 transition-colors group-hover:text-black/50">
                ×
              </span>
            </button>
            <button
              aria-label={`Minimize ${app.title}`}
              onClick={() => wm.minimizeApp(appId)}
              className={cn(
                "flex size-3 items-center justify-center rounded-full transition-colors",
                isFocused ? "bg-[#febc2e]" : "bg-black/15 dark:bg-white/20"
              )}
            >
              <span className="text-[8px] leading-none text-black/0 transition-colors group-hover:text-black/50">
                −
              </span>
            </button>
            <button
              aria-label={`Zoom ${app.title}`}
              onClick={toggleMaximize}
              className={cn(
                "flex size-3 items-center justify-center rounded-full transition-colors",
                isFocused ? "bg-[#28c840]" : "bg-black/15 dark:bg-white/20"
              )}
            >
              <span className="text-[8px] leading-none text-black/0 transition-colors group-hover:text-black/50">
                +
              </span>
            </button>
          </div>
          <span
            className={cn(
              "pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-xs tracking-wide",
              isFocused
                ? "text-neutral-600 dark:text-neutral-300"
                : "text-neutral-400 dark:text-neutral-500"
            )}
          >
            {app.title.toLowerCase()}
          </span>
        </div>

        {/* ─── App content ─── */}
        <div
          className={cn(
            "@container min-h-0 flex-1 overflow-y-auto overscroll-contain text-neutral-800",
            !app.alwaysDark && "app-surface"
          )}
        >
          <AppContent />
        </div>

        {/* ─── Resize handles ─── */}
        {!maximized &&
          RESIZE_HANDLES.map(({ dir, className }) => (
            <div
              key={dir}
              className={cn("absolute z-10 touch-none", className)}
              onPointerDown={handleResizePointerDown(dir)}
            />
          ))}
      </motion.div>
    </motion.div>
  )
}

export { OSWindow }
