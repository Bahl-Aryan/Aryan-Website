"use client"

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { useRef, useState } from "react"

export interface AnimatedTooltipItem {
  id: number
  label: string
}

export interface AnimatedTooltipProps {
  items: AnimatedTooltipItem[]
}

export const AnimatedTooltip = ({ items }: AnimatedTooltipProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const springConfig = { stiffness: 100, damping: 15 }
  const x = useMotionValue(0)
  const animationFrameRef = useRef<number | null>(null)

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig)
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig)

  const handleMouseMove = (event: any) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2
      x.set(event.nativeEvent.offsetX - halfWidth)
    })
  }

  return (
    <>
      {items.map((item, _idx) => (
        <div
          className="group relative -mr-4"
          key={item.label}
          role="button"
          tabIndex={0}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{
                  translateX,
                  rotate,
                  whiteSpace: "nowrap",
                }}
              >
                <div className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                <div className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                <div className="relative z-30 text-base font-bold text-white">{item.label}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  )
}
