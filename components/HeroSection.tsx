"use client"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-mt-16"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-amber-50 dark:to-amber-950/20" />
        <div className="absolute top-[10%] left-[15%] size-[45vmin] rounded-full bg-gradient-to-br from-amber-200/50 to-amber-300/15 dark:from-amber-500/15 dark:to-transparent blur-3xl animate-[heroPulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[15%] right-[10%] size-[35vmin] rounded-full bg-gradient-to-tr from-amber-100/60 to-amber-200/20 dark:from-amber-600/10 dark:to-transparent blur-3xl animate-[heroPulse_8s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[40%] left-[55%] size-[25vmin] rounded-full bg-gradient-to-r from-amber-100/50 via-amber-200/30 to-transparent dark:from-amber-400/8 dark:via-amber-500/6 dark:to-transparent blur-3xl animate-[heroPulse_8s_ease-in-out_infinite_4s]" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10">
        <p className="text-sm font-medium tracking-[0.3em] uppercase text-amber-600 dark:text-amber-400 animate-[fadeUp_0.8s_ease-out_both]">
          Slow Simmer
        </p>

        <h1 className="mt-6 font-heading text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1] animate-[fadeUp_0.8s_ease-out_0.15s_both]">
          An Intimate
          <br />
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-400 dark:via-amber-300 dark:to-amber-400 bg-clip-text text-transparent">
            Dining Experience
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-[fadeUp_0.8s_ease-out_0.3s_both]">
          Curated evenings of exceptional food, wine, and conversation.
        </p>

        <div className="mt-10 animate-[fadeUp_0.8s_ease-out_0.45s_both]">
          <Button asChild size="lg" className="rounded-full px-8">
            <a href="#gallery">View Our Gallery</a>
          </Button>
        </div>

        {/* Decorative line */}
        <div className="mt-16 mx-auto w-px h-16 bg-gradient-to-b from-amber-500/50 to-transparent animate-[fadeUp_0.8s_ease-out_0.6s_both]" />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-[fadeUp_0.8s_ease-out_0.8s_both]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-[10px] font-medium tracking-widest uppercase">Scroll</span>
          <div className="size-5 border-2 border-muted-foreground/40 rounded-full flex items-start justify-center p-0.5">
            <div className="size-1.5 rounded-full bg-muted-foreground/60 animate-[scrollDot_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>


    </section>
  )
}
