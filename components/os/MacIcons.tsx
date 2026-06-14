"use client"

import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import type { AppId } from "@/lib/os/window-manager"
import { cn } from "@/lib/utils"

// macOS-style squircle app icons with gooey hover animations.
// Each icon fills its parent box. Hover state propagates down via
// framer variants ("rest" → "hover") from the MacAppIcon wrapper.

// Jelly squash-and-stretch applied to every squircle on hover
const jelly: Variants = {
  rest: { scaleX: 1, scaleY: 1 },
  hover: {
    scaleX: [1, 1.14, 0.94, 1.05, 1],
    scaleY: [1, 0.86, 1.08, 0.96, 1],
    transition: { duration: 0.55, ease: "easeOut" },
  },
}

function Squircle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      variants={jelly}
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden rounded-[22%] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      {children}
      {/* gloss */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />
    </motion.div>
  )
}

// ── Finder (Projects): a friendly double-blink ────────────────
const blink: Variants = {
  rest: { scaleY: 1 },
  hover: {
    scaleY: [1, 0.08, 1, 0.08, 1],
    transition: { duration: 0.6, times: [0, 0.12, 0.24, 0.36, 0.48] },
  },
}
function FinderIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-[#9ddcff] to-[#3e9eff]">
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        <path
          d="M0 0 H56 C44 20 44 35 50 50 C56 65 56 80 46 100 H0 Z"
          fill="#1e7fe8"
          opacity="0.85"
        />
        {/* eyes blink twice */}
        <motion.path
          d="M30 32 v14"
          stroke="#0b2e5e"
          strokeWidth="5"
          strokeLinecap="round"
          variants={blink}
          style={{ originY: "39px" }}
        />
        <motion.path
          d="M72 32 v14"
          stroke="#0b2e5e"
          strokeWidth="5"
          strokeLinecap="round"
          variants={blink}
          style={{ originY: "39px" }}
        />
        {/* smile lifts a touch */}
        <motion.path
          stroke="#0b2e5e"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          variants={{
            rest: { d: "M24 62 C36 74 66 74 78 62" },
            hover: {
              d: "M24 61 C36 77 66 77 78 61",
              transition: { type: "spring", stiffness: 300, damping: 16 },
            },
          }}
        />
      </svg>
    </Squircle>
  )
}

// ── Activity Monitor (Current): heartbeat draws on loop ───────
function ActivityIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-white to-[#e8e8ee]">
      <svg viewBox="0 0 100 100" className="size-[78%]">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#d2d2da" strokeWidth="6" />
        <motion.path
          d="M14 52 H34 L44 30 L56 72 L66 52 H86"
          fill="none"
          stroke="#19b84c"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            rest: { pathLength: 1 },
            hover: {
              pathLength: [0, 1],
              transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
            },
          }}
        />
      </svg>
    </Squircle>
  )
}

// ── Calendar (Timeline): today's date pops ────────────────────
function CalendarIcon() {
  const [date, setDate] = useState<{ month: string; day: number } | null>(null)
  useEffect(() => {
    // async set avoids a hydration mismatch (server doesn't know the visitor's date)
    const id = setTimeout(() => {
      const now = new Date()
      setDate({
        month: now.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        day: now.getDate(),
      })
    }, 0)
    return () => clearTimeout(id)
  }, [])
  return (
    <Squircle className="bg-white">
      <div className="flex size-full flex-col">
        <div className="flex h-[32%] items-center justify-center bg-[#ff3b30] text-[length:28cqw] leading-none font-bold tracking-wide text-white">
          {date?.month ?? ""}
        </div>
        <motion.div
          className="flex flex-1 items-center justify-center text-[length:52cqw] leading-none font-light text-neutral-800"
          style={{ transformPerspective: 360, transformOrigin: "top" }}
          variants={{
            rest: { rotateX: 0 },
            hover: {
              rotateX: [0, -88, -88, 0],
              transition: { duration: 0.65, times: [0, 0.45, 0.55, 1], ease: "easeInOut" },
            },
          }}
        >
          {date?.day ?? ""}
        </motion.div>
      </div>
    </Squircle>
  )
}

// ── Notes: the scribbles rewrite themselves ───────────────────
function NotesIcon() {
  return (
    <Squircle className="bg-white">
      <div className="flex size-full flex-col">
        <div className="flex h-[30%] items-end justify-center gap-[8%] bg-gradient-to-b from-[#ffd60a] to-[#ffc300] pb-[6%]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="block h-[40%] w-[4%] rounded-full bg-white/70" />
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-[9%] px-[16%]">
          {[1, 1, 0.6].map((width, i) => (
            <motion.span
              key={i}
              className="block h-[5%] rounded-full bg-neutral-300"
              style={{ width: `${width * 100}%`, originX: 0 }}
              variants={{
                rest: { scaleX: 1 },
                hover: {
                  scaleX: [1, 0, 1],
                  transition: { delay: i * 0.12, duration: 0.45 },
                },
              }}
            />
          ))}
        </div>
      </div>
    </Squircle>
  )
}

// ── Messages (Contact): typing-indicator dots ─────────────────
function MessagesIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-[#6cf07f] to-[#13bd2f]">
      <motion.svg
        viewBox="0 0 100 100"
        className="size-[68%]"
        variants={{
          rest: { scale: 1, rotate: 0 },
          hover: {
            scale: [1, 1.15, 0.95, 1.05, 1],
            rotate: [0, -4, 3, 0],
            transition: { duration: 0.5 },
          },
        }}
      >
        <path
          d="M50 14 C25 14 8 29 8 47 C8 58 14 67 24 73 C23 80 19 86 14 90 C23 90 31 87 37 82 C41 83 45 84 50 84 C75 84 92 69 92 47 C92 29 75 14 50 14 Z"
          fill="white"
        />
        {[34, 50, 66].map((cx, i) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy="49"
            r="5.5"
            fill="#13bd2f"
            variants={{
              rest: { opacity: 0 },
              hover: {
                opacity: [0.25, 1, 0.25],
                transition: { delay: i * 0.18, duration: 0.9, repeat: Infinity },
              },
            }}
          />
        ))}
      </motion.svg>
    </Squircle>
  )
}

// ── Terminal: prompt in the top-left, like the real one ───────
function TerminalIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-[#3a3a3f] to-[#141417]">
      <svg viewBox="0 0 100 100" className="size-full">
        <motion.path
          d="M18 26 L34 38 L18 50"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            rest: { x: 0 },
            hover: { x: [0, 4, -2, 0], transition: { duration: 0.4 } },
          }}
        />
        <motion.rect
          x="42"
          y="44"
          width="22"
          height="7"
          rx="3.5"
          fill="white"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        />
      </svg>
    </Squircle>
  )
}

// ── Trash: lid pops and a crumpled ball drops in ──────────────
function TrashIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-[#e3e3e9] to-[#b8b8c2]">
      <svg viewBox="0 0 100 100" className="size-[64%] overflow-visible">
        {/* crumpled paper ball falls into the can */}
        <motion.circle
          cx="50"
          r="7"
          fill="#d2d2d9"
          stroke="#a3a3ae"
          strokeWidth="2"
          variants={{
            rest: { cy: -28, opacity: 0, scale: 1 },
            hover: {
              cy: [-28, 50],
              opacity: [0, 1, 1, 0],
              scale: [1, 1, 0.5],
              transition: { duration: 0.55, times: [0, 0.18, 0.82, 1], ease: "easeIn" },
            },
          }}
        />
        {/* lid lifts to let it in */}
        <motion.g
          variants={{
            rest: { rotate: 0 },
            hover: {
              rotate: [0, -28, 0],
              transition: { duration: 0.55, times: [0, 0.3, 0.7] },
            },
          }}
          style={{ originX: "80px", originY: "24px" }}
        >
          <rect x="20" y="20" width="60" height="8" rx="4" fill="#6e6e78" />
          <rect x="40" y="11" width="20" height="9" rx="3" fill="#6e6e78" />
        </motion.g>
        {/* can */}
        <path
          d="M27 34 H73 L68 88 C67.7 91 65 93 62 93 H38 C35 93 32.3 91 32 88 Z"
          fill="#8b8b95"
        />
        <path
          d="M40 44 v38 M50 44 v38 M60 44 v38"
          stroke="#6e6e78"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </Squircle>
  )
}

// ── Preview (Résumé): the loupe inspects ──────────────────────
function PreviewIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-white to-[#e9e9ef]">
      <svg viewBox="0 0 100 100" className="size-[72%] overflow-visible">
        <rect
          x="18"
          y="10"
          width="64"
          height="80"
          rx="8"
          fill="#f5f5f7"
          stroke="#c9c9d2"
          strokeWidth="4"
        />
        <path
          d="M32 30 h36 M32 44 h36 M32 58 h22"
          stroke="#9a9aa5"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <motion.g
          variants={{
            rest: { x: 0, y: 0 },
            hover: { x: [0, -22, 8, 0], y: [0, -26, -10, 0], transition: { duration: 0.8 } },
          }}
        >
          <circle cx="64" cy="66" r="14" fill="none" stroke="#3e9eff" strokeWidth="6" />
          <path d="M74 76 L84 86" stroke="#3e9eff" strokeWidth="7" strokeLinecap="round" />
        </motion.g>
      </svg>
    </Squircle>
  )
}

// ── About (avatar): waves hi ──────────────────────────────────
function AboutIcon() {
  return (
    <Squircle className="bg-gradient-to-br from-violet-500 to-fuchsia-500">
      <motion.span
        className="inline-block text-[length:40cqw] font-semibold text-white"
        style={{ originX: "50%", originY: "90%" }}
        variants={{
          rest: { rotate: 0, y: 0 },
          hover: {
            rotate: [0, -14, 12, -10, 8, 0],
            y: [0, -3, 0, -2, 0],
            transition: { duration: 0.7, ease: "easeInOut" },
          },
        }}
      >
        ab
      </motion.span>
    </Squircle>
  )
}

// ── TextEdit: the pen writes a fresh line ─────────────────────
function TextEditIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-white to-[#ececf2]">
      <svg viewBox="0 0 100 100" className="size-[72%] overflow-visible">
        {/* two written lines */}
        <path d="M16 26 h64 M16 42 h64" stroke="#c2c2cc" strokeWidth="5" strokeLinecap="round" />
        {/* third line draws in as the pen sweeps across */}
        <motion.path
          d="M16 58 h56"
          stroke="#c2c2cc"
          strokeWidth="5"
          strokeLinecap="round"
          variants={{
            rest: { pathLength: 1 },
            hover: { pathLength: [0, 1], transition: { duration: 0.7, ease: "easeInOut" } },
          }}
        />
        {/* pen nib rides along the line it's drawing */}
        <motion.g
          variants={{
            rest: { x: 56, opacity: 0 },
            hover: {
              x: [0, 56],
              opacity: [1, 1, 1, 0],
              transition: {
                duration: 0.7,
                ease: "easeInOut",
                opacity: { times: [0, 0.1, 0.85, 1] },
              },
            },
          }}
        >
          <g transform="translate(8, 30) rotate(40)">
            <path d="M0 0 L9 0 L9 22 L4.5 30 L0 22 Z" fill="#8a8a96" />
            <path d="M0 0 L9 0 L9 6 L0 6 Z" fill="#6e6e78" />
          </g>
        </motion.g>
      </svg>
    </Squircle>
  )
}

// ── Music: a little jingle (note hops, sound waves ring out) ──
function MusicIcon() {
  return (
    <Squircle className="bg-gradient-to-b from-[#fc5c7d] to-[#fa2d48]">
      <svg viewBox="0 0 100 100" className="size-[64%] overflow-visible">
        {/* sound waves ripple out on hover */}
        {[0, 1].map((i) => (
          <motion.path
            key={i}
            d="M70 40 Q82 56 70 72"
            fill="none"
            stroke="white"
            strokeWidth="4.5"
            strokeLinecap="round"
            style={{ originX: "64px", originY: "56px" }}
            variants={{
              rest: { opacity: 0, scale: 0.5 },
              hover: {
                opacity: [0, 0.9, 0],
                scale: [0.5, 1.5],
                transition: { delay: 0.15 + i * 0.22, duration: 0.7, repeat: Infinity },
              },
            }}
          />
        ))}
        {/* the note hops a decaying jingle */}
        <motion.g
          variants={{
            rest: { y: 0, rotate: 0 },
            hover: {
              y: [0, -8, 0, -5, 0, -2, 0],
              rotate: [0, -7, 3, -4, 2, 0],
              transition: { duration: 0.85, ease: "easeOut" },
            },
          }}
          style={{ originX: "50px", originY: "78px" }}
        >
          <path
            d="M40 76 V30 L74 22 V62"
            fill="none"
            stroke="white"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <ellipse cx="31" cy="76" rx="10" ry="8" fill="white" />
          <ellipse cx="65" cy="62" rx="10" ry="8" fill="white" />
        </motion.g>
      </svg>
    </Squircle>
  )
}

const APP_ICONS: Record<AppId, React.ComponentType> = {
  current: ActivityIcon,
  projects: FinderIcon,
  timeline: CalendarIcon,
  notes: NotesIcon,
  contact: MessagesIcon,
  terminal: TerminalIcon,
  resume: PreviewIcon,
  about: AboutIcon,
  trash: TrashIcon,
  textedit: TextEditIcon,
  music: MusicIcon,
}

function MacAppIcon({ appId, className }: { appId: AppId; className?: string }) {
  const Icon = APP_ICONS[appId]
  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn("@container size-full", className)}
    >
      <Icon />
    </motion.div>
  )
}

export { MacAppIcon }
