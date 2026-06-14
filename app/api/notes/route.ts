import { promises as fs } from "fs"
import path from "path"

// Notes storage, in order of preference:
//   1. Redis over REST (Upstash) for truly live notes: edits from the in-app
//      editor (POST below) show up for every visitor within one poll (~10s).
//   2. GitHub raw fallback: content/notes.json on main, no redeploy needed.
//   3. The bundled file: dev mode and last resort.
//
// Setup for (1) on Railway: add an Upstash Redis database (or Railway's Redis
// plugin with an Upstash-style REST shim), set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN, plus NOTES_ADMIN_TOKEN (a long random secret that
// unlocks the editor inside the Notes app). KV_REST_API_* are also accepted.

const KV_KEY = "aryanos:notes"
const RAW_NOTES_URL =
  "https://raw.githubusercontent.com/Bahl-Aryan/Aryan-Website/main/content/notes.json"

export const dynamic = "force-dynamic"

type NotesPayload = { notes: { id: string; title: string; date: string; body: string }[] }

function kvConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url, token } : null
}

async function kvCommand(cmd: (string | number)[]) {
  const kv = kvConfig()
  if (!kv) return null
  const res = await fetch(kv.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${kv.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`kv ${cmd[0]} failed: ${res.status}`)
  return (await res.json()) as { result: unknown }
}

function isValidPayload(data: unknown): data is NotesPayload {
  if (typeof data !== "object" || data === null) return false
  const notes = (data as { notes?: unknown }).notes
  return (
    Array.isArray(notes) &&
    notes.every(
      (n) =>
        typeof n === "object" &&
        n !== null &&
        typeof (n as { id?: unknown }).id === "string" &&
        typeof (n as { title?: unknown }).title === "string" &&
        typeof (n as { date?: unknown }).date === "string" &&
        typeof (n as { body?: unknown }).body === "string"
    )
  )
}

export async function GET() {
  // 1. KV (live)
  try {
    const res = await kvCommand(["GET", KV_KEY])
    if (res && typeof res.result === "string") {
      const data = JSON.parse(res.result)
      if (isValidPayload(data)) return Response.json({ ...data, source: "live" })
    }
  } catch {
    // fall through
  }

  // 2. GitHub raw (production only - dev should show the local file)
  if (process.env.NODE_ENV === "production") {
    try {
      const res = await fetch(RAW_NOTES_URL, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (isValidPayload(data)) return Response.json({ ...data, source: "github" })
      }
    } catch {
      // fall through
    }
  }

  // 3. Bundled file
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "content", "notes.json"), "utf8")
    return Response.json({ ...JSON.parse(raw), source: "file" })
  } catch {
    return Response.json({ notes: [], source: "none" })
  }
}

export async function POST(request: Request) {
  const adminToken = process.env.NOTES_ADMIN_TOKEN
  if (!adminToken) {
    return Response.json(
      { error: "editing not configured (set NOTES_ADMIN_TOKEN)" },
      { status: 501 }
    )
  }
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${adminToken}`) {
    return Response.json({ error: "wrong token" }, { status: 401 })
  }
  if (!kvConfig()) {
    return Response.json(
      { error: "no redis store configured (set UPSTASH_REDIS_REST_URL/TOKEN)" },
      { status: 501 }
    )
  }

  let data: unknown
  try {
    data = await request.json()
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 })
  }
  if (!isValidPayload(data)) {
    return Response.json({ error: "expected { notes: [{id,title,date,body}] }" }, { status: 400 })
  }

  try {
    await kvCommand(["SET", KV_KEY, JSON.stringify({ notes: data.notes })])
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "kv write failed" }, { status: 502 })
  }
}
