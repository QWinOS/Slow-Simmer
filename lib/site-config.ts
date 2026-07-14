/**
 * Single source of truth for site copy + links, driven from .env.
 *
 * All values are NEXT_PUBLIC_ (they render in the browser) and are inlined at
 * build time — changing one in Vercel needs a redeploy, not just a dashboard save.
 * Reference each var as a literal process.env.NEXT_PUBLIC_X (never a computed
 * key) or Next won't inline it and it becomes undefined client-side.
 *
 * No secrets live here — Brevo/Razorpay/Google keys stay read inline in their
 * own server modules. That's why this file is safe to import from client
 * components and needs no server-only fence.
 *
 * Copy falls back to the current shipped text, so an empty .env renders the
 * site identically to today. Social URLs return undefined when unset so the
 * footer can hide the icon instead of linking to "#".
 */

// "" from Vercel is "unset", not a value (the v1.0 email incident was a
// present-but-empty env var). Trim + coalesce empty to undefined.
const opt = (v: string | undefined): string | undefined => {
  const t = v?.trim()
  return t ? t : undefined
}

export const site = {
  url: opt(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://slowsimmer.example",
  brand: {
    name: opt(process.env.NEXT_PUBLIC_BRAND_NAME) ?? "Slow Simmer",
    tagline: opt(process.env.NEXT_PUBLIC_BRAND_TAGLINE) ?? "An Unhurried Supper Club",
  },
  hero: {
    badge: opt(process.env.NEXT_PUBLIC_HERO_BADGE) ?? "Join Us at the Table",
    seats: opt(process.env.NEXT_PUBLIC_SEAT_COUNT) ?? "10–14",
    cities: opt(process.env.NEXT_PUBLIC_EVENT_CITIES) ?? "Kolkata & Bangalore",
  },
  // undefined = hide the icon; never render a link to "#"/"".
  social: {
    instagram: opt(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
    youtube: opt(process.env.NEXT_PUBLIC_YOUTUBE_URL),
    whatsapp: opt(process.env.NEXT_PUBLIC_WHATSAPP_URL),
  },
} as const
