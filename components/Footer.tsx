import { RiInstagramLine, RiYoutubeLine } from "@remixicon/react"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card text-card-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:px-6">
        {/* Brand */}
        <span className="font-heading text-lg font-bold">
          Supper Club
        </span>

        {/* Social links */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-card-foreground hover:text-accent-foreground transition-colors"
            aria-label="Instagram"
          >
            <RiInstagramLine size={22} />
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-card-foreground hover:text-accent-foreground transition-colors"
            aria-label="YouTube"
          >
            <RiYoutubeLine size={22} />
          </a>
        </div>

        <Separator />

        {/* Copyright */}
        <p className="text-sm text-muted-foreground">
          &copy; {currentYear} Supper Club. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
