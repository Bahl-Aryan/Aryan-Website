import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aryan Bahl | Engineer & Systems Builder",
  description: "Engineered for growth. Built to scale. Portfolio of cloud infrastructure, systems engineering, and scalable applications.",
  openGraph: {
    title: "Aryan Bahl | Engineer & Systems Builder",
    description: "Engineered for growth. Built to scale.",
    type: "website",
  },
};

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
