"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { revealVariants, prefersReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const shouldAnimate = !prefersReducedMotion()

  return (
    <motion.div
      ref={ref}
      initial={shouldAnimate ? "hidden" : "visible"}
      animate={isInView && shouldAnimate ? "visible" : "visible"}
      variants={revealVariants}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
