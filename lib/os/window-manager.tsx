"use client"

import React, { createContext, useCallback, useContext, useRef, useState } from "react"

export type AppId =
  | "current"
  | "projects"
  | "timeline"
  | "notes"
  | "contact"
  | "resume"
  | "about"
  | "terminal"
  | "trash"
  | "textedit"
  | "music"

// Desktop-level actions (wallpaper, sleep) registered by the Desktop so
// other surfaces - the Terminal, menus - can drive them.
export type DesktopActions = {
  nextWallpaper?: () => string
  sleep?: () => void
}

export type Bounds = { x: number; y: number; w: number; h: number }

export type WindowEntry = {
  open: boolean
  minimized: boolean
  z: number
}

type ExitReason = "close" | "minimize"

type WindowManagerValue = {
  windows: Partial<Record<AppId, WindowEntry>>
  topApp: AppId | null
  anyEverOpened: boolean
  attentionApps: AppId[]
  requestAttention: (appId: AppId) => void
  openApp: (appId: AppId) => void
  closeApp: (appId: AppId) => void
  minimizeApp: (appId: AppId) => void
  focusApp: (appId: AppId) => void
  registerDockIcon: (appId: AppId, el: HTMLElement | null) => void
  getDockIconRect: (appId: AppId) => DOMRect | null
  getBounds: (appId: AppId) => Bounds | undefined
  setBounds: (appId: AppId, bounds: Bounds) => void
  getExitReason: (appId: AppId) => ExitReason
  desktopActions: React.MutableRefObject<DesktopActions>
  setDesktopActions: (actions: DesktopActions) => void
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null)

function WindowManagerProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<Partial<Record<AppId, WindowEntry>>>({})
  const [anyEverOpened, setAnyEverOpened] = useState(false)
  const [attentionApps, setAttentionApps] = useState<AppId[]>([])
  const zCounter = useRef(10)
  const dockIcons = useRef(new Map<AppId, HTMLElement>())
  const boundsStore = useRef(new Map<AppId, Bounds>())
  const exitReasons = useRef(new Map<AppId, ExitReason>())
  const desktopActions = useRef<DesktopActions>({})
  const setDesktopActions = useCallback((actions: DesktopActions) => {
    desktopActions.current = actions
  }, [])

  const requestAttention = useCallback((appId: AppId) => {
    setAttentionApps((prev) => (prev.includes(appId) ? prev : [...prev, appId]))
  }, [])

  const openApp = useCallback((appId: AppId) => {
    setAnyEverOpened(true)
    setAttentionApps((prev) => (prev.includes(appId) ? prev.filter((a) => a !== appId) : prev))
    setWindows((prev) => {
      const existing = prev[appId]
      const z = ++zCounter.current
      if (existing?.open && !existing.minimized) {
        // Already visible → just bring to front
        return { ...prev, [appId]: { ...existing, z } }
      }
      return { ...prev, [appId]: { open: true, minimized: false, z } }
    })
  }, [])

  const closeApp = useCallback((appId: AppId) => {
    exitReasons.current.set(appId, "close")
    // Closing discards remembered bounds so the app re-opens fresh
    boundsStore.current.delete(appId)
    setWindows((prev) => ({
      ...prev,
      // Keep z so the window doesn't drop behind others mid-exit-animation
      [appId]: { open: false, minimized: false, z: prev[appId]?.z ?? 0 },
    }))
  }, [])

  const minimizeApp = useCallback((appId: AppId) => {
    exitReasons.current.set(appId, "minimize")
    setWindows((prev) => {
      const existing = prev[appId]
      if (!existing?.open) return prev
      return { ...prev, [appId]: { ...existing, minimized: true } }
    })
  }, [])

  const focusApp = useCallback((appId: AppId) => {
    setWindows((prev) => {
      const existing = prev[appId]
      if (!existing?.open) return prev
      if (existing.z === zCounter.current) return prev
      return { ...prev, [appId]: { ...existing, z: ++zCounter.current } }
    })
  }, [])

  const registerDockIcon = useCallback((appId: AppId, el: HTMLElement | null) => {
    if (el) dockIcons.current.set(appId, el)
    else dockIcons.current.delete(appId)
  }, [])

  // Cache the last seen rect per icon. During a window's exit animation the
  // dock can momentarily not have the icon registered (ref churn on re-render);
  // returning the last known rect keeps the genie target stable so the exit
  // animation can actually complete.
  const lastDockRect = useRef(new Map<AppId, DOMRect>())
  const getDockIconRect = useCallback((appId: AppId) => {
    const el = dockIcons.current.get(appId)
    if (el) {
      const rect = el.getBoundingClientRect()
      lastDockRect.current.set(appId, rect)
      return rect
    }
    return lastDockRect.current.get(appId) ?? null
  }, [])

  const getBounds = useCallback((appId: AppId) => boundsStore.current.get(appId), [])
  const setBounds = useCallback((appId: AppId, b: Bounds) => {
    boundsStore.current.set(appId, b)
  }, [])
  const getExitReason = useCallback((appId: AppId) => exitReasons.current.get(appId) ?? "close", [])

  let topApp: AppId | null = null
  let topZ = -1
  for (const [id, entry] of Object.entries(windows) as [AppId, WindowEntry][]) {
    if (entry.open && !entry.minimized && entry.z > topZ) {
      topZ = entry.z
      topApp = id
    }
  }

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        topApp,
        anyEverOpened,
        attentionApps,
        requestAttention,
        openApp,
        closeApp,
        minimizeApp,
        focusApp,
        registerDockIcon,
        getDockIconRect,
        getBounds,
        setBounds,
        getExitReason,
        desktopActions,
        setDesktopActions,
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  )
}

function useWindowManager() {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider")
  return ctx
}

export { WindowManagerProvider, useWindowManager }
