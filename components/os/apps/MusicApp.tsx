"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Clock,
  ListMusic,
  Music2,
  Pause,
  Play,
  Radio,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume1,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Edit these whenever your rotation changes ─────────────────
// hue: the artwork gradient color (0-360)

type Track = {
  title: string
  artist: string
  album: string
  duration: string
  explicit?: boolean
  hue: number
}

const TOP_TRACKS: Track[] = [
  {
    title: "Not how it seems",
    artist: "CapzLock",
    album: "Not how it seems",
    duration: "1:40",
    hue: 150,
  },
  {
    title: "hate the love",
    artist: "CapzLock",
    album: "hate the love",
    duration: "2:07",
    explicit: true,
    hue: 340,
  },
  {
    title: "Burberry Headband",
    artist: "Lil Mosey",
    album: "Northsbest (Extended)",
    duration: "2:26",
    explicit: true,
    hue: 215,
  },
  { title: "hml", artist: "CapzLock", album: "hml", duration: "2:00", hue: 30 },
  {
    title: "NOTHINGTOLOSE",
    artist: "Tom The Mail Man",
    album: "Sunset Visionary, Vol. 2",
    duration: "2:04",
    explicit: true,
    hue: 270,
  },
]

const TOP_ARTISTS: { name: string; hue: number }[] = [
  { name: "CapzLock", hue: 150 },
  { name: "Lil Mosey", hue: 215 },
  { name: "Lil Uzi Vert", hue: 320 },
  { name: "Nova", hue: 45 },
]
// ──────────────────────────────────────────────────────────────

function durationToSeconds(d: string) {
  const [m, s] = d.split(":").map(Number)
  return m * 60 + s
}

function Artwork({ hue, className }: { hue: number; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 50) % 360} 75% 40%))`,
      }}
    >
      <Music2 className="size-[45%] text-white/80" />
    </div>
  )
}

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span className="flex h-3 items-end gap-px">
      {[0.9, 0.5, 1, 0.7].map((peak, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-[#fa2d48]"
          animate={
            playing
              ? {
                  height: [
                    `${peak * 25}%`,
                    `${peak * 100}%`,
                    `${peak * 40}%`,
                    `${peak * 85}%`,
                    `${peak * 25}%`,
                  ],
                }
              : { height: "20%" }
          }
          transition={
            playing ? { duration: 0.9, repeat: Infinity, delay: i * 0.13 } : { duration: 0.2 }
          }
        />
      ))}
    </span>
  )
}

function ExplicitBadge() {
  return (
    <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] bg-neutral-300 text-[8px] font-bold text-neutral-600 dark:bg-neutral-600 dark:text-neutral-200">
      E
    </span>
  )
}

const SIDEBAR: {
  section: string
  items: { label: string; icon: React.ComponentType<{ className?: string }>; active?: boolean }[]
}[] = [
  {
    section: "Apple Music",
    items: [
      { label: "Replay '26", icon: Sparkles, active: true },
      { label: "Browse", icon: Music2 },
      { label: "Radio", icon: Radio },
    ],
  },
  {
    section: "Library",
    items: [
      { label: "Recently Added", icon: Clock },
      { label: "Songs", icon: ListMusic },
    ],
  },
]

function MusicApp() {
  const [trackIdx, setTrackIdx] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const current = trackIdx !== null ? TOP_TRACKS[trackIdx] : null

  const playTrack = (idx: number) => {
    if (trackIdx === idx) setPlaying((p) => !p)
    else {
      setTrackIdx(idx)
      setPlaying(true)
    }
  }
  const skip = (delta: number) => {
    if (trackIdx === null) return
    setTrackIdx((trackIdx + delta + TOP_TRACKS.length) % TOP_TRACKS.length)
    setPlaying(true)
  }

  return (
    <div className="flex h-full flex-col bg-white text-neutral-900 dark:bg-[#1e1e22] dark:text-neutral-100">
      {/* ─── Playback bar with the LCD ─── */}
      <div className="flex items-center gap-2 border-b border-black/[0.08] bg-[#f0f0f3] px-3 py-1.5 dark:border-white/[0.07] dark:bg-[#2a2a2e]">
        <div className="flex items-center gap-0.5">
          <button
            className="rounded p-1.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            aria-label="Shuffle"
          >
            <Shuffle className="size-3.5" />
          </button>
          <button
            onClick={() => skip(-1)}
            aria-label="Previous"
            className="rounded p-1.5 text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          >
            <SkipBack className="size-4 fill-current" />
          </button>
          <button
            onClick={() => (current ? setPlaying((p) => !p) : playTrack(0))}
            aria-label={playing ? "Pause" : "Play"}
            className="rounded p-1.5 text-neutral-800 hover:text-black dark:text-neutral-100 dark:hover:text-white"
          >
            {playing ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current" />
            )}
          </button>
          <button
            onClick={() => skip(1)}
            aria-label="Next"
            className="rounded p-1.5 text-neutral-600 hover:text-black dark:text-neutral-300 dark:hover:text-white"
          >
            <SkipForward className="size-4 fill-current" />
          </button>
          <button
            className="rounded p-1.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
            aria-label="Repeat"
          >
            <Repeat className="size-3.5" />
          </button>
        </div>

        {/* LCD */}
        <div className="relative mx-auto flex h-11 w-[min(380px,46%)] items-center overflow-hidden rounded-md border border-black/[0.12] bg-[#e9e9ed] shadow-[inset_0_1px_4px_rgba(0,0,0,0.12)] dark:border-black/40 dark:bg-[#18181b] dark:shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
          {current ? (
            <>
              <Artwork hue={current.hue} className="h-full w-11 shrink-0" />
              <div className="min-w-0 flex-1 px-2 text-center">
                <p className="truncate text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {current.title}
                </p>
                <p className="truncate text-[10px] text-neutral-500">
                  {current.artist} — {current.album}
                </p>
              </div>
              <div className="absolute right-0 bottom-0 left-11 h-0.5 bg-black/10 dark:bg-white/10">
                {playing && (
                  <motion.div
                    key={`${trackIdx}-${playing}`}
                    className="h-full bg-neutral-400"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: durationToSeconds(current.duration), ease: "linear" }}
                    onAnimationComplete={() => skip(1)}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex w-full items-center justify-center gap-1.5 text-neutral-400 dark:text-neutral-600">
              <Music2 className="size-4" />
              <span className="text-[11px]">Music</span>
            </div>
          )}
        </div>

        {/* Volume (decorative — there is no audio, blissfully) */}
        <div className="hidden items-center gap-1.5 @lg:flex">
          <Volume1 className="size-4 text-neutral-500" />
          <div className="relative h-1 w-16 rounded-full bg-black/15 dark:bg-white/15">
            <div className="h-full w-2/3 rounded-full bg-neutral-400" />
            <div className="absolute top-1/2 left-2/3 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* ─── Sidebar ─── */}
        <div className="hidden w-44 shrink-0 flex-col gap-3 overflow-y-auto border-r border-black/[0.08] bg-black/[0.04] p-3 @lg:flex dark:border-white/[0.07] dark:bg-black/25">
          {SIDEBAR.map((group) => (
            <div key={group.section}>
              <p className="px-1.5 pb-1 font-mono text-[10px] tracking-wide text-neutral-500 uppercase">
                {group.section}
              </p>
              {group.items.map(({ label, icon: Icon, active }) => (
                <button
                  key={label}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs",
                    active
                      ? "bg-black/[0.07] font-medium text-neutral-900 dark:bg-white/[0.09] dark:text-white"
                      : "text-neutral-500 hover:bg-black/[0.05] dark:text-neutral-400 dark:hover:bg-white/[0.05]"
                  )}
                >
                  <Icon className={cn("size-3.5", active && "text-[#fa2d48]")} />
                  {label}
                </button>
              ))}
            </div>
          ))}
          <p className="mt-auto px-1.5 font-mono text-[9px] leading-relaxed text-neutral-400 dark:text-neutral-600">
            no actual audio —<br />
            no licensing budget
          </p>
        </div>

        {/* ─── Main ─── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <h2 className="text-xl font-bold tracking-tight">Replay &apos;26</h2>
          <p className="mt-0.5 text-xs text-neutral-500">
            aryan&apos;s year in music · updated whenever
          </p>

          {/* Top Artists */}
          <h3 className="mt-5 mb-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Top Artists
          </h3>
          {/* pt/-mt give the hover scale headroom inside the scroll clip */}
          <div className="-mt-2 flex gap-4 overflow-x-auto pt-2 pb-1">
            {TOP_ARTISTS.map((artist, i) => (
              <motion.div
                key={artist.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                whileHover={{ scale: 1.05 }}
                className="flex w-20 shrink-0 flex-col items-center gap-1.5"
              >
                <div
                  className="flex size-18 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white/90"
                  style={{
                    background: `linear-gradient(135deg, hsl(${artist.hue} 65% 50%), hsl(${(artist.hue + 60) % 360} 70% 35%))`,
                  }}
                >
                  {artist.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>
                <span className="max-w-full truncate text-xs text-neutral-700 dark:text-neutral-300">
                  {artist.name}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Top Songs */}
          <h3 className="mt-5 mb-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
            Top Songs
          </h3>
          <div className="grid grid-cols-[28px_1fr_auto] items-center gap-x-3 border-b border-black/[0.08] px-2 py-1.5 font-mono text-[10px] tracking-wide text-neutral-500 uppercase @xl:grid-cols-[28px_1.4fr_1fr_auto] dark:border-white/[0.08]">
            <span>#</span>
            <span>Title</span>
            <span className="hidden @xl:block">Album</span>
            <Clock className="size-3" />
          </div>
          {TOP_TRACKS.map((track, i) => {
            const isCurrent = trackIdx === i
            return (
              <motion.button
                key={track.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => playTrack(i)}
                className={cn(
                  "group/row grid w-full grid-cols-[28px_1fr_auto] items-center gap-x-3 rounded-lg px-2 py-2 text-left transition-colors @xl:grid-cols-[28px_1.4fr_1fr_auto]",
                  isCurrent
                    ? "bg-black/[0.05] dark:bg-white/[0.07]"
                    : "hover:bg-black/[0.04] dark:hover:bg-white/[0.05]"
                )}
              >
                <span className="flex justify-center font-mono text-xs text-neutral-500">
                  {isCurrent ? (
                    <Equalizer playing={playing} />
                  ) : (
                    <>
                      <span className="group-hover/row:hidden">{i + 1}</span>
                      <Play className="hidden size-3 fill-current text-neutral-700 group-hover/row:block dark:text-neutral-200" />
                    </>
                  )}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <Artwork hue={track.hue} className="size-9 shrink-0 rounded-md" />
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm font-medium",
                        isCurrent ? "text-[#fa2d48]" : "text-neutral-900 dark:text-neutral-100"
                      )}
                    >
                      {track.title}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                      {track.explicit && <ExplicitBadge />}
                      <span className="truncate">{track.artist}</span>
                    </span>
                  </span>
                </span>
                <span className="hidden truncate text-xs text-neutral-400 @xl:block">
                  {track.album}
                </span>
                <span className="font-mono text-xs text-neutral-500 tabular-nums">
                  {track.duration}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { MusicApp }
