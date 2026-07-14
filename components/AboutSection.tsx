import { Wine, Users, Clock } from "lucide-react";
import Reveal from "@/components/Reveal";

const highlights = [
  {
    icon: Wine,
    label: "Curated Menus",
    desc: "Seasonal, locally-sourced, and paired by hand — a new composition every evening.",
  },
  {
    icon: Users,
    label: "By Invitation",
    desc: "Intimate tables of ten to fourteen. Introductions made, never crowds gathered.",
  },
  {
    icon: Clock,
    label: "Unhurried Hours",
    desc: "Slow food, deep conversation, and evenings written to be remembered.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative mx-auto max-w-5xl scroll-mt-16 px-5 py-24 sm:px-6 sm:py-32"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="blob left-1/2 top-0 size-[52vmin] max-w-[560px] -translate-x-1/2"
        style={{ background: "var(--glow-champagne)" }}
      />

      <Reveal>
        <div className="text-center">
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent-foreground">
            Our Story
          </span>
          <h2 className="mt-4 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Home is a feeling.{" "}
            <span className="italic text-gold-foil">
              We just happen to serve it.
            </span>
          </h2>
          <div className="mx-auto mt-6 flex items-center justify-center gap-3">
            <span className="h-px w-16 rule-gold" />
            <span className="size-1.5 rotate-45 bg-gold/70" />
            <span className="h-px w-16 rule-gold" />
          </div>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 md:grid-cols-5 md:gap-14">
        {/* Editorial column */}
        <div className="space-y-6 text-muted-foreground md:col-span-3">
          <Reveal delay={100}>
            <p className="font-heading text-xl font-light italic leading-relaxed text-foreground sm:text-2xl">
              “Slow Simmer started with two sisters from the hills of
              Darjeeling.”
            </p>
          </Reveal>
          <Reveal delay={180}>
            <p className="text-base font-light leading-relaxed sm:text-lg">
              We grew up in a family that loved food and hosting people. Our
              home was always filled with the aroma of food ,laughter around the
              table, and the quiet joy of making everyone feel at home.Hosting
              wasn’t something we did occasionally,it was simply part of who we
              were.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="text-sm font-light leading-relaxed sm:text-base">
              As life took us away from home, we found ourselves missing those
              slow evenings, home-cooked meals, and the feeling of belonging
              that came with them. So we decided to create it again.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="text-sm font-light leading-relaxed sm:text-base">
              Our supper club is an invitation to slow down-to enjoy food made
              with care, meet people you may not have known before, and leave
              with memories that last longer than the meal itself.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="text-sm font-light leading-relaxed sm:text-base">
              From our table to yours-welcome to Slow Simmer.
            </p>
          </Reveal>
          <Reveal delay={260}>
            <p className="text-sm font-light leading-relaxed sm:text-base">
              Currently hosting in Kolkata & Bangalore.
            </p>
          </Reveal>
        </div>

        {/* Glass value cards */}
        <div className="self-center md:col-span-2">
          <Reveal delay={200}>
            <div className="grid grid-cols-1 gap-4">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="glass glass-edge group flex items-start gap-4 rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-gold">
                    <item.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading text-base font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
