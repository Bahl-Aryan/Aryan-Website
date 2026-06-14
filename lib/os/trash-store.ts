// Shared state for files dragged from the desktop into the Trash.
// The Desktop removes the icon and TrashApp lists it; "Put Back"
// restores it; "Empty Trash" deletes it for the session - just like
// the real thing.

import type { AppId } from "@/lib/os/window-manager"

export type DesktopFile = { name: string; appId: AppId; kind: "pdf" | "txt" | "folder" }

let trashed: DesktopFile[] = []
const listeners = new Set<() => void>()
let restoreListener: ((file: DesktopFile) => void) | null = null

function emit() {
  listeners.forEach((fn) => fn())
}

export const trashStore = {
  getTrashed: () => trashed,
  subscribe(fn: () => void): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  trash(file: DesktopFile) {
    trashed = [...trashed, file]
    emit()
  },
  putBack(name: string) {
    const file = trashed.find((f) => f.name === name)
    if (!file) return
    trashed = trashed.filter((f) => f.name !== name)
    emit()
    restoreListener?.(file)
  },
  empty() {
    trashed = []
    emit()
  },
  // The Desktop registers here to get restored files back
  onRestore(fn: (file: DesktopFile) => void): () => void {
    restoreListener = fn
    return () => {
      if (restoreListener === fn) restoreListener = null
    }
  },
}
