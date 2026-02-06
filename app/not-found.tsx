import Link from "next/link"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"

export default function NotFound() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="display-xl mb-4 text-[var(--text)]">404</h1>
              <p className="display-l mb-8 text-[var(--muted)]">Page not found</p>
              <Link
                href="/"
                className="text-sm text-[var(--accent)] transition-colors hover:text-[var(--accent-2)]"
              >
                Return home →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  )
}
