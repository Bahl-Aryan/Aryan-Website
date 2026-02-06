"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { AppleHelloEnglishEffect } from "@/components/AppleHelloEffect"
import { DockShell } from "@/components/landing/DockShell"
import { useReducedMotionPref } from "@/lib/useReducedMotionPref"

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
      <div className="fixed inset-0 boot-bg z-50">
        <div className="absolute inset-x-0 bottom-6 flex justify-center z-10">
          <DockShell variant="top" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 boot-bg z-50">
      {/* ─── Noise overlay (z-0) ─── */}
      <div className="boot-noise" />

      {/* ─── Dock: appears at bottom after fade, expands from center ─── */}
      {(phase === "expand" || phase === "dock") && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center z-10">
          <DockShell variant="top" expansionPhase={phase} />
        </div>
      )}

      {/* ─── SVG hero: fades out ─── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
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
