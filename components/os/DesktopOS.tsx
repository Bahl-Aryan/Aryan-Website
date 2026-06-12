"use client"

import { Desktop } from "@/components/os/Desktop"
import { WindowManagerProvider } from "@/lib/os/window-manager"

function DesktopOS() {
  return (
    <WindowManagerProvider>
      <div className="fixed inset-0 z-50 overflow-hidden bg-[#3b1d8f]">
        <Desktop />
      </div>
    </WindowManagerProvider>
  )
}

export { DesktopOS }
