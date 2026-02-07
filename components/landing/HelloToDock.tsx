"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { AppleHelloEnglishEffect } from "@/components/apple-effects/AppleHelloEffect"
import { AppleNameAryanBahlEffect } from "@/components/apple-effects/AppleAryanEffect"
import { DockShell } from "@/components/landing/DockShell"
import { useReducedMotionPref } from "@/lib/useReducedMotionPref"
import ColorBends from "@/components/background/ColorBends"

// ────────────────────────────────────────────
// Phase machine
// boot   → SVG "hello" draws
// fade   → hello fades out
// expand → dock expands from center icon
// dock   → dock fully visible
// ────────────────────────────────────────────
type Phase = "boot" | "fade" | "expand" | "dock"

function HelloToDock() {
  const prefersReducedMotion = useReducedMotionPref()
  const [phase, setPhase] = useState<Phase>("boot")
  const hasCalledRef = useRef(false)

  // ── SVG draw completes → fade out ────────────────────────────
  const handleSvgComplete = useCallback(() => {
    if (hasCalledRef.current) return
    hasCalledRef.current = true
    setTimeout(() => {
      setPhase("fade")
      setTimeout(() => {
        setPhase("expand")
        // Wait for full expansion animation to complete:
        setTimeout(() => setPhase("dock"), 2000)
      }, 600)
    }, 200)
  }, [])

  // ── Reduced motion ──────────────────────────────────────────
  if (prefersReducedMotion) {
    return (
      <div className="boot-bg fixed inset-0 z-50">
        {/* ─── Vignette overlay ─── */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.65)_70%,rgba(0,0,0,0.9)_100%)]" />
        {/* ─── Noise overlay ─── */}
        <div className="boot-noise" style={{ opacity: 0.11 }} />
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <DockShell variant="top" />
        </div>
      </div>
    )
  }

  return (
    <div className="boot-bg fixed inset-0 z-50">
      {/* ─── Dock: appears at bottom after fade, expands from center ─── */}
      {(phase === "expand" || phase === "dock") && (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <DockShell variant="top" expansionPhase={phase} />
        </div>
      )}

      {/* ─── SVG hero: fades out ─── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "boot" ? 1 : 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}
      >
        <AppleHelloEnglishEffect
          className="h-64 w-auto max-w-[90vw]"
          onAnimationComplete={handleSvgComplete}
          speed={0.9}
        />
      </motion.div>
    </div>
  )
}

export { HelloToDock }
