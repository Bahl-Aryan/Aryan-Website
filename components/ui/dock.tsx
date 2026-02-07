"use client"

import React, { PropsWithChildren, useRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion"
import type { MotionProps } from "framer-motion"
import { TextAnimate } from "@/components/ui/text-animate"

import { cn } from "@/lib/utils"

export interface DockProps extends VariantProps<typeof dockVariants> {
  className?: string
  iconSize?: number
  iconMagnification?: number
  disableMagnification?: boolean
  iconDistance?: number
  direction?: "top" | "middle" | "bottom"
  children: React.ReactNode
}

const DEFAULT_SIZE = 40
const DEFAULT_MAGNIFICATION = 60
const DEFAULT_DISTANCE = 140
const DEFAULT_DISABLEMAGNIFICATION = false

const dockVariants = cva(
  "supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex min-h-[58px] items-center justify-center gap-2 rounded-2xl border p-2 backdrop-blur-md"
)

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = "middle",
      ...props
    },
    ref
  ) => {
    const mouseX = useMotionValue(Infinity)

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (
          React.isValidElement<DockIconProps>(child) &&
          (child.type as any)?.displayName === "DockIcon"
        ) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: iconSize,
            magnification: iconMagnification,
            disableMagnification: disableMagnification,
            distance: iconDistance,
          })
        }
        return child
      })
    }

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(dockVariants({ className }), {
          "items-start": direction === "top",
          "items-center": direction === "middle",
          "items-end": direction === "bottom",
          "bg-transparent": true,
        })}
      >
        {renderChildren()}
      </motion.div>
    )
  }
)

Dock.displayName = "Dock"

export interface DockIconProps extends Omit<
  MotionProps & React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  size?: number
  magnification?: number
  disableMagnification?: boolean
  distance?: number
  mouseX?: MotionValue<number>
  className?: string
  children?: React.ReactNode
  props?: PropsWithChildren
  label?: string
  value?: string
}

const DockIcon = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  disableMagnification,
  distance = DEFAULT_DISTANCE,
  mouseX,
  className,
  children,
  label,
  value,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const fallbackMouseX = useMotionValue(Infinity)
  const [hovered, setHovered] = React.useState(false)
  const springConfig = { stiffness: 100, damping: 15 }
  const x = useMotionValue(0)
  const animationFrameRef = useRef<number | null>(null)

  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig)
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (event.currentTarget) {
        const halfWidth = (event.currentTarget as HTMLElement).offsetWidth / 2
        x.set(event.nativeEvent.offsetX - halfWidth)
      }
    })
  }

  const effectiveMouseX = mouseX ?? fallbackMouseX

  // Symmetric distance to icon center
  const dist = useTransform(effectiveMouseX, (x) => {
    const el = ref.current
    if (!el || x === Infinity) return Infinity
    const r = el.getBoundingClientRect()
    const center = r.left + r.width / 2
    return Math.abs(x - center)
  })

  const targetSize = disableMagnification ? size : magnification

  // Map distance -> size
  const sizeTransform = useTransform(dist, [-distance, 0, distance], [size, targetSize, size])

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.12,
    stiffness: 220,
    damping: 18,
  })

  return (
    <div
      className="group relative flex flex-col items-center bg-transparent"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {label && hovered && (
          <motion.div
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }}
            className="pointer-events-none absolute -top-14 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-full bg-black px-4 py-2 text-xs shadow-xl"
            exit={{ opacity: 0, y: 20, scale: 0.3 }}
            initial={{ opacity: 0, y: 20, scale: 0.3 }}
            style={{
              translateX,
              rotate,
              whiteSpace: "nowrap",
            }}
          >
            <TextAnimate by="word" className="text-base font-bold text-white" animation="slideUp">
              {label}
            </TextAnimate>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible larger hit area for better hover detection */}
      <div
        className="absolute inset-0 -m-2"
        style={{ minWidth: `${magnification + 4}px`, minHeight: `${magnification + 4}px` }}
      />

      <motion.div
        ref={ref}
        style={{ width: scaleSize, height: scaleSize }}
        className={cn(
          "relative z-10 flex aspect-square shrink-0 cursor-pointer items-center justify-center rounded-full",
          "bg-white/5 transition-colors",
          className
        )}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {children}
      </motion.div>
    </div>
  )
}

DockIcon.displayName = "DockIcon"

export { Dock, DockIcon, dockVariants }
