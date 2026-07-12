"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

const NAV_SECTIONS = [
  { id: "about", label: "The Club" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Film" },
  { id: "membership", label: "Join Us" },
] as const

export default function NavBar() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const sectionIds = ["hero", ...NAV_SECTIONS.map((s) => s.id), "form"]

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id)
          }
        }
      },
      {
        rootMargin: "-64px 0px -40% 0px",
        threshold: 0,
      },
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        isScrolled
          ? "glass-nav border-b border-[var(--glass-border)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <a
          href="#hero"
          className="font-heading text-lg font-medium tracking-[0.02em] text-foreground"
        >
          Slow&nbsp;Simmer
        </a>

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-x-9 md:flex">
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  "relative inline-flex items-center py-2 text-[0.8rem] font-medium uppercase tracking-[0.14em] transition-colors",
                  "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100",
                  activeSection === section.id
                    ? "text-foreground after:scale-x-100"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop CTA */}
          <a
            href="#form"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[0_6px_20px_-8px_var(--glow-gold)] transition-transform hover:scale-[1.03] md:inline-flex"
          >
            Reserve a Seat
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-foreground md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="glass-nav border-t border-[var(--glass-border)] md:hidden">
          <ul className="flex flex-col gap-1 px-4 py-3">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "block min-h-[44px] rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-[0.12em] transition-colors",
                    activeSection === section.id
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/60",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {section.label}
                </a>
              </li>
            ))}
            <li className="pt-1">
              <a
                href="#form"
                className="block min-h-[44px] rounded-full bg-primary px-3 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reserve a Seat
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
