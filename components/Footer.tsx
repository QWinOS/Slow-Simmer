import { Separator } from "@/components/ui/separator"
import Reveal from "@/components/Reveal"

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden border-t border-[var(--glass-border)] bg-card text-card-foreground">
      <div
        aria-hidden
        className="blob left-1/2 top-full size-[46vmin] -translate-x-1/2 -translate-y-1/2"
        style={{ background: "var(--glow-gold)" }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 py-16 sm:px-6">
        <Reveal>
          <div className="text-center">
            <span className="font-heading text-2xl font-medium tracking-[0.02em]">
              Slow Simmer
            </span>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              An Unhurried Supper Club
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="glass glass-edge inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-card-foreground transition-colors hover:text-accent-foreground"
              aria-label="Instagram"
            >
              <InstagramIcon size={20} />
            </a>
            <a
              href="#"
              className="glass glass-edge inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-card-foreground transition-colors hover:text-accent-foreground"
              aria-label="YouTube"
            >
              <YoutubeIcon size={20} />
            </a>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <Separator className="max-w-xs opacity-60" />
        </Reveal>

        <Reveal delay={300}>
          <p className="text-xs font-light tracking-wide text-muted-foreground">
            &copy; {currentYear} Slow Simmer. Come join us at the table.
          </p>
        </Reveal>
      </div>
    </footer>
  )
}
