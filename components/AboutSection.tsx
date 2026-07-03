import { Wine, Users, Heart, Sparkles, ArrowRight } from "lucide-react"
import Reveal from "@/components/Reveal"

const highlights = [
  {
    icon: Wine,
    label: "Curated Menus",
    desc: "Seasonal, locally-sourced, expertly paired",
  },
  {
    icon: Users,
    label: "By Invitation",
    desc: "Intimate groups of 10–14 guests per evening",
  },
  {
    icon: Heart,
    label: "Meaningful Time",
    desc: "Slow food, deep conversation, lasting memories",
  },
]

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 scroll-mt-16"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-br from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

      <Reveal>
        <div className="text-center">
          <span className="font-heading text-sm font-medium tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400">
            Our Story
          </span>
          <h2 className="mt-2 font-heading text-3xl font-bold text-foreground sm:text-4xl">
            About the Club
          </h2>
          <div className="mx-auto mt-4 flex items-center gap-3 text-amber-500/60">
            <span className="h-px w-12 bg-amber-500/30" />
            <Sparkles size={16} />
            <span className="h-px w-12 bg-amber-500/30" />
          </div>
        </div>
      </Reveal>

      {/* Mobile: stacked with emphasis on highlights */}
      <div className="mt-10 grid gap-10 md:grid-cols-5 md:gap-12">
        {/* Text column */}
        <div className="space-y-5 text-muted-foreground md:col-span-3">
          <Reveal delay={100}>
            <p className="text-base leading-relaxed sm:text-lg">
              <span className="font-semibold text-foreground">
                Every great meal tells a story.
              </span>{" "}
              Slow Simmer is where strangers become friends over carefully
              crafted menus, thoughtfully paired wines, and conversations that
              linger long after the last course.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <p className="text-sm leading-relaxed sm:text-base">
              Each evening is hosted in an intimate setting — a private dining
              room, a hidden terrace, a candlelit loft — limited to just 10–14
              guests. No large crowds, no rushed service. Just the pleasure of
              good company and exceptional food, shared slowly.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="text-sm leading-relaxed sm:text-base">
              Whether you are a seasoned food enthusiast or simply looking for a
              memorable evening out, every table at Slow Simmer is set for
              discovery, delight, and genuine connection.
            </p>
          </Reveal>
        </div>

        {/* Highlights column */}
        <div className="md:col-span-2 md:pt-2">
          <Reveal delay={200}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900/40 dark:to-amber-800/30 dark:text-amber-300">
                    <item.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-amber-500/0 transition-all group-hover:text-amber-500/60"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
