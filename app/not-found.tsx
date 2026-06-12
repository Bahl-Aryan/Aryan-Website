import Link from "next/link"

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(150deg,#3b1d8f_0%,#7a2bd1_35%,#c33aa0_70%,#e8602c_100%)] text-white">
      <p className="font-mono text-sm text-white/70">zsh: page not found: 404</p>
      <h1 className="text-3xl font-semibold tracking-tight">this window doesn&apos;t exist</h1>
      <Link
        href="/"
        className="mt-2 rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/25"
      >
        ← back to the desktop
      </Link>
    </div>
  )
}
