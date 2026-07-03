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
    <footer className="bg-card text-card-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:px-6">
        <Reveal>
          <span className="font-heading text-lg font-bold">
            Slow Simmer
          </span>
        </Reveal>

        <Reveal delay={100}>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-card-foreground hover:text-accent-foreground transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-card-foreground hover:text-accent-foreground transition-colors"
              aria-label="YouTube"
            >
              <YoutubeIcon />
            </a>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <Separator />
        </Reveal>

        <Reveal delay={300}>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Slow Simmer. All rights reserved.
          </p>
        </Reveal>
      </div>
    </footer>
  )
}
