import { RiHeartLine } from "@remixicon/react"

export default function FormPlaceholder() {
  return (
    <section
      id="form"
      className="bg-background px-4 py-16 sm:py-24 scroll-mt-16"
    >
      <div className="mx-auto max-w-lg rounded-xl bg-card p-8 shadow-sm text-center">
        <RiHeartLine
          size={32}
          className="mx-auto text-accent-foreground"
        />
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
    </section>
  )
}
