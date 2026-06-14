import type { ComponentType } from "react"
import type { AppId } from "@/lib/os/window-manager"
import { CurrentApp } from "@/components/os/apps/CurrentApp"
import { ProjectsApp } from "@/components/os/apps/ProjectsApp"
import { TimelineApp } from "@/components/os/apps/TimelineApp"
import { NotesApp } from "@/components/os/apps/NotesApp"
import { ContactApp } from "@/components/os/apps/ContactApp"
import { ResumeApp } from "@/components/os/apps/ResumeApp"
import { AboutApp } from "@/components/os/apps/AboutApp"
import { TerminalApp } from "@/components/os/apps/TerminalApp"
import { TrashApp } from "@/components/os/apps/TrashApp"
import { TextEditApp } from "@/components/os/apps/TextEditApp"
import { MusicApp } from "@/components/os/apps/MusicApp"

export type AppDefinition = {
  id: AppId
  title: string // window titlebar / menu bar app name
  dockLabel: string // dock tooltip
  spotlight: string // one-liner in Spotlight results
  component: ComponentType
  defaultSize: { w: number; h: number }
  minSize: { w: number; h: number }
  alwaysDark?: boolean // app styles itself dark (Terminal, Music) - skip the dark-mode remap
}

export const APPS: Record<AppId, AppDefinition> = {
  current: {
    id: "current",
    title: "Activity Monitor",
    dockLabel: "Current",
    spotlight: "what's running on my brain right now",
    component: CurrentApp,
    defaultSize: { w: 680, h: 520 },
    minSize: { w: 440, h: 340 },
  },
  projects: {
    id: "projects",
    title: "Finder",
    dockLabel: "Projects",
    spotlight: "things i've built",
    component: ProjectsApp,
    defaultSize: { w: 800, h: 560 },
    minSize: { w: 460, h: 360 },
  },
  timeline: {
    id: "timeline",
    title: "Calendar",
    dockLabel: "Timeline",
    spotlight: "where i've been",
    component: TimelineApp,
    defaultSize: { w: 680, h: 580 },
    minSize: { w: 380, h: 320 },
  },
  notes: {
    id: "notes",
    title: "Notes",
    dockLabel: "Notes",
    spotlight: "live notes, straight from my desk",
    component: NotesApp,
    defaultSize: { w: 760, h: 540 },
    minSize: { w: 420, h: 340 },
  },
  contact: {
    id: "contact",
    title: "Messages",
    dockLabel: "Contact",
    spotlight: "say hi",
    component: ContactApp,
    defaultSize: { w: 520, h: 600 },
    minSize: { w: 360, h: 380 },
  },
  resume: {
    id: "resume",
    title: "Preview",
    dockLabel: "Résumé",
    spotlight: "Aryan_Bahl_Resume.pdf",
    component: ResumeApp,
    defaultSize: { w: 720, h: 720 },
    minSize: { w: 400, h: 400 },
  },
  about: {
    id: "about",
    title: "About",
    dockLabel: "About",
    spotlight: "about this aryan",
    component: AboutApp,
    defaultSize: { w: 440, h: 600 },
    minSize: { w: 360, h: 420 },
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    dockLabel: "Terminal",
    spotlight: "aryan@aryanos ~ % type `help`",
    component: TerminalApp,
    defaultSize: { w: 660, h: 440 },
    minSize: { w: 420, h: 300 },
    alwaysDark: true,
  },
  trash: {
    id: "trash",
    title: "Trash",
    dockLabel: "Trash",
    spotlight: "empty. i ship everything",
    component: TrashApp,
    defaultSize: { w: 480, h: 360 },
    minSize: { w: 360, h: 280 },
  },
  textedit: {
    id: "textedit",
    title: "TextEdit",
    dockLabel: "coffee.txt",
    spotlight: "coffee.txt · sf, first round's on me",
    component: TextEditApp,
    defaultSize: { w: 520, h: 480 },
    minSize: { w: 360, h: 300 },
  },
  music: {
    id: "music",
    title: "Music",
    dockLabel: "Music",
    spotlight: "replay '26 · top tracks and artists",
    component: MusicApp,
    defaultSize: { w: 760, h: 580 },
    minSize: { w: 420, h: 380 },
    alwaysDark: true,
  },
}

// Render order for the window layer (all apps)
export const APP_ORDER: AppId[] = [
  "current",
  "projects",
  "timeline",
  "notes",
  "contact",
  "terminal",
  "resume",
  "about",
  "trash",
  "textedit",
  "music",
]

// What actually sits in the dock (trash is rendered separately after a divider)
export const DOCK_APPS: AppId[] = [
  "current",
  "projects",
  "timeline",
  "notes",
  "music",
  "contact",
  "terminal",
]

// What Spotlight can launch
export const SPOTLIGHT_APPS: AppId[] = [
  "projects",
  "current",
  "timeline",
  "notes",
  "contact",
  "terminal",
  "music",
  "resume",
  "about",
  "trash",
  "textedit",
]
