"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const initialProps = { pathLength: 0, opacity: 0 } as const
const animateProps = { pathLength: 1, opacity: 1 } as const

type Props = React.ComponentProps<typeof motion.svg> & {
  speed?: number
  onAnimationComplete?: () => void
  skipAnimation?: boolean
}

type Letter = {
  vbW: number
  vbH: number
  paths: string[]
}

const LETTERS: Record<"a" | "r" | "y" | "n" | "b" | "h" | "l", Letter> = {
  a: {
    vbW: 147,
    vbH: 114,
    paths: [
      "M88.3404 26.1967C83.4758 15.0018 73.1357 7.44418 56.6763 7.44418C29.381 7.44418 8.86755 34.7395 7.52084 64.0199C6.34718 90.8189 18.7131 105.883 36.3265 105.707C61.3268 105.457 79.7036 80.9013 87.9066 28.9441C88.9187 22.5337 89.9675 15.8397 90.9796 9.42929",
      "M90.9794 9.42936C89.9548 15.9318 88.9302 22.4343 87.9056 28.9368C83.4242 57.3766 81.3566 68.5968 81.5786 75.9306C82.097 93.0522 88.2544 104.715 103.639 104.715C122.994 104.715 133.849 91.5634 139.06 77.1713",
    ],
  },
  r: {
    vbW: 177,
    vbH: 114,
    paths: [
      "M7.44434 105.957C36.9398 105.957 62.1204 64.1526 74.7836 7.44572",
      "M72.8228 15.8722C103.592 17.361 117.215 23.5748 117.215 38.215C117.215 48.3887 112.252 64.0215 110.763 75.4358C108.034 95.287 115.356 106.205 131.111 106.205C150.268 106.205 163.524 93.4781 168.697 80.5475",
    ],
  },
  y: {
    vbW: 181,
    vbH: 189,
    paths: [
      "M7.44434 7.44416C21.3401 7.44416 31.0175 12.1588 42.1838 20.3474C76.7524 45.5654 105.432 33.3714 115.633 8.43671",
      "M115.633 8.43683C111.002 47.7255 106.37 87.0142 101.738 126.303C97.143 165.275 85.6086 180.893 68.2389 180.893C56.5764 180.893 48.1396 173.467 48.1396 161.539C48.1396 145.601 60.234 134.16 88.09 125.558C138.896 109.871 160.289 91.8799 173.45 57.8165",
    ],
  },
  n: {
    vbW: 214,
    vbH: 113,
    paths: [
      "M7.44531 43.9208C10.9193 27.5436 21.093 8.93318 39.4552 8.93318C57.8175 8.93318 63.0284 25.3104 58.3138 47.1466C55.088 62.7793 52.6066 78.9084 47.3957 103.474",
      "M52.4668 78.0358C60.5909 34.835 80.1323 7.44438 103.971 7.44438C120.1 7.44438 128.537 19.355 127.048 36.2285C125.807 48.8836 121.589 63.5238 120.596 75.9307C119.356 92.8042 124.815 104.715 142.247 104.715C170.931 104.715 194.171 72.2055 201.699 31.6934C203.031 24.5229 204.705 16.9515 205.894 9.42949",
    ],
  },

  // ✅ from B.svg
  b: {
    vbW: 168,
    vbH: 202,
    paths: [
      "M7.44434 165.663C7.96273 182.784 14.1201 194.447 33.7296 194.447C67.9397 194.447 110.317 128.049 137.252 71.5937C144.445 56.5174 147.046 42.2587 147.798 31.3271C148.548 17.4145 142.841 7.44429 131.675 7.44429C120.509 7.44429 113.064 15.4691 104.876 32.4914C95.1984 52.9182 89.4912 77.2359 86.5135 101.553C78.8212 169.4 94.9503 194.447 121.997 194.447C144.33 194.447 158.474 174.348 160.211 147.797C161.203 125.464 151.774 108.094 134.901 99.9058",
    ],
  },

  // ✅ from H.svg (lowercase h-style stroke set)
  // ✅ from H2.svg (use this for lowercase h)
  h: {
    vbW: 159,
    vbH: 199,
    paths: [
      "M7.44531 166.558C34.9925 151.245 60.0941 131.553 88.5723 98.0349C107.957 75.1542 118.378 49.0282 118.875 31.008C119.123 17.609 112.589 7.4442 100.512 7.4442C87.113 7.4442 78.6763 17.609 73.4653 40.9417C67.7581 66.5846 63.5398 96.009 52.8698 190.361",
      "M53.9155 181.14C59.3782 133.12 80.165 98.0536 106.716 98.0536C122.597 98.0536 132.69 110.709 129.824 128.823C128.211 139.493 126.341 150.411 124.162 163.066C121.622 178.947 128.881 191.354 150.875 191.354",
    ],
  },

  // ✅ from L.svg (lowercase l-style stroke)
  l: {
    vbW: 178,
    vbH: 200,
    paths: [
      "M7.44434 192.227C53.302 192.227 104.096 137.178 127.435 75.7444C134.025 58.3988 136.497 42.2924 136.497 31.037C136.497 17.6915 132.279 7.44405 120.368 7.44405C108.705 7.44405 101.013 16.4999 94.0652 30.7987C85.9247 47.3825 79.9033 71.302 77.4398 98.3407C71.2364 166.187 85.1322 191.234 114.637 191.234C144.096 191.234 160.099 165.555 169.693 138.288",
    ],
  },
}

export function AppleNameAryanBahlEffect({
  className,
  speed = 1,
  onAnimationComplete,
  skipAnimation = false,
  ...props
}: Props) {
  const calc = (x: number) => x * speed

  // ✅ aryan bahl
  const sequence: Array<keyof typeof LETTERS | " "> = [
    "a",
    "r",
    "y",
    "a",
    "n",
    " ",
    "b",
    "a",
    "h",
    "l",
  ]

  // Typography sizing
  const baselineHeight = 115 // Height for regular letters (a, r, n)
  const xHeight = 105 // Slightly smaller for a, r, n
  const ascenderHeight = 220 // Height for tall letters (b, l)
  const descenderDepth = 115 // Space below baseline for y (increased to prevent clipping)

  // Total viewBox height: ascenders + descenders
  const totalH = ascenderHeight + descenderDepth

  const gap = 2 // Reduced gap to minimize visible spaces between letters
  const spaceWidth = 44
  const leftPadding = 10 // Padding to prevent left-side clipping

  const layout = sequence.map((k) => {
    if (k === " ") {
      return {
        key: " ",
        scale: 1,
        width: spaceWidth,
        yOffset: 0,
        paths: [] as string[],
      }
    }
    const L = LETTERS[k]

    let scale: number
    let yOffset: number = 0

    if (k === "a" || k === "r" || k === "n") {
      // Regular baseline letters - slightly smaller
      scale = xHeight / L.vbH
      yOffset = ascenderHeight - xHeight // Position at baseline
    } else if (k === "y") {
      // Descender letter - scale based on x-height, let descender extend naturally
      // The y letter's x-height portion is roughly the top 60% of its viewBox
      const yXHeightRatio = 0.6
      const yXHeightInViewBox = L.vbH * yXHeightRatio
      // Scale so the x-height part matches other letters
      scale = xHeight / yXHeightInViewBox
      // Position so the x-height baseline aligns with our baseline
      const scaledTotalHeight = L.vbH * scale
      const scaledBaselineFromTop = scaledTotalHeight * yXHeightRatio
      yOffset = ascenderHeight - scaledBaselineFromTop
    } else if (k === "b" || k === "l") {
      // Tall ascender letters
      scale = ascenderHeight / L.vbH
      yOffset = 0 // Top-aligned
    } else if (k === "h") {
      // h is tall but not as tall as b/l
      scale = (ascenderHeight * 0.95) / L.vbH
      yOffset = 0
    } else {
      // Fallback
      scale = baselineHeight / L.vbH
      yOffset = ascenderHeight - baselineHeight
    }

    const w = L.vbW * scale
    return { key: k, scale, width: w, yOffset, paths: L.paths }
  })

  let x = leftPadding
  const placed = layout.map((item) => {
    const out = { ...item, x }
    x += item.width + gap
    return out
  })

  const totalW = Math.max(1, x - gap + leftPadding)

  const baseDuration = 0.55
  const stepDelay = 0.22
  // Add a small pause between letters to make gaps feel intentional (like pen lifts)
  const letterBreakDelay = 0.15

  const totalStrokes = placed.reduce((acc, l) => acc + l.paths.length, 0)
  let strokeIndex = 0

  return (
    <motion.svg
      className={cn("h-24 w-auto max-w-[92vw]", className)}
      fill="none"
      initial={{ opacity: 1 }}
      viewBox={`-${leftPadding} 0 ${totalW} ${totalH}`}
      xmlns="http://www.w3.org/2000/svg"
      {...(props as any)}
    >
      <defs>
        <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.5">
            <animate
              attributeName="stopColor"
              values="#7dd3fc;#a5b4fc;#c4b5fd;#d8b4fe;#7dd3fc"
              dur="60s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="50%" stopColor="#c4b5fd" stopOpacity="0.6">
            <animate
              attributeName="stopColor"
              values="#c4b5fd;#d8b4fe;#7dd3fc;#a5b4fc;#c4b5fd"
              dur="60s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0.5">
            <animate
              attributeName="stopColor"
              values="#d8b4fe;#7dd3fc;#a5b4fc;#c4b5fd;#d8b4fe"
              dur="60s"
              repeatCount="indefinite"
            />
          </stop>
        </linearGradient>
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
        </filter>
      </defs>

      {/* Glow layer */}
      <g opacity="0.6">
        {placed.map((letter, letterIndex) => {
          if (!letter.paths.length) return null
          // Track if this is the first stroke of a new letter (after a space or at start)
          const isFirstStrokeOfLetter =
            letterIndex === 0 || (letterIndex > 0 && !placed[letterIndex - 1].paths.length)
          const letterBreak = isFirstStrokeOfLetter ? 0 : letterBreakDelay

          return (
            <g
              key={`glow-${letter.x}-${letter.key}`}
              transform={`translate(${letter.x} ${letter.yOffset}) scale(${letter.scale})`}
            >
              {letter.paths.map((d, pathIndex) => {
                const isFirstPath = pathIndex === 0
                const delay = stepDelay * strokeIndex + (isFirstPath ? letterBreak : 0)
                strokeIndex += 1
                return (
                  <motion.path
                    key={`g-${letter.key}-${strokeIndex}`}
                    d={d}
                    animate={animateProps}
                    initial={skipAnimation ? animateProps : initialProps}
                    stroke="url(#glow-gradient)"
                    strokeWidth="18"
                    vectorEffect="non-scaling-stroke"
                    style={{ strokeLinecap: "round", filter: "url(#glow)" }}
                    transition={{
                      duration: calc(baseDuration),
                      delay: calc(delay),
                      ease: "easeInOut",
                      opacity: { duration: 0.3, delay: calc(delay) },
                    }}
                  />
                )
              })}
            </g>
          )
        })}
      </g>

      {/* Reset index for main layer */}
      {(() => {
        strokeIndex = 0
        return null
      })()}

      {/* Main stroke layer */}
      {placed.map((letter, letterIndex) => {
        if (!letter.paths.length) return null
        // Track if this is the first stroke of a new letter (after a space or at start)
        const isFirstStrokeOfLetter =
          letterIndex === 0 || (letterIndex > 0 && !placed[letterIndex - 1].paths.length)
        const letterBreak = isFirstStrokeOfLetter ? 0 : letterBreakDelay

        return (
          <g
            key={`main-${letter.x}-${letter.key}`}
            transform={`translate(${letter.x} ${letter.yOffset}) scale(${letter.scale})`}
          >
            {letter.paths.map((d, pathIndex) => {
              const i = strokeIndex
              const isFirstPath = pathIndex === 0
              const delay = stepDelay * strokeIndex + (isFirstPath ? letterBreak : 0)
              const isLast = i === totalStrokes - 1
              strokeIndex += 1

              return (
                <motion.path
                  key={`m-${letter.key}-${strokeIndex}`}
                  d={d}
                  animate={animateProps}
                  initial={skipAnimation ? animateProps : initialProps}
                  stroke="#0a0a0a"
                  strokeWidth="14.8883"
                  vectorEffect="non-scaling-stroke"
                  style={{ strokeLinecap: "round" }}
                  transition={{
                    duration: calc(baseDuration),
                    delay: calc(delay),
                    ease: "easeInOut",
                    opacity: { duration: 0.3, delay: calc(delay) },
                  }}
                  onAnimationComplete={isLast ? onAnimationComplete : undefined}
                />
              )
            })}
          </g>
        )
      })}
    </motion.svg>
  )
}
