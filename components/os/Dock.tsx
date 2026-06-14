"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dock, DockIcon } from "@/components/ui/dock"
import { MacAppIcon } from "@/components/os/MacIcons"
import { DOCK_APPS, APPS } from "@/lib/os/apps"
import { useWindowManager, type AppId } from "@/lib/os/window-manager"

function RunningDot({ appId }: { appId: AppId }) {
  const { windows } = useWindowManager()
  if (!windows[appId]?.open) return null
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -bottom-[7px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-white/90 shadow-[0_0_3px_rgba(0,0,0,0.4)]"
    />
  )
}

function DockApp({ appId, index }: { appId: AppId; index: number }) {
  const { openApp, registerDockIcon, windows, attentionApps } = useWindowManager()
  const [bouncing, setBouncing] = useState(false)
  const needsAttention = attentionApps.includes(appId)

  const launch = () => {
    // Bounce like a launching mac app (only when it wasn't already open)
    if (!windows[appId]?.open && !bouncing) {
      setBouncing(true)
      setTimeout(() => setBouncing(false), 700)
    }
    openApp(appId)
  }

  return (
    <DockIcon
      className="rounded-[22%] bg-transparent"
      registerEl={(el) => registerDockIcon(appId, el)}
      onClick={launch}
      aria-label={APPS[appId].dockLabel}
    >
      <motion.div
        className="size-full"
        initial={{ opacity: 0, scale: 0.4, y: 16 }}
        whileTap={{ scale: 0.86 }}
        animate={
          needsAttention
            ? // Attention bounce: keeps hopping until the app is opened
              { opacity: 1, scale: 1, y: [0, -20, 0] }
            : bouncing
              ? { opacity: 1, scale: 1, y: [0, -22, 0, -10, 0] }
              : { opacity: 1, scale: 1, y: 0 }
        }
        transition={
          needsAttention
            ? { duration: 0.5, repeat: Infinity, repeatDelay: 0.7, ease: "easeOut" }
            : bouncing
              ? { duration: 0.7, ease: "easeOut" }
              : { delay: 0.15 + index * 0.06, type: "spring", stiffness: 320, damping: 22 }
        }
      >
        <MacAppIcon appId={appId} />
      </motion.div>
      <RunningDot appId={appId} />
    </DockIcon>
  )
}

function OSDock() {
  return (
    <Dock
      className="gap-3 rounded-[26px] border-white/30 bg-white/25 px-3 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      direction="bottom"
      iconSize={48}
      iconMagnification={76}
      iconDistance={110}
    >
      {DOCK_APPS.map((appId, i) => (
        <DockApp key={appId} appId={appId} index={i} />
      ))}

      {/* Divider, then Trash - like the real thing */}
      <div className="mx-0.5 h-10 w-px self-center rounded-full bg-white/35" />

      <DockApp appId="trash" index={DOCK_APPS.length} />
    </Dock>
  )
}

export { OSDock }
