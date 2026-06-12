"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { ArrowUp, FileText, Github, Linkedin, Mail } from "lucide-react"
import { useWindowManager } from "@/lib/os/window-manager"
import { cn } from "@/lib/utils"

type Bubble = { id: number; from: "aryan" | "you"; text: string }

const OPENERS: Bubble[] = [
  { id: 1, from: "aryan", text: "hey! 👋 thanks for stopping by" },
  { id: 2, from: "aryan", text: "fastest way to reach me is email — i actually reply" },
  {
    id: 3,
    from: "aryan",
    text: "always down to talk ml, infra, or why this website has a dock",
  },
  { id: 4, from: "aryan", text: "in sf? let's grab a coffee ☕" },
]

const QUICK_LINKS = [
  { icon: Mail, label: "bahlaryan@gmail.com", href: "mailto:bahlaryan@gmail.com" },
  {
    icon: Linkedin,
    label: "linkedin.com/in/bahl-aryan",
    href: "https://linkedin.com/in/bahl-aryan",
  },
  { icon: Github, label: "github.com/Bahl-Aryan", href: "https://github.com/Bahl-Aryan" },
]

function ContactApp() {
  const { openApp } = useWindowManager()
  const [bubbles, setBubbles] = useState<Bubble[]>(OPENERS)
  const [draft, setDraft] = useState("")
  const [replied, setReplied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(10)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [bubbles])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setDraft("")
    setBubbles((prev) => [...prev, { id: nextId.current++, from: "you", text }])
    if (!replied) {
      setReplied(true)
      setTimeout(() => {
        setBubbles((prev) => [
          ...prev,
          {
            id: nextId.current++,
            from: "aryan",
            text: "auto-reply: i'm not actually in this window 😅 — email bahlaryan@gmail.com and the real me will get back to you",
          },
        ])
      }, 900)
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Contact header */}
      <div className="flex flex-col items-center border-b border-black/[0.06] px-4 pt-3 pb-2.5">
        <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
          AB
        </div>
        <p className="mt-1 text-xs font-semibold text-neutral-800">Aryan Bahl</p>
        <p className="flex items-center gap-1 font-mono text-[10px] text-neutral-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          usually online
        </p>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
        <p className="pb-1 text-center font-mono text-[10px] text-neutral-300">today</p>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn("flex", bubble.from === "you" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug",
                bubble.from === "you"
                  ? "rounded-br-md bg-[#2563eb] text-white"
                  : "rounded-bl-md bg-black/[0.07] text-neutral-800"
              )}
            >
              {bubble.text}
            </div>
          </motion.div>
        ))}

        {/* Tappable link bubbles */}
        <div className="flex flex-col items-start gap-1.5 pt-2">
          {QUICK_LINKS.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-black/[0.07] px-3.5 py-2 text-sm text-[#2563eb] transition-colors hover:bg-blue-50"
            >
              <Icon className="size-3.5" />
              {label}
            </a>
          ))}
          <button
            onClick={() => openApp("resume")}
            className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-black/[0.07] px-3.5 py-2 text-sm text-[#2563eb] transition-colors hover:bg-blue-50"
          >
            <FileText className="size-3.5" />
            Aryan_Bahl_Resume.pdf
          </button>
        </div>
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="iMessage"
          className="flex-1 rounded-full border border-black/[0.1] bg-white/70 px-3.5 py-1.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-300"
        />
        <button
          onClick={send}
          disabled={!draft.trim()}
          aria-label="Send"
          className="flex size-7 items-center justify-center rounded-full bg-[#2563eb] text-white transition-opacity disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
      </div>
    </div>
  )
}

export { ContactApp }
