"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

const NAV_SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Videos" },
  { id: "form", label: "Register" },
] as const

export default function NavBar() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const sectionIds = NAV_SECTIONS.map((s) => s.id)

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
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <a
          href="#hero"
          className="font-heading text-xl font-bold text-foreground"
        >
          Slow Simmer
        </a>

        {/* Desktop nav links */}
        <ul className="hidden sm:flex sm:items-center sm:gap-x-8">
          {NAV_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={cn(
                  "inline-flex items-center px-1 py-2 text-sm font-medium transition-colors min-h-[44px] min-w-[44px]",
                  activeSection === section.id
                    ? "text-accent-foreground font-semibold border-b-2 border-accent"
                    : "text-foreground hover:text-accent-foreground hover:border-b-2 hover:border-accent",
                )}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] text-foreground"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-background/95 backdrop-blur-sm border-t border-border">
          <ul className="flex flex-col px-4 py-2 space-y-1">
            {NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className={cn(
                    "block px-3 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px]",
                    activeSection === section.id
                      ? "text-accent-foreground font-semibold bg-accent/10"
                      : "text-foreground hover:text-accent-foreground hover:bg-accent/5",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}
