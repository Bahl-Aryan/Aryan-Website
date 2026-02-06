"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/leadership", label: "Leadership" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function AppNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--faint)] bg-[var(--bg)]/80 backdrop-blur-sm">
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold text-[var(--text)] transition-colors hover:text-[var(--accent)]"
          >
            Aryan Bahl
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
