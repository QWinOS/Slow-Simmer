"use client";

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site-config";

const DETAILS = [
  { k: site.hero.seats, v: "Seats an evening" },
  { k: "Seasonal", v: "Tasting menus" },
  { k: "Two Cities", v: site.hero.cities },
];

export default function HeroSection() {
  const container = useRef<HTMLElement>(null)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: "power2.out" } })
    tl.fromTo("[data-animate='badge'],[data-animate='heading']", { opacity: 0, y: 20 }, { opacity: 1, y: 0 })
      .fromTo("[data-animate='desc']", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.35")
      .fromTo("[data-animate='buttons']", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.35")
      .fromTo("[data-animate='details']", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.35")
      .fromTo("[data-animate='scroll']", { opacity: 0 }, { opacity: 1, duration: 1 }, "-=0.2")
  }, { scope: container })

  return (
    <section
      id="hero"
      ref={container}
      className="relative flex min-h-dvh items-center justify-center overflow-hidden scroll-mt-16"
    >
      {/* ── Ambient liquid-glass backdrop ─────────────────────── */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {/* Deep base wash — soft gold pools at top & bottom, deep core kept dark */}
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-15%,color-mix(in_srgb,var(--champagne)_14%,transparent),transparent_60%),radial-gradient(80%_60%_at_50%_120%,color-mix(in_srgb,var(--gold)_10%,transparent),transparent_60%)]" />
        {/* Morphing gold light blobs */}
        <div
          className="blob left-[8%] top-[12%] size-[46vmin]"
          style={{ background: "var(--glow-gold)", animationDelay: "0s" }}
        />
        <div
          className="blob bottom-[8%] right-[6%] size-[38vmin]"
          style={{ background: "var(--glow-champagne)", animationDelay: "-7s" }}
        />
        <div
          className="blob left-[48%] top-[44%] size-[28vmin]"
          style={{ background: "var(--glow-gold)", animationDelay: "-14s" }}
        />
        {/* Fine grain to keep the gradients from banding */}
        <div
          className="absolute inset-0 opacity-[var(--grain-opacity)] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-24 text-center sm:px-6">
        {/* Invitation badge (glass pill) */}
        <div data-animate="badge" className="opacity-0 flex justify-center">
          <span className="glass glass-edge inline-flex items-center gap-2.5 rounded-full px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-foreground/80">
            <span className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_var(--glow-gold)]" />
            {site.hero.badge}
          </span>
        </div>

        <h1 data-animate="heading" className="mt-8 opacity-0 font-heading text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <span className="text-gold-foil">Slow Simmer</span>
          <br />
          <span className="text-black dark:text-white italic">
            The Supper Club
          </span>
        </h1>

        <p data-animate="desc" className="mx-auto mt-7 max-w-xl opacity-0 text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
          A private supper club for those who believe the finest evenings are
          measured not in courses, but in the conversations they leave behind.
        </p>

        <div data-animate="buttons" className="mt-10 opacity-0 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="group relative w-full overflow-hidden rounded-full bg-primary px-8 text-primary-foreground shadow-[0_8px_30px_-8px_var(--glow-gold)] transition-transform hover:scale-[1.02] sm:w-auto sm:min-w-56"
          >
            <a href="#form">
              Reserve a Seat at the Table
              {/* Specular sheen sweeping across the CTA */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[glassSheen_5s_ease-in-out_infinite]"
              />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="glass glass-edge w-full rounded-full px-8 text-foreground hover:bg-[var(--glass-bg-strong)] sm:w-auto sm:min-w-56"
          >
            <a href="#gallery">Explore Past Evenings</a>
          </Button>
        </div>

        {/* Glass detail bar */}
        <div data-animate="details" className="mx-auto mt-14 max-w-2xl opacity-0">
          <dl className="glass glass-edge grid grid-cols-3 divide-x divide-[var(--glass-border)] overflow-hidden rounded-2xl">
            {DETAILS.map((d) => (
              <div key={d.v} className="px-3 py-5 sm:px-6">
                <dt className="font-heading text-xl text-foreground sm:text-2xl">
                  {d.k}
                </dt>
                <dd className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
                  {d.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        aria-hidden
        data-animate="scroll"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
            Scroll
          </span>
          <div className="flex size-5 items-start justify-center rounded-full border border-muted-foreground/40 p-0.5">
            <div className="size-1.5 animate-[scrollDot_2s_ease-in-out_infinite] rounded-full bg-gold" />
          </div>
        </div>
      </div>
    </section>
  );
}
