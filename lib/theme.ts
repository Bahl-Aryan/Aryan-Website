"use client"

export type Theme = "violet-night" | "ice-blue"

const THEME_STORAGE_KEY = "portfolio-theme"

export function getTheme(): Theme {
  if (typeof window === "undefined") return "violet-night"

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  return stored || "violet-night"
}

export function setTheme(theme: Theme) {
  if (typeof window === "undefined") return

  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return

  const html = document.documentElement
  if (theme === "violet-night") {
    html.removeAttribute("data-theme")
  } else {
    html.setAttribute("data-theme", theme)
  }
}
