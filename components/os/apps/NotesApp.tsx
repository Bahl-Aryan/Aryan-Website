"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { Lock, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Note = {
  id: string
  title: string
  date: string
  body: string
}

const POLL_INTERVAL_MS = 10_000
const TOKEN_KEY = "aryanos-notes-token"

const SOURCE_LABEL: Record<string, string> = {
  live: "live · synced from my desk",
  github: "live · reading from github",
  file: "live · edited straight from my desk",
}

function NotesApp() {
  const [notes, setNotes] = useState<Note[] | null>(null)
  const [source, setSource] = useState<string>("file")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [syncedAt, setSyncedAt] = useState<Date | null>(null)
  const [query, setQuery] = useState("")

  // ── Admin editing state ───────────────────────────────────────
  const [showUnlock, setShowUnlock] = useState(false)
  const [tokenDraft, setTokenDraft] = useState("")
  const [token, setToken] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Note[] | null>(null)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [saveError, setSaveError] = useState("")
  const shake = useAnimation()

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY))
  }, [])

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notes", { cache: "no-store" })
      if (!res.ok) throw new Error(`notes fetch failed: ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data.notes)) return
      setNotes(data.notes)
      setSource(data.source ?? "file")
      setSyncedAt(new Date())
      setError(false)
      setSelectedId((prev) => prev ?? data.notes[0]?.id ?? null)
    } catch {
      setError(true)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [load])

  // ── Editing helpers ───────────────────────────────────────────
  const startEditing = () => {
    setDraft(structuredClone(notes ?? []))
    setEditing(true)
    setSaveState("idle")
  }

  const save = async () => {
    if (!draft || !token) return
    setSaveState("saving")
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: draft }),
      })
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setEditing(false)
        setSaveState("error")
        setSaveError("wrong token, locked again")
        // The login-window headshake
        shake.start({ x: [0, -12, 12, -8, 8, -4, 4, 0], transition: { duration: 0.45 } })
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setSaveState("error")
        setSaveError(data.error ?? `save failed (${res.status})`)
        return
      }
      setNotes(draft)
      setEditing(false)
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2500)
    } catch {
      setSaveState("error")
      setSaveError("network error")
    }
  }

  const updateDraft = (id: string, patch: Partial<Note>) =>
    setDraft((prev) => prev?.map((n) => (n.id === id ? { ...n, ...patch } : n)) ?? null)

  const addNote = () => {
    const id = `note-${Date.now().toString(36)}`
    const today = new Date().toISOString().slice(0, 10)
    setDraft((prev) => [{ id, title: "new note", date: today, body: "" }, ...(prev ?? [])])
    setSelectedId(id)
  }

  const deleteNote = (id: string) => {
    setDraft((prev) => prev?.filter((n) => n.id !== id) ?? null)
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  // ── Derived ───────────────────────────────────────────────────
  const list = editing ? draft : notes
  const q = query.trim().toLowerCase()
  const visible = editing
    ? list
    : (list?.filter(
        (n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      ) ?? null)
  const selected = visible?.find((n) => n.id === selectedId) ?? visible?.[0]

  return (
    <motion.div animate={shake} className="flex h-full flex-col">
      {/* Status strip */}
      <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-2 font-mono text-[10px] text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              error ? "bg-amber-400" : editing ? "bg-blue-400" : "animate-pulse bg-emerald-400"
            )}
          />
          {editing
            ? "editing. visitors still see the old version until you save"
            : error
              ? "offline, showing last loaded"
              : (SOURCE_LABEL[source] ?? SOURCE_LABEL.file)}
        </span>
        <span className="flex items-center gap-2">
          {saveState === "saved" && <span className="text-emerald-500">saved ✓</span>}
          {saveState === "error" && <span className="text-red-400">{saveError}</span>}
          {!editing && syncedAt && (
            <span>
              synced {syncedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          {editing ? (
            <>
              <button
                onClick={save}
                disabled={saveState === "saving"}
                className="rounded bg-blue-500 px-2 py-0.5 text-white disabled:opacity-50"
              >
                {saveState === "saving" ? "saving…" : "save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                aria-label="Cancel editing"
                className="rounded p-0.5 hover:bg-black/[0.06]"
              >
                <X className="size-3" />
              </button>
            </>
          ) : token ? (
            <button
              onClick={startEditing}
              aria-label="Edit notes"
              className="rounded p-0.5 text-neutral-400 hover:bg-black/[0.06] hover:text-neutral-600"
            >
              <Pencil className="size-3" />
            </button>
          ) : (
            <button
              onClick={() => setShowUnlock((s) => !s)}
              aria-label="Unlock editing"
              className="rounded p-0.5 text-neutral-300 hover:bg-black/[0.06] hover:text-neutral-500"
            >
              <Lock className="size-3" />
            </button>
          )}
        </span>
      </div>

      {/* Token unlock row (admin only - visitors will never have the token) */}
      {showUnlock && !token && (
        <div className="flex items-center gap-2 border-b border-black/[0.05] bg-amber-50/60 px-4 py-1.5">
          <input
            type="password"
            value={tokenDraft}
            onChange={(e) => setTokenDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tokenDraft) {
                localStorage.setItem(TOKEN_KEY, tokenDraft)
                setToken(tokenDraft)
                setShowUnlock(false)
                setTokenDraft("")
              }
            }}
            placeholder="admin token (aryan only, nice try)"
            className="flex-1 bg-transparent font-mono text-[11px] text-neutral-700 placeholder-neutral-400 outline-none"
          />
        </div>
      )}

      {notes === null ? (
        <div className="flex flex-1 items-center justify-center font-mono text-xs text-neutral-400">
          {error ? "couldn't load notes, try again in a bit" : "loading notes…"}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col @md:flex-row">
          {/* Note list */}
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/[0.05] bg-black/[0.02] p-2 @md:w-56 @md:flex-col @md:overflow-y-auto @md:border-r @md:border-b-0">
            {editing ? (
              <button
                onClick={addNote}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus className="size-3.5" /> new note
              </button>
            ) : (
              <div className="hidden items-center gap-1.5 rounded-lg bg-black/[0.05] px-2.5 py-1.5 @md:flex">
                <Search className="size-3 shrink-0 text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full bg-transparent text-xs text-neutral-700 placeholder-neutral-400 outline-none"
                />
              </div>
            )}
            <p className="hidden px-2 pt-2 pb-1 font-mono text-[10px] tracking-wide text-neutral-400 uppercase @md:block">
              All Notes ({(visible ?? []).length})
            </p>
            {(visible ?? []).map((note) => (
              <div key={note.id} className="group/item relative shrink-0 @md:w-full">
                <button
                  onClick={() => setSelectedId(note.id)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left transition-colors",
                    note.id === (selected?.id ?? null) ? "bg-amber-100/80" : "hover:bg-black/[0.04]"
                  )}
                >
                  <p className="truncate pr-5 text-xs font-semibold text-neutral-800">
                    {note.title || "untitled"}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-neutral-400">{note.date}</p>
                </button>
                {editing && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    aria-label={`Delete ${note.title}`}
                    className="absolute top-2 right-2 hidden rounded p-0.5 text-neutral-400 group-hover/item:block hover:text-red-500"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Note body */}
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {selected ? (
              editing ? (
                <div className="flex h-full flex-col gap-3">
                  <input
                    value={selected.title}
                    onChange={(e) => updateDraft(selected.id, { title: e.target.value })}
                    className="border-b border-black/[0.08] bg-transparent pb-1 text-base font-semibold tracking-tight text-neutral-900 outline-none"
                    placeholder="title"
                  />
                  <textarea
                    value={selected.body}
                    onChange={(e) => updateDraft(selected.id, { body: e.target.value })}
                    className="min-h-0 flex-1 resize-none bg-transparent text-sm leading-relaxed text-neutral-600 outline-none"
                    placeholder="write something… (blank line = new paragraph)"
                  />
                </div>
              ) : (
                <>
                  <h3 className="text-base font-semibold tracking-tight text-neutral-900">
                    {selected.title}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-neutral-400">{selected.date}</p>
                  <div className="mt-4 space-y-3">
                    {selected.body.split(/\n\n+/).map((paragraph, i) => (
                      <p
                        key={i}
                        className="text-sm leading-relaxed whitespace-pre-line text-neutral-600"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </>
              )
            ) : (
              <p className="font-mono text-xs text-neutral-400">no notes yet, check back soon</p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export { NotesApp }
