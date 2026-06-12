// Tiny bus for delivering incoming "texts" into the Messages app from
// elsewhere in the OS (e.g. tapping Reply on a notification). Messages
// sent while the app is closed are buffered and drained on mount.

type Listener = (text: string) => void

let listener: Listener | null = null
let pending: string[] = []

export function deliverMessage(text: string) {
  if (listener) listener(text)
  else pending.push(text)
}

export function subscribeToMessages(fn: Listener): () => void {
  listener = fn
  const queued = pending
  pending = []
  queued.forEach(fn)
  return () => {
    if (listener === fn) listener = null
  }
}
