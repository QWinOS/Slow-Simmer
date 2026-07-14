import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { termsClauses, lastUpdated } from "@/lib/terms"

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <div className="rounded-xl bg-card p-6 sm:p-8 shadow-sm ring-1 ring-border">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-8">
            Last updated: {lastUpdated}
          </p>

          {termsClauses.map((clause, index) => (
            <section key={clause.id}>
              <h2 className="font-heading text-base sm:text-lg font-semibold mb-2">
                {clause.title}
              </h2>
              <p className="font-sans text-sm sm:text-base leading-relaxed text-muted-foreground">
                {clause.content}
              </p>
              {index < termsClauses.length - 1 && (
                <hr className="my-6 border-border" />
              )}
            </section>
          ))}

          <div className="mt-10">
            <a
              href="/#form"
              className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
            >
              &larr; Back to Registration
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
