import { Separator } from "@/components/ui/separator"

export default function AboutSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 scroll-mt-16"
    >
      <h2 className="font-heading text-2xl font-bold text-center text-foreground sm:text-3xl">
        About the Club
      </h2>
      <div className="mt-8 space-y-6 text-center text-muted-foreground">
        <p>
          Supper Club is an intimate gathering of friends and strangers united
          by a love for exceptional food and meaningful conversation. Each
          evening is carefully curated — from the seasonal menu to the wine
          pairings and the ambiance — to create a night that feels both
          exclusive and warmly welcoming.
        </p>
        <p>
          Our events are hosted in intimate settings, limited to a small number
          of guests to ensure every person at the table has the space to
          connect, share stories, and savour the experience. We believe the
          best meals are the ones shared slowly, with good company and great
          wine.
        </p>
        <p>
          Whether you are a seasoned food enthusiast or simply looking for a
          memorable evening out, Supper Club offers a space where the table is
          set for discovery, delight, and genuine connection.
        </p>
      </div>
      <div className="mt-12">
        <Separator />
      </div>
    </section>
  )
}
