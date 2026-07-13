import { describe, it, expect, vi, beforeEach } from "vitest"

// The one non-trivial rule: "" from Vercel means unset (the v1.0 email
// incident was a present-but-empty env var). Copy falls back; socials go
// undefined so the footer hides them.
describe("site-config", () => {
  beforeEach(() => vi.resetModules())

  it("empty-string env var falls back for copy and hides socials", async () => {
    vi.stubEnv("NEXT_PUBLIC_BRAND_NAME", "")
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "  ")
    const { site } = await import("./site-config")
    expect(site.brand.name).toBe("Slow Simmer") // "" → fallback, not blank
    expect(site.social.instagram).toBeUndefined() // whitespace → hidden
  })

  it("set values win", async () => {
    vi.stubEnv("NEXT_PUBLIC_BRAND_NAME", "Fast Boil")
    vi.stubEnv("NEXT_PUBLIC_INSTAGRAM_URL", "https://instagram.com/x")
    const { site } = await import("./site-config")
    expect(site.brand.name).toBe("Fast Boil")
    expect(site.social.instagram).toBe("https://instagram.com/x")
  })
})
