import Link from "next/link";
import { PageTransition } from "@/components/shared/PageTransition";
import { Reveal } from "@/components/shared/Reveal";

export default function NotFound() {
  return (
    <PageTransition>
      <Reveal>
        <section className="section">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="display-xl text-[var(--text)] mb-4">404</h1>
              <p className="display-l text-[var(--muted)] mb-8">
                Page not found
              </p>
              <Link
                href="/"
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors"
              >
                Return home →
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </PageTransition>
  );
}
