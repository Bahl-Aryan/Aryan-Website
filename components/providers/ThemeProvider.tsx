"use client"

import { useEffect } from "react"
import { getTheme, applyTheme } from "@/lib/theme"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = getTheme()
    applyTheme(theme)
  }, [])

  return <>{children}</>
}
