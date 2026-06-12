"use client"

import React, { useEffect, useRef, useState } from "react"
import { APPS, APP_ORDER } from "@/lib/os/apps"
import { useWindowManager, type AppId } from "@/lib/os/window-manager"

type Line = { id: number; type: "input" | "output"; text: string }

const FILES: Record<string, string> = {
  "about.txt": [
    "building at endeavor — ai for the physical world.",
    "",
    "i love ml and infra. currently finishing my MCS at UIUC (dec '26).",
    "trying to get better at neovim.",
    "",
    "if you're in sf let's grab a coffee.",
  ].join("\n"),
  "stack.txt": ["stack i actually use:", "  python  aws  postgres  redis  docker  typescript"].join(
    "\n"
  ),
  "coffee.txt": "in sf? email bahlaryan@gmail.com — first round's on me ☕",
  "todo.txt": [
    "[x] make website feel like an OS",
    "[ ] get better at neovim",
    "[ ] inbox zero (lol)",
  ].join("\n"),
}

const OPENABLE: Record<string, AppId> = {
  finder: "projects",
  projects: "projects",
  activity: "current",
  current: "current",
  calendar: "timeline",
  timeline: "timeline",
  notes: "notes",
  messages: "contact",
  contact: "contact",
  preview: "resume",
  resume: "resume",
  "resume.pdf": "resume",
  about: "about",
  trash: "trash",
  textedit: "textedit",
  "coffee.txt": "textedit",
  music: "music",
}

const NEOFETCH = String.raw`
   _____   ____      aryan@aryanos
  |  _  | |  _ \     -------------
  | |_| | | |_) |    OS:      aryanOS 1.0
  |  _  | |  _ <     Host:    portfolio (this window)
  | | | | | |_) |    Kernel:  next 16 / react 19
  |_| |_| |____/     Shell:   you, apparently
                     Editor:  vscode → neovim (in progress)
                     Base:    san francisco bay area
                     Now:     building at endeavor
                     Coffee:  yes
`

const HELP = [
  "available commands:",
  "  help              this",
  "  ls / cat <file>   poke around the filesystem",
  "  open <app>        launch an app (finder, notes, messages, …)",
  "  ps                list running apps",
  "  kill <app>        close an app",
  "  minimize <app>    send an app to the void (temporarily)",
  "  wallpaper         change the desktop wallpaper",
  "  sleep             put the whole OS to sleep",
  "  say <text>        make your computer talk (really)",
  "  cowsay <text>     a cow says it instead",
  "  neofetch          system info",
  "  fortune / whoami / uptime / history / man <cmd>",
  "  clear (or ctrl+l) wipe the screen · exit closes the terminal",
  "",
  "hint: tab completes. and there are a few undocumented ones.",
].join("\n")

const MAN_PAGES: Record<string, string> = {
  help: "help — lists commands. you just ran man on it. meta.",
  open: "open <app> — launches an app window. try `open notes` or `open coffee.txt`.",
  ps: "ps — shows every running app and whether it's focused or minimized.",
  kill: "kill <app> — closes an app's window. no processes were harmed.",
  wallpaper: "wallpaper — cycles Bloom → Reef → Dusk. the gradients are hand-mixed.",
  say: "say <text> — uses your browser's speech synthesis. volume up.",
  cowsay: "cowsay <text> — it's a cow. it says things. essential infrastructure.",
  sleep: "sleep — fades the OS to black. click anywhere to wake. no args, unlike real sleep.",
  sudo: "sudo — you're not in the sudoers file. this incident will be reported (it won't).",
  nvim: "nvim — aspirational.",
}

const FORTUNES = [
  "your pipeline will be event-driven. fewer retries than expected.",
  "a cache invalidation bug will humble you this quarter.",
  "the best infra is the kind nobody notices. keep it boring.",
  "you will exit vim on the first try today.",
  "someone in sf wants to get coffee with you. (it's aryan.)",
  "p99 looking good. ship it.",
  "the answer is redis. the question doesn't matter.",
]

function cowsay(text: string): string {
  const msg = text || "moo"
  const border = "-".repeat(msg.length + 2)
  return [
    ` ${border}`,
    `< ${msg} >`,
    ` ${border}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n")
}

// Module-scope helpers: impure (random/time), so they live outside render
const randomFortune = () => FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
const uptimeText = () =>
  `up ${Math.max(1, Math.round((Date.now() - performance.timeOrigin) / 1000 / 60))} min (since you opened this site) · load average: see Activity Monitor`

const COMMANDS = [
  "help",
  "whoami",
  "ls",
  "cat",
  "open",
  "ps",
  "top",
  "apps",
  "kill",
  "close",
  "minimize",
  "wallpaper",
  "sleep",
  "say",
  "cowsay",
  "neofetch",
  "fortune",
  "uptime",
  "history",
  "man",
  "date",
  "pwd",
  "echo",
  "clear",
  "nvim",
  "sudo",
  "make",
  "rm",
  "exit",
  "hire",
  "coffee",
  "github",
  "linkedin",
  "email",
  "tree",
  "cd",
]

function Prompt() {
  return (
    <span className="shrink-0 whitespace-pre">
      <span className="text-emerald-400">aryan@aryanos</span>
      <span className="text-neutral-500"> ~ </span>
      <span className="text-sky-400">%</span>{" "}
    </span>
  )
}

function TerminalApp() {
  const wm = useWindowManager()
  const [lines, setLines] = useState<Line[]>([
    { id: 0, type: "output", text: "Last login: just now, from somewhere nice" },
    { id: 1, type: "output", text: "Welcome to aryanOS. Type `help` to get started." },
  ])
  const [draft, setDraft] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const nextId = useRef(10)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [lines])

  const print = (text: string) =>
    setLines((prev) => [...prev, { id: nextId.current++, type: "output", text }])

  const runningApps = () =>
    APP_ORDER.filter((id) => wm.windows[id]?.open).map((id) => ({
      id,
      title: APPS[id].title,
      minimized: wm.windows[id]?.minimized,
      focused: wm.topApp === id,
    }))

  const resolveApp = (arg: string): AppId | undefined =>
    OPENABLE[arg] ?? APP_ORDER.find((id) => APPS[id].title.toLowerCase() === arg)

  const run = (raw: string) => {
    const input = raw.trim()
    setLines((prev) => [...prev, { id: nextId.current++, type: "input", text: raw }])
    if (!input) return
    setHistory((prev) => [...prev, input])
    setHistoryIdx(-1)

    const [cmd, ...args] = input.split(/\s+/)
    const arg = args.join(" ").toLowerCase()

    switch (cmd.toLowerCase()) {
      case "help":
        print(HELP)
        break
      case "whoami":
        print("a visitor with excellent taste in portfolios")
        break
      case "ls":
        print(Object.keys(FILES).join("   ") + "   Applications/")
        break
      case "tree":
        print(
          [
            ".",
            "├── " + Object.keys(FILES).join("\n├── "),
            "└── Applications/",
            ...APP_ORDER.map(
              (id, i) => `    ${i === APP_ORDER.length - 1 ? "└──" : "├──"} ${APPS[id].title}.app`
            ),
          ].join("\n")
        )
        break
      case "cat":
        if (!arg) print("cat: which file? try `ls`")
        else if (arg === "resume.pdf") print("cat: resume.pdf: binary file — try `open resume`")
        else print(FILES[arg] ?? `cat: ${arg}: No such file (try \`ls\`)`)
        break
      case "open": {
        const appId = resolveApp(arg)
        if (!arg) print("open: open what? try `open notes`")
        else if (appId) {
          print(`opening ${arg}…`)
          wm.openApp(appId)
        } else print(`open: no app called '${arg}'. try \`tree\` to see what's installed`)
        break
      }
      case "ps":
      case "top":
      case "apps": {
        const apps = runningApps()
        if (!apps.length) {
          print("no apps running. it's quiet. too quiet. try `open finder`")
          break
        }
        print(
          [
            "PID   STATE        APP",
            ...apps.map(
              (a, i) =>
                `${String(1000 + i).padEnd(6)}${(a.focused ? "focused" : a.minimized ? "minimized" : "running").padEnd(13)}${a.title}`
            ),
          ].join("\n")
        )
        break
      }
      case "kill":
      case "close": {
        const appId = resolveApp(arg)
        if (!arg) print(`${cmd}: which app? try \`ps\``)
        else if (appId === "terminal") print(`${cmd}: refusing to ${cmd} myself. use \`exit\`.`)
        else if (appId && wm.windows[appId]?.open) {
          wm.closeApp(appId)
          print(`[1]  + terminated  ${APPS[appId].title}`)
        } else print(`${cmd}: no running app called '${arg}'`)
        break
      }
      case "minimize": {
        const appId = resolveApp(arg)
        if (!arg) print("minimize: which app? try `ps`")
        else if (appId && wm.windows[appId]?.open) {
          wm.minimizeApp(appId)
          print(`${APPS[appId].title} → the void (click its dock icon to restore)`)
        } else print(`minimize: no running app called '${arg}'`)
        break
      }
      case "wallpaper": {
        const name = wm.desktopActions.current.nextWallpaper?.()
        print(name ? `wallpaper set to '${name}'` : "wallpaper: desktop not ready")
        break
      }
      case "sleep":
        print("good night.")
        setTimeout(() => wm.desktopActions.current.sleep?.(), 500)
        break
      case "say": {
        if (!arg) {
          print("say: say what?")
          break
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(args.join(" ")))
          print(`🔊 "${args.join(" ")}"`)
        } else print("say: speech synthesis unavailable in this browser")
        break
      }
      case "cowsay":
        print(cowsay(args.join(" ")))
        break
      case "fortune":
        print(randomFortune())
        break
      case "uptime":
        print(uptimeText())
        break
      case "history":
        print(history.map((h, i) => `  ${i + 1}  ${h}`).join("\n") || "no history yet")
        break
      case "man":
        if (!arg) print("man: what manual page do you want?")
        else print(MAN_PAGES[arg] ?? `no manual entry for ${arg} (it's probably self-explanatory)`)
        break
      case "neofetch":
      case "screenfetch":
        print(NEOFETCH.trimEnd())
        break
      case "date":
        print(new Date().toString())
        break
      case "pwd":
        print("/Users/visitor/somewhere-on-the-internet")
        break
      case "cd":
        print("cd: there's nowhere else to go. this is the whole computer.")
        break
      case "echo":
        print(args.join(" "))
        break
      case "clear":
        setLines([])
        break
      case "nvim":
      case "vim":
      case "vi":
        print("opening neovim…\n\njust kidding — still learning. (:wq to pretend you knew that)")
        break
      case "sudo":
        if (arg.includes("coffee")) print("☕ brewing… done. it's in sf, come pick it up.")
        else if (arg.startsWith("rm")) runRmRf()
        else
          print(
            "we trust you have received the usual lecture from the local system\nadministrator. it usually boils down to:\n\n    #1) this is a portfolio. nice try though."
          )
        break
      case "make":
        if (arg.includes("coffee")) print("make: *** missing sudo. try `sudo make coffee`. Stop.")
        else print(`make: *** no rule to make target '${arg || ""}'. Stop.`)
        break
      case "rm":
        if (arg.replace(/\s/g, "").includes("-rf/")) runRmRf()
        else print("rm: permission denied. i worked hard on this.")
        break
      case "touch":
        print(`touch: '${arg || "file"}' created. (it wasn't. nothing here is real.)`)
        break
      case "mkdir":
        print("mkdir: this filesystem is read-only and also imaginary")
        break
      case "coffee":
        print(FILES["coffee.txt"])
        break
      case "github":
        print("opening github.com/Bahl-Aryan…")
        window.open("https://github.com/Bahl-Aryan", "_blank")
        break
      case "linkedin":
        print("opening linkedin.com/in/bahl-aryan…")
        window.open("https://linkedin.com/in/bahl-aryan", "_blank")
        break
      case "email":
        print("composing to bahlaryan@gmail.com…")
        window.open("mailto:bahlaryan@gmail.com")
        break
      case "exit":
        print("logout")
        setTimeout(() => wm.closeApp("terminal"), 400)
        break
      case "hire":
        print("now we're talking → bahlaryan@gmail.com")
        break
      default:
        print(`zsh: command not found: ${cmd} (try \`help\`)`)
    }
  }

  const runRmRf = () => {
    const doomed = [
      "/System/aryanOS",
      "/Applications/Finder.app",
      "/Users/aryan/hopes",
      "/var/coffee",
    ]
    doomed.forEach((path, i) => setTimeout(() => print(`removing ${path}…`), 300 * (i + 1)))
    setTimeout(
      () => print("\n…just kidding. everything is fine. please never do that on a real machine."),
      300 * (doomed.length + 1) + 400
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(draft)
      setDraft("")
    } else if (e.key === "Tab") {
      e.preventDefault()
      const word = draft.trim().toLowerCase()
      if (!word) return
      const matches = COMMANDS.filter((c) => c.startsWith(word))
      if (matches.length === 1) setDraft(matches[0] + " ")
      else if (matches.length > 1) print(matches.join("   "))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (history.length === 0) return
      const idx = historyIdx === -1 ? history.length - 1 : Math.max(historyIdx - 1, 0)
      setHistoryIdx(idx)
      setDraft(history[idx])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIdx === -1) return
      const idx = historyIdx + 1
      if (idx >= history.length) {
        setHistoryIdx(-1)
        setDraft("")
      } else {
        setHistoryIdx(idx)
        setDraft(history[idx])
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault()
      setLines((prev) => [...prev, { id: nextId.current++, type: "input", text: draft + "^C" }])
      setDraft("")
    }
  }

  return (
    <div
      ref={scrollRef}
      className="h-full cursor-text overflow-y-auto bg-[#1a1b21]/95 p-3 font-mono text-[12.5px] leading-relaxed text-neutral-200"
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line) =>
        line.type === "input" ? (
          <div key={line.id} className="flex">
            <Prompt />
            <span className="break-all whitespace-pre-wrap">{line.text}</span>
          </div>
        ) : (
          <pre key={line.id} className="break-words whitespace-pre-wrap text-neutral-300">
            {line.text}
          </pre>
        )
      )}
      <div className="flex">
        <Prompt />
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="min-w-0 flex-1 bg-transparent text-neutral-100 caret-emerald-400 outline-none"
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}

export { TerminalApp }
