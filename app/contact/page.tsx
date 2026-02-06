import { Metadata } from "next"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Mail, Github, Linkedin } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact | Aryan Bahl",
  description: "Get in touch about opportunities, collaborations, or technical discussions.",
}

export default function ContactPage() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-xl mb-8 text-[var(--text)]">Contact</h1>
              <p className="body mb-12 text-[var(--muted)]">
                Always open to discussing opportunities, collaborations, or technical problems worth
                solving.
              </p>
              <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
                <a
                  href="mailto:aryan@example.com"
                  className="flex items-center gap-3 text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                >
                  <Github className="h-5 w-5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[var(--text)] transition-colors hover:text-[var(--accent)]"
                >
                  <Linkedin className="h-5 w-5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  )
}
