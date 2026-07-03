import { Heart } from "lucide-react"
import Reveal from "@/components/Reveal"

export default function FormPlaceholder() {
  return (
    <section
      id="form"
      className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
    >
      {/* Background accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

      <Reveal>
        <div className="mx-auto max-w-lg rounded-xl bg-card p-8 shadow-sm text-center ring-1 ring-border">
          <Heart className="mx-auto text-accent-foreground" size={32} />
          <h2 className="mt-4 font-heading text-2xl font-bold text-card-foreground">
            Join the Club
          </h2>
          <p className="mt-3 text-muted-foreground">
            Registration form coming soon.
          </p>
          <p className="mt-2 text-sm text-muted-foreground/70">
            Reserve your spot at our next featured event.
          </p>
        </div>
      </Reveal>
    </section>
  )
}
