"use client"

import { motion } from "framer-motion"
import { hoverLiftVariants, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface HoverLiftProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export function HoverLift({ children, className, glow = true }: HoverLiftProps) {
  const shouldAnimate = !prefersReducedMotion()

  return (
    <motion.div
      initial="rest"
      whileHover={shouldAnimate ? "hover" : "rest"}
      variants={hoverLiftVariants}
      className={cn(
        "relative",
        glow &&
          "hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] [data-theme='ice-blue']:hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]",
        className
      )}
    >
      {children}
    </motion.div>
  )
}
