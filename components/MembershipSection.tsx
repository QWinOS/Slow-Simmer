import { Heart, Wine, Users, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import Reveal from "@/components/Reveal"

// Why join — warm, open, everyone-welcome reasons to come to the table.
const reasons = [
  {
    icon: Heart,
    label: "A Warm Welcome",
    desc: "Come as you are — solo, paired, or with friends. Every guest belongs from the very first pour.",
  },
  {
    icon: Wine,
    label: "Seasonal Menus",
    desc: "A new, hand-crafted, locally-sourced menu every evening — thoughtfully paired and served with care.",
  },
  {
    icon: Users,
    label: "New Friends",
    desc: "Shared tables and unhurried hours: the easiest way to meet good people over a meal worth remembering.",
  },
]

// How it works — simple, open, no waiting lists.
const steps = [
  { n: "I", t: "Pick a Date", d: "Choose an evening that suits you." },
  { n: "II", t: "Save Your Seat", d: "Reserve in a minute — solo or with guests." },
  { n: "III", t: "Come Hungry", d: "Show up, sit down, settle in. We handle the rest." },
]

export default function MembershipSection() {
  return (
    <section
      id="membership"
      className="relative overflow-hidden scroll-mt-16 py-24 sm:py-32"
    >
      {/* Ambient light */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="blob left-[12%] top-[18%] size-[40vmin]"
          style={{ background: "var(--glow-gold)" }}
        />
        <div
          className="blob bottom-[10%] right-[10%] size-[34vmin]"
          style={{ background: "var(--glow-champagne)", animationDelay: "-9s" }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-5 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent-foreground">
              Join Us
            </span>
            <h2 className="mt-4 font-heading text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
              There&rsquo;s Always Room
              <br />
              <span className="italic text-gold-foil">at Our Table</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
              No waiting lists, no velvet ropes — just good food and better
              company. Pull up a chair and join us for the next evening.
            </p>
          </div>
        </Reveal>

        {/* Why join */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {reasons.map((p, i) => (
            <Reveal key={p.label} delay={120 + i * 90}>
              <div className="glass glass-edge group h-full rounded-3xl p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-gold">
                  <p.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-heading text-lg font-medium text-foreground">
                  {p.label}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* How it works */}
        <Reveal delay={120}>
          <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-[var(--glass-border)] sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="glass flex flex-col gap-1.5 p-7 text-center sm:text-left"
              >
                <span className="font-heading text-2xl italic text-gold">
                  {s.n}
                </span>
                <span className="font-heading text-base font-medium text-foreground">
                  {s.t}
                </span>
                <span className="text-sm font-light leading-relaxed text-muted-foreground">
                  {s.d}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Guest voice + join */}
        <Reveal delay={160}>
          <div className="glass glass-edge relative mx-auto mt-14 max-w-2xl overflow-hidden rounded-3xl p-8 text-center sm:p-12">
            <Quote
              aria-hidden
              size={36}
              strokeWidth={1}
              className="mx-auto text-gold/70"
            />
            <p className="mt-5 font-heading text-xl font-light italic leading-relaxed text-foreground sm:text-2xl">
              &ldquo;The moment you sit down, you&rsquo;re one of us.&rdquo;
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              &mdash; A Regular at the Table
            </p>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="group relative w-full overflow-hidden rounded-full bg-primary px-8 text-primary-foreground shadow-[0_8px_30px_-8px_var(--glow-gold)] transition-transform hover:scale-[1.02] sm:w-auto"
              >
                <a href="#form">
                  Join Us at the Next Supper
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -left-1/2 w-1/2 animate-[glassSheen_5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                </a>
              </Button>
              <p className="mt-4 text-xs font-light tracking-wide text-muted-foreground">
                Seats fill up fast &mdash; grab yours for the next evening.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
