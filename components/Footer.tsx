import { Separator } from "@/components/ui/separator";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site-config";
import Link from "next/link";

function InstagramIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

function WhatsappIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-4-1L3 21l2-5.5a8.38 8.38 0 0 1-1-4 8.5 8.5 0 0 1 17 0z" />
    </svg>
  );
}

// Only handles with a configured URL render — unset = hidden, never href="#".
const SOCIALS = [
  { url: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
  { url: site.social.youtube, label: "YouTube", Icon: YoutubeIcon },
  { url: site.social.whatsapp, label: "WhatsApp", Icon: WhatsappIcon },
].filter((s): s is { url: string; label: string; Icon: typeof InstagramIcon } =>
  Boolean(s.url),
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              {site.brand.name}
            </span>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
              {site.brand.tagline}
            </p>
          </div>
        </Reveal>

        {SOCIALS.length > 0 && (
          <Reveal delay={100}>
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ url, label, Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass glass-edge inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-card-foreground transition-colors hover:text-accent-foreground"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={200}>
          <Separator className="max-w-xs opacity-60" />
        </Reveal>

        <Reveal delay={300}>
          <p className="text-xs font-light tracking-wide text-muted-foreground">
            &copy; {currentYear} {site.brand.name}. Come join us at the table.
          </p>

          <p className="text-xs font-light tracking-wide text-neutral-500 dark:text-neutral-400">
            Designed and developed with 💖 by{" "}
            <Link
              href="https://www.anik3t.dev/"
              className="relative inline-block font-semibold text-neutral-800 dark:text-neutral-100 transition-all duration-300 hover:text-red-500 dark:hover:text-rose-400 group"
            >
              {/* Floating Icon Tooltip with Dark Mode Glass Effect */}
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 scale-50 transition-all duration-300 ease-out pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:-top-7">
                🍳
              </span>
              Aniket Das
            </Link>
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
