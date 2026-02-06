"use client"

import React, { useEffect } from "react"
import { Dock, DockIcon } from "@/components/ui/dock"
import { HomeIcon } from "@/components/icons/home"
import { LayoutPanelTopIcon } from "@/components/icons/layout-panel-top"
import { User } from "@/components/icons/user"
import { FeatherIcon } from "@/components/icons/feather"
import { ConnectIcon } from "@/components/icons/connect"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type DockShellProps = {
  variant: "center" | "top"
  className?: string
  children?: React.ReactNode
  expansionPhase?: "expand" | "dock"
}

function DockShell({ variant, className, children, expansionPhase = "dock" }: DockShellProps) {
  const isTop = variant === "top"
  const [userIconShouldAnimate, setUserIconShouldAnimate] = React.useState(false)
  const [userIconScale, setUserIconScale] = React.useState(1)
  const [startExpandAnimation, setStartExpandAnimation] = React.useState(false)

  // Default icons with labels
  // Index 2 is the center icon (User/Timeline)
  const defaultIcons = [
    { icon: HomeIcon, label: "Home", index: 0 },
    { icon: LayoutPanelTopIcon, label: "Projects", index: 1 },
    { icon: User, label: "Timeline", needsAnimateWrapper: true, index: 2 },
    { icon: FeatherIcon, label: "Notes", index: 3 },
    { icon: ConnectIcon, label: "Contact", index: 4 },
  ]

  useEffect(() => {
    if (expansionPhase === "expand") {
      setUserIconScale(1.5)

      const timer1 = setTimeout(() => {
        setUserIconShouldAnimate(true)
      }, 200)

      const timer2 = setTimeout(() => {
        setUserIconScale(1)
        setTimeout(() => {
          setStartExpandAnimation(true)
        }, 300)
      }, 800) // 200ms delay + 600ms animation

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    } else if (expansionPhase === "dock") {
      setUserIconScale(1)
    } else {
      setUserIconScale(1)
      setStartExpandAnimation(false)
      setUserIconShouldAnimate(false)
    }
  }, [expansionPhase])

  const iconsToShow =
    children ||
    defaultIcons.map((item) => {
      const Icon = item.icon
      const isCenterIcon = item.index === 2
      const distanceFromCenter = Math.abs(item.index - 2)

      const iconElement = item.needsAnimateWrapper ? (
        <AnimateIcon
          animate={isCenterIcon && userIconShouldAnimate ? "default" : false}
          animateOnHover="default"
          loop={false}
          className="size-full"
        >
          <Icon className="size-full text-black dark:text-white" />
        </AnimateIcon>
      ) : (
        <Icon className="size-full text-black dark:text-white" />
      )

      const iconInner = isCenterIcon ? (
        <motion.div
          animate={{ scale: userIconScale }}
          transition={{
            duration: 0.3,
            ease: "easeOut",
          }}
          className="flex size-full items-center justify-center [&_svg]:!h-full [&_svg]:max-h-full [&_svg]:!w-full [&_svg]:max-w-full"
        >
          {iconElement}
        </motion.div>
      ) : (
        // Other icons: fade in with scale during expansion
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          animate={
            startExpandAnimation
              ? {
                  opacity: 1,
                  scale: 1,
                }
              : {
                  opacity: 0,
                  scale: 0.8,
                }
          }
          transition={{
            delay: distanceFromCenter * 0.08,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex size-full items-center justify-center [&_svg]:!h-full [&_svg]:max-h-full [&_svg]:!w-full [&_svg]:max-w-full"
        >
          {iconElement}
        </motion.div>
      )

      return (
        <DockIcon key={item.index} label={item.label} value={item.label}>
          {iconInner}
        </DockIcon>
      )
    })

  return (
    <Dock
      className={cn(
        "w-[min(420px,92vw)] justify-evenly",
        expansionPhase === "expand" && "pointer-events-none" // Disable pointer events during expansion
      )}
      direction="bottom"
      iconSize={36}
      iconMagnification={75}
      iconDistance={60}
    >
      {iconsToShow}
    </Dock>
  )
}

export { DockShell }
