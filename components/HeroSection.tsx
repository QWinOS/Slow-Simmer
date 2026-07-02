import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="flex min-h-screen items-center justify-center py-24 sm:py-32 text-center scroll-mt-16"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          An Intimate Dining Experience
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Curated evenings of exceptional food, wine, and conversation.
        </p>
        <div className="mt-10">
          <Button asChild size="lg">
            <a href="#gallery">View Our Gallery</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
