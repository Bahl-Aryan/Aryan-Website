import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Aryan Bahl",
  description:
    "aryan bahl's portfolio, built as a tiny macOS. engineer who loves ml and infra. building at endeavor.",
  openGraph: {
    title: "Aryan Bahl",
    description: "engineer who loves ml and infra. my portfolio, built as a tiny macOS.",
    type: "website",
  },
}

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  )
}
