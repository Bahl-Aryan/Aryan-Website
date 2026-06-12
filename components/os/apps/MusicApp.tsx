"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Clock, Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react"
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
    <span className="inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] bg-neutral-600 text-[8px] font-bold text-neutral-200">
      E
    </span>
  )
}

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
    <div className="flex h-full flex-col bg-[#1c1c20] text-neutral-100">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-xl font-bold tracking-tight">Replay &apos;26</h2>
        <p className="mt-0.5 font-mono text-[11px] text-neutral-500">
          what i actually listen to while shipping
        </p>

        {/* Top Artists */}
        <h3 className="mt-5 mb-2.5 text-sm font-semibold text-neutral-300">Top Artists</h3>
        <div className="flex gap-4 overflow-x-auto pb-1">
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
              <span className="max-w-full truncate text-xs text-neutral-300">{artist.name}</span>
            </motion.div>
          ))}
        </div>

        {/* Top Songs */}
        <h3 className="mt-5 mb-1 text-sm font-semibold text-neutral-300">Top Songs</h3>
        <div className="grid grid-cols-[24px_1fr_auto] items-center gap-x-3 border-b border-white/[0.08] px-2 py-1.5 font-mono text-[10px] tracking-wide text-neutral-500 uppercase @lg:grid-cols-[24px_1.4fr_1fr_auto]">
          <span>#</span>
          <span>Title</span>
          <span className="hidden @lg:block">Album</span>
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
              onDoubleClick={() => playTrack(i)}
              onClick={() => playTrack(i)}
              className={cn(
                "grid w-full grid-cols-[24px_1fr_auto] items-center gap-x-3 rounded-lg px-2 py-2 text-left transition-colors @lg:grid-cols-[24px_1.4fr_1fr_auto]",
                isCurrent ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
              )}
            >
              <span className="font-mono text-xs text-neutral-500">
                {isCurrent ? <Equalizer playing={playing} /> : i + 1}
              </span>
              <span className="flex min-w-0 items-center gap-2.5">
                <Artwork hue={track.hue} className="size-9 shrink-0 rounded-md" />
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      isCurrent ? "text-[#fa2d48]" : "text-neutral-100"
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
              <span className="hidden truncate text-xs text-neutral-400 @lg:block">
                {track.album}
              </span>
              <span className="font-mono text-xs text-neutral-500 tabular-nums">
                {track.duration}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Now playing bar */}
      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ y: 60 }}
            animate={{ y: 0 }}
            exit={{ y: 60 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="border-t border-white/[0.08] bg-[#232328] px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <Artwork hue={current.hue} className="size-10 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{current.title}</p>
                <p className="truncate text-xs text-neutral-400">{current.artist}</p>
                {/* fake progress — restarts per track, because there is no audio */}
                <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-white/10">
                  {playing && (
                    <motion.div
                      key={`${trackIdx}-${playing}`}
                      className="h-full bg-[#fa2d48]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: durationToSeconds(current.duration), ease: "linear" }}
                      onAnimationComplete={() => skip(1)}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => skip(-1)}
                  aria-label="Previous"
                  className="rounded-full p-1.5 text-neutral-300 hover:bg-white/[0.08]"
                >
                  <SkipBack className="size-4 fill-current" />
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? "Pause" : "Play"}
                  className="rounded-full bg-white/[0.08] p-2 text-white hover:bg-white/[0.14]"
                >
                  {playing ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 fill-current" />
                  )}
                </button>
                <button
                  onClick={() => skip(1)}
                  aria-label="Next"
                  className="rounded-full p-1.5 text-neutral-300 hover:bg-white/[0.08]"
                >
                  <SkipForward className="size-4 fill-current" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-right font-mono text-[9px] text-neutral-600">
              (no actual audio — i don&apos;t have the licensing budget)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { MusicApp }
