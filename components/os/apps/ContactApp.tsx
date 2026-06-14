"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, FileText, Github, Linkedin, Mail } from "lucide-react"
import { useWindowManager } from "@/lib/os/window-manager"
import { subscribeToMessages } from "@/lib/os/message-bus"
import { cn } from "@/lib/utils"

type Bubble = { id: number; from: "aryan" | "you"; text: string }

const OPENERS: Bubble[] = [
  { id: 1, from: "aryan", text: "hey! 👋 thanks for stopping by" },
  { id: 2, from: "aryan", text: "ask me anything about aryan. his work, stack, projects" },
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

const SUGGESTIONS = [
  "what's he working on right now?",
  "what's his stack?",
  "tell me about a project",
  "how do i reach him?",
]

const FALLBACK_REPLY =
  "auto-reply: i'm not actually in this window 😅 shoot me an email at bahlaryan@gmail.com and the real me will get back to you"

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-black/[0.07] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-neutral-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function ContactApp() {
  const { openApp } = useWindowManager()
  const [bubbles, setBubbles] = useState<Bubble[]>(OPENERS)
  const [draft, setDraft] = useState("")
  const [typing, setTyping] = useState(false)
  // null = unknown (probe on first send), then true/false
  const [aiMode, setAiMode] = useState<boolean | null>(null)
  const [fellBack, setFellBack] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(10)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [bubbles, typing])

  const appendBubble = (from: Bubble["from"], text: string) =>
    setBubbles((prev) => [...prev, { id: nextId.current++, from, text }])

  // Incoming texts from elsewhere in the OS (e.g. notification "Reply")
  useEffect(() => {
    return subscribeToMessages((text) =>
      setBubbles((prev) =>
        prev.some((b) => b.text === text)
          ? prev
          : [...prev, { id: nextId.current++, from: "aryan", text }]
      )
    )
  }, [])

  const cannedReply = () => {
    if (fellBack) return
    setFellBack(true)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      appendBubble("aryan", FALLBACK_REPLY)
    }, 900)
  }

  const send = async (textArg?: string) => {
    const text = (textArg ?? draft).trim()
    if (!text || typing) return
    setDraft("")
    const history = [...bubbles, { id: nextId.current, from: "you" as const, text }]
    appendBubble("you", text)

    if (aiMode === false) {
      cannedReply()
      return
    }

    setTyping(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((b) => ({
            role: b.from === "you" ? "user" : "assistant",
            content: b.text,
          })),
        }),
      })
      if (res.status === 501) {
        setAiMode(false)
        setTyping(false)
        cannedReply()
        return
      }
      if (res.status === 429) {
        setTyping(false)
        appendBubble(
          "aryan",
          "whoa, slow down 😅 give it a minute, or just email bahlaryan@gmail.com"
        )
        return
      }
      if (!res.ok) throw new Error(`chat failed: ${res.status}`)
      const data = await res.json()
      setAiMode(true)
      // A little human delay so the typing bubble registers
      setTimeout(() => {
        setTyping(false)
        appendBubble("aryan", data.reply)
      }, 400)
    } catch {
      setTyping(false)
      appendBubble("aryan", "hmm, that didn't go through. email bahlaryan@gmail.com instead 📬")
    }
  }

  const lastYouId = [...bubbles].reverse().find((b) => b.from === "you")?.id
  const showSuggestions = aiMode !== false && !bubbles.some((b) => b.from === "you")

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
          {aiMode ? "aryan-bot · answers from his resume only" : "usually online"}
        </p>
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
        <p className="pb-1 text-center font-mono text-[10px] text-neutral-300">today</p>
        {bubbles.map((bubble) => (
          <div key={bubble.id}>
            <motion.div
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
            {bubble.id === lastYouId && !typing && (
              <p className="mt-0.5 pr-1 text-right font-mono text-[9px] text-neutral-400">
                Delivered
              </p>
            )}
          </div>
        ))}

        <AnimatePresence>{typing && <TypingBubble />}</AnimatePresence>

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

      {/* Suggested replies (until the first message is sent) */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-1.5 overflow-x-auto px-3 pb-1.5"
          >
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => send(suggestion)}
                className="shrink-0 rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs text-[#2563eb] transition-colors hover:bg-blue-100"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-black/[0.06] px-3 py-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="iMessage"
          maxLength={500}
          className="flex-1 rounded-full border border-black/[0.1] bg-white/70 px-3.5 py-1.5 text-sm text-neutral-800 placeholder-neutral-400 outline-none focus:border-blue-300"
        />
        <button
          onClick={() => send()}
          disabled={!draft.trim() || typing}
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
