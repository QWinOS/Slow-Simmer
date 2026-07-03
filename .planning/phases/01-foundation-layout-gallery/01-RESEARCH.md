# Phase 1: Foundation, Layout & Gallery - Research

**Researched:** 2026-07-02
**Domain:** Next.js 16 App Router, TailwindCSS v4, shadcn/ui, Google Drive API, YouTube/Instagram embeds
**Confidence:** HIGH

## Summary

Phase 1 builds the single-page responsive shell for a supper club webapp with a photo gallery (Google Drive API) and video embeds (YouTube/Instagram). The project uses Next.js 16.2.10 App Router, React 19.2.4, TypeScript, TailwindCSS v4, shadcn/ui (radix-nova preset with preset code `b1zdaQanb9`), and remixicon icons. 

The phase requires: (1) a sticky navbar with smooth-scroll navigation, (2) hero section, (3) about section, (4) responsive photo gallery fetching from a public Google Drive folder (API key auth, no OAuth), (5) video section with YouTube/Instagram inline embeds, (6) form placeholder stub, and (7) footer. Dark mode is system-preference-based using `next-themes` with the existing `.dark` class CSS variables. The section order is Hero → About → Gallery → Videos → Form → Footer.

**Primary recommendation:** Build with a Server Component shell (`app/page.tsx`) that composes client interactive islands (NavBar, GalleryGrid, GalleryLightbox, VideoGrid) using `'use client'` boundaries. Replace the zinc-based shadcn theme with warm red/gold custom colors from the UI-SPEC by overriding CSS variables in `globals.css`. Install `next-themes` for system-preference dark mode. Fetch gallery images from Google Drive via client-side fetch to `drive/v3/files` with API key, no OAuth needed for public folders.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Section order is Hero → About → Gallery → Videos → Form
- **D-02:** Navigation via smooth scroll links (tap a nav item, page scrolls to section)
- **D-03:** Single scrollable page, no multi-page routing needed
- **D-04:** Pattern — Hero-Centric + Conversion
- **D-05:** Style — Vibrant & Block-based with full light + dark mode support
- **D-06:** Primary color: #DC2626 (warm red), Secondary: #F87171, Accent: #A16207 (warm gold)
- **D-07:** Background: #FEF2F2 (warm off-white), Foreground: #450A0A (deep burgundy)
- **D-08:** Headings font: Playfair Display SC
- **D-09:** Body font: Karla
- **D-10:** Responsive grid layout — 2 columns mobile, 3-4 desktop
- **D-11:** Tap photo to open lightbox overlay
- **D-12:** Google Drive API with public folder + API key for auth
- **D-13:** Fetch images via Drive API on page load; new images appear automatically
- **D-14:** Thumbnail grid with play overlay buttons
- **D-15:** Click/tap play button to open inline video player
- **D-16:** Support both light and dark modes — respect system preference
- **D-17:** Dark mode: adapt warm color palette for dark backgrounds

### the agent's Discretion
None explicitly listed — all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Single-page layout with smooth scrolling between sections | Implement via `scroll-behavior: smooth` on `<html>`, offset scroll targets by nav height. Use IntersectionObserver for active nav state. |
| UI-02 | Fully responsive — works on mobile and desktop | Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Gallery grid: 2 cols mobile, 3 cols tablet, 4 cols desktop. Nav collapses to hamburger < 640px. |
| UI-03 | Clean, elegant design fitting a supper club brand | Use Playfair Display SC (headings) + Karla (body) from `next/font/google`. Warm color palette (#DC2626/#F87171/#A16207) via CSS variable overrides. |
| GALL-01 | Photo gallery displays past event images from Google Drive via Drive API | Use `GET https://www.googleapis.com/drive/v3/files?q='{FOLDER_ID}'+in+parents&key={API_KEY}` to list files. Filter by `mimeType contains 'image/'`. Display via `webContentLink` or `https://drive.google.com/uc?export=view&id={FILE_ID}`. |
| GALL-02 | Video section embeds YouTube videos and Instagram reels | YouTube: `https://www.youtube-nocookie.com/embed/{VIDEO_ID}` (privacy-enhanced). Instagram: `https://www.instagram.com/p/{POST_ID}/embed` or oEmbed API. |
| GALL-03 | Gallery is mobile-responsive (swipeable / grid adapts) | 2 cols mobile (<640px), 3 cols tablet (640-1023px), 4 cols desktop (≥1024px). Lightbox supports swipe via touch events. |
| GALL-04 | New images added to the Drive folder appear automatically (no code change) | Fetch dynamically on page load from the Drive API — no hardcoded image URLs. Folder ID and API key are configuration values. |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- **Next.js 16 breaking changes:** This version has breaking changes — APIs, conventions, and file structure may all differ from training data. Read `node_modules/next/dist/docs/` before writing code. [VERIFIED: project AGENTS.md]
- **Middleware renamed to `proxy`** in Next.js v16. [CITED: next-best-practices skill file-conventions.md]
- **`params` and `searchParams` are async** in Next.js 15+. [CITED: next-best-practices skill async-patterns.md]
- **Heed deprecation notices.** All code must follow the patterns documented in the shipped docs, not training data.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page rendering | Server | — | `app/page.tsx` is a Server Component by default — renders HTML shell |
| Navigation | Client | — | NavBar needs scroll state, IntersectionObserver — browser APIs |
| Smooth scroll | Browser | — | `scroll-behavior: smooth` is native CSS, no JS needed |
| Active nav state | Client | — | IntersectionObserver tracks which section is in view |
| Hero section | Server | — | Pure presentational, no interactivity needed |
| About section | Server | — | Pure presentational, no interactivity needed |
| Gallery data fetching | Client | — | Drive API fetch needs browser fetch + state management |
| Gallery grid display | Client | — | Needs loading/error/empty states, image lazy loading |
| Lightbox overlay | Client | — | shadcn Dialog, keyboard/swipe navigation, state management |
| Video embed display | Client | — | Click-to-play replaces thumbnail with iframe — state management |
| Form placeholder | Server | — | Static stub content, no interaction in Phase 1 |
| Footer | Server | — | Static content with links |
| Dark mode theming | Client (provider) | CSS | `next-themes` provider wraps layout, CSS variables handle colors |
| Font loading | Server | — | `next/font/google` in layout.tsx — self-hosted, no client JS |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.10 | App Router framework | Project bootstrapped with create-next-app [VERIFIED: package.json] |
| React | 19.2.4 | UI rendering | Bundled with Next.js [VERIFIED: package.json] |
| TypeScript | ^5 | Type safety | Project configured with strict mode [VERIFIED: tsconfig.json] |
| TailwindCSS | ^4 | Utility CSS | Already configured with @tailwindcss/postcss [VERIFIED: postcss.config.mjs] |
| shadcn/ui | ^4.12.0 | Component library | Preset `b1zdaQanb9` (radix-nova) [VERIFIED: components.json + shadcn info] |
| @remixicon/react | ^4.9.0 | Icon library | Configured in components.json [VERIFIED: package.json] |

### Key Packages to Install
| Package | Version | Purpose | Why |
|---------|---------|---------|-----|
| next-themes | 0.4.6 | System-preference dark mode | Standard for shadcn/ui dark mode with `.dark` class [ASSUMED] |

### No Additional Packages Required
The following are already available in the project or can be implemented without external dependencies:
- Google Drive API client → raw `fetch()` calls (no SDK needed)
- YouTube/Instagram embeds → native iframes
- Lightbox → shadcn `Dialog` component
- Smooth scroll → native CSS `scroll-behavior: smooth`
- IntersectionObserver → native browser API

### shadcn Components to Install
| Component | Install Command | Purpose |
|-----------|-----------------|---------|
| button | `npx shadcn@latest add button` | CTA buttons, play buttons |
| dialog | `npx shadcn@latest add dialog` | Gallery lightbox overlay |
| card | `npx shadcn@latest add card` | Gallery items, video thumbnails |
| separator | `npx shadcn@latest add separator` | Section dividers |
| skeleton | `npx shadcn@latest add skeleton` | Loading placeholders |
| carousel | `npx shadcn@latest add carousel` | (Optional) for future gallery carousel |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fetch()` to Drive API | `googleapis` npm package | Heavier bundle, OAuth complexity. Raw fetch is simpler for public folder + API key. |
| `next-themes` | CSS-only `@media (prefers-color-scheme)` | No JS toggle possible in future. `next-themes` is shadcn-standard [ASSUMED]. |
| shadcn Dialog | `react-photoswipe-gallery` | External dependency conflicts with shadcn theming. Dialog is sufficient for ~10 photos. |

**Installation:**
```bash
npm install next-themes
npx shadcn@latest add button dialog card separator skeleton
```

**Version verification:**
```bash
npm view next-themes version  # → 0.4.6
```

## Package Legitimacy Audit

> **Required** whenever this phase installs external packages.

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| next-themes | npm | ~2 yrs | 500K+/wk | github.com/pacocoursey/next-themes | [OK] | Approved |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    app/layout.tsx (Server)               │
│  ┌─────────────────────────────────────────────────┐    │
│  │          ThemeProvider (next-themes)              │    │
│  │  ┌──────────────────────────────────────────┐    │    │
│  │  │            app/page.tsx (Server)          │    │    │
│  │  │                                           │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │     NavBar (Client)                │   │    │    │
│  │  │  │  - IntersectionObserver            │   │    │    │
│  │  │  │  - Scroll state                    │   │    │    │
│  │  │  │  - Hamburger menu (mobile)         │   │    │    │
│  │  │  └──────────┬─────────────────────────┘   │    │    │
│  │  │             │ smooth-scroll links          │    │    │
│  │  │  ┌──────────▼─────────────────────────┐   │    │    │
│  │  │  │     HeroSection (Server)           │   │    │    │
│  │  │  │  - Heading, subtitle, CTA          │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │     AboutSection (Server)           │   │    │    │
│  │  │  │  - Description text                │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │  GallerySection (Client boundary)  │   │    │    │
│  │  │  │  ┌─ GalleryGrid ───────────────┐   │   │    │    │
│  │  │  │  │  - Loading/Empty/Error      │   │   │    │    │
│  │  │  │  │  - Drive API fetch          │   │   │    │    │
│  │  │  │  │  - Responsive grid          │   │   │    │    │
│  │  │  │  └─────────────────────────────┘   │   │    │    │
│  │  │  │  ┌─ GalleryLightbox ──────────┐   │   │    │    │
│  │  │  │  │  - Dialog overlay          │   │   │    │    │
│  │  │  │  │  - Prev/Next navigation    │   │   │    │    │
│  │  │  │  │  - Keyboard/swipe          │   │   │    │    │
│  │  │  │  └─────────────────────────────┘   │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │  VideoSection (Client boundary)    │   │    │    │
│  │  │  │  ┌─ VideoGrid ──────────────────┐  │   │    │    │
│  │  │  │  │  - Thumbnail + play overlay   │  │   │    │    │
│  │  │  │  │  - Click → inline embed       │  │   │    │    │
│  │  │  │  │  - YouTube/Instagram          │  │   │    │    │
│  │  │  │  └───────────────────────────────┘  │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │  FormPlaceholder (Server)           │   │    │    │
│  │  │  │  - "Coming soon" stub              │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  │  ┌────────────────────────────────────┐   │    │    │
│  │  │  │     Footer (Server)                │   │    │    │
│  │  │  │  - Copyright, social links         │   │    │    │
│  │  │  └────────────────────────────────────┘   │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘

Data Flow (Gallery):
  Page Load → GalleryGrid mount → fetch() to Drive API →
  Parse JSON response (files[]) → Filter images → 
  Render grid → Tap image → GalleryLightbox mounts →
  Arrow keys / swipe → navigate images → Escape closes

Data Flow (Videos):
  Page Load → VideoGrid mount → Render thumbnails →
  Click play button → Replace thumbnail with iframe →
  YouTube-nocookie.com / Instagram embed
```

### Recommended Project Structure
```
app/
├── globals.css              # Tailwind + theme CSS variables
├── layout.tsx               # Root layout (fonts, ThemeProvider, metadata)
└── page.tsx                 # Single page composing all sections

components/
├── ui/                      # shadcn components (button, dialog, card, etc.)
├── NavBar.tsx               # Sticky nav with smooth-scroll links
├── HeroSection.tsx          # Full-width hero with CTA
├── AboutSection.tsx         # Club description
├── GallerySection.tsx       # Gallery wrapper (Client boundary)
├── GalleryGrid.tsx          # Image grid with Drive API fetch
├── GalleryLightbox.tsx      # Dialog-based lightbox overlay
├── VideoSection.tsx         # Video wrapper (Client boundary)
├── VideoGrid.tsx            # Video thumbnail grid
├── VideoThumbnail.tsx       # Single video card with play overlay
├── FormPlaceholder.tsx      # "Coming soon" stub
└── Footer.tsx               # Copyright + social links

lib/
└── utils.ts                 # cn() utility (exists)

hooks/
└── (optional) useIntersectionObserver.ts  # Nav active state tracking
```

### Pattern 1: Client Component Islands in Server Shell
**What:** The page is a Server Component that imports interactive Client Components. Each interactive section (Gallery, Videos, NavBar) is a separate `'use client'` boundary, keeping the bundle small and the rest server-rendered.
**When to use:** Always — this is the idiomatic Next.js App Router pattern. Only add `'use client'` to files that need state/effects/event handlers.

**Example:**
```tsx
// app/page.tsx — Server Component (default)
import NavBar from '@/components/NavBar'
import HeroSection from '@/components/HeroSection'
import AboutSection from '@/components/AboutSection'
import GallerySection from '@/components/GallerySection'
import VideoSection from '@/components/VideoSection'
import FormPlaceholder from '@/components/FormPlaceholder'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <FormPlaceholder />
      </main>
      <Footer />
    </>
  )
}
```

```tsx
// components/GallerySection.tsx — Client Component
'use client'

import { GalleryGrid } from './GalleryGrid'
import { GalleryLightbox } from './GalleryLightbox'
// ...state management, Drive API fetch, lightbox open/close
```

### Pattern 2: Google Drive Public Image Fetch (Client-side)
**What:** A client-side fetch to the Drive v3 API with an API key to list files from a public folder. The response includes file IDs, names, and mime types. Images are displayed using Google's direct view URL.

**API endpoint:** `GET https://www.googleapis.com/drive/v3/files?q='{FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key={API_KEY}&fields=files(id,name,mimeType,webContentLink)`

**Image display URL:** `https://drive.google.com/uc?export=view&id={FILE_ID}` (works with public files, no auth) or use `webContentLink` from API response.

**Example:**
```typescript
const FOLDER_ID = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID!
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!

async function fetchGalleryImages(): Promise<DriveFile[]> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
    `q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'` +
    `&key=${API_KEY}&fields=files(id,name,mimeType,webContentLink)`
  )
  if (!res.ok) throw new Error('Drive API failed')
  const data = await res.json()
  return data.files || []
}
```

### Anti-Patterns to Avoid
- **Adding `'use client'` to the entire page:** Only the interactive sections need client-side JS. Hero, About, FormPlaceholder, and Footer should be Server Components.
- **Using Google Drive SDK in the browser:** The full `googleapis` SDK is heavy and designed for Node.js/OAuth. Raw `fetch()` is simpler for public folders with API key.
- **Hardcoding image URLs:** The whole point of GALL-04 is auto-discovery. Fetch from Drive API dynamically.
- **Loading all images at full resolution:** Use `thumbnailLink` for thumbs, full `webContentLink` only in lightbox. But note: `thumbnailLink` is short-lived (hours). Use Drive's thumbnail URL pattern or construct a lower-res version.
- **Blocking the main thread with Drive API calls:** The gallery section should show skeleton loaders immediately and fetch in the background.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dark mode theme switching | Custom React context with localStorage | `next-themes` | Handles SSR hydration, system preference detection, flash prevention, and `.dark` class management. Battle-tested + shadcn recommended. [ASSUMED] |
| Dialog/Modal overlay | Custom portal + focus trap + keyboard handling | shadcn `Dialog` | Built on Radix UI — handles focus trapping, Escape key, ARIA attributes, portal rendering, and backdrop click. |
| CSS reset and variables | Manual OKLCH color management | shadcn TailwindCSS v4 `@theme inline` | shadcn preset already provides the color variable framework. Just override the values. |
| Smooth scroll | JavaScript scrollIntoView | CSS `scroll-behavior: smooth` + `scroll-margin-top` | Native, zero JS, hardware-accelerated, respects `prefers-reduced-motion`. |
| Font loading and optimization | Self-hosting + preload management | `next/font/google` | Built-in self-hosting, zero layout shift, automatic subset preloading. |

**Key insight:** The project's existing shadcn preset with TailwindCSS v4 already provides 90% of the styling infrastructure. Phase 1 is primarily about overriding CSS variables, composing components, and connecting external APIs — not reinventing UI primitives.

## Common Pitfalls

### Pitfall 1: Google Drive API key exposed in client bundle
**What goes wrong:** API keys in client-side code are visible to anyone. Though Google restricts API keys by referrer/site, they're still exposed.
**Why it happens:** The Drive API call needs to happen from the client to get dynamic file listings.
**How to avoid:** (1) Create a restricted API key in Google Cloud Console — restrict by HTTP referrer (your domain). (2) Prefix with `NEXT_PUBLIC_` so Next.js includes it in client bundle. (3) The API key alone only grants access to public data — the folder must be "Anyone with the link can view" for this to work.
**Warning signs:** 403 errors from Drive API, files not appearing.

### Pitfall 2: Instagram embeds break after October 2025 changes
**What goes wrong:** Instagram's oEmbed API removed `thumbnail_url`, `thumbnail_width`, `thumbnail_height`, and `author_name` fields as of October/November 2025.
**Why it happens:** Meta updated their oEmbed API — the `thumbnail_url` field is no longer returned.
**How to avoid:** For Instagram embeds, (1) use Instagram's native embed iframe URL (`https://www.instagram.com/p/{POST_ID}/embed`) directly, or (2) generate your own thumbnail from Instagram's Open Graph metadata, or (3) use a placeholder thumbnail with the Instagram logo overlay. The embed html itself (the iframe) still works.
**Warning signs:** Missing thumbnail images for Instagram entries.

### Pitfall 3: `thumbnailLink` from Drive API is short-lived
**What goes wrong:** Drive API's `thumbnailLink` field has a short lifespan (hours) and may show broken images after some time.
**Why it happens:** Google generates thumbnails on-the-fly with temporary URLs. [CITED: developers.google.com/workspace/drive/api/reference/rest/v3/files]
**How to avoid:** Use `webContentLink` for full image display, or construct the direct view URL `https://drive.google.com/uc?export=view&id={FILE_ID}`. For thumbnails in the grid, use Google's thumbnail pattern: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w400-h400` (note: this only works for files shared with "Anyone with the link").
**Warning signs:** Gallery images load initially but fail after a few hours.

### Pitfall 4: Dark mode flash on page load
**What goes wrong:** The page loads in light mode, then JavaScript flips to dark mode, causing a white flash.
**Why it happens:** SSR renders with light mode variables; client JS hasn't run yet.
**How to avoid:** `next-themes` handles this with `enableSystem={true}` and an inline script that sets the `class` before first paint. The `<ThemeProvider>` should wrap the `<html>` tag. Ensure `attribute="class"` matches the CSS selector used in `globals.css` (`.dark`).
**Warning signs:** Brief white flash on load when system is in dark mode.

### Pitfall 5: `'use client'` leaks into Server Component tree
**What goes wrong:** Adding `'use client'` to a parent component makes all its children client-side, increasing JS bundle.
**Why it happens:** Once a file has `'use client'`, everything it imports is included in the client bundle.
**How to avoid:** Keep `'use client'` on leaf interactive components only. Pass Server Components as `children` to Client Components when you need server-rendered content inside a client wrapper. Never mark a section wrapper as `'use client'` if only one child needs interactivity.
**Warning signs:** Large JS bundles, slow page loads, hydration errors.

## Code Examples

### Google Drive Image Fetch (Client Component)
```typescript
// lib/drive.ts
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  webContentLink?: string
}

export async function fetchGalleryImages(): Promise<DriveFile[]> {
  const folderId = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

  if (!folderId || !apiKey) {
    console.warn('Drive API credentials not configured')
    return []
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files')
  url.searchParams.set('q', `'${folderId}' in parents and mimeType contains 'image/'`)
  url.searchParams.set('key', apiKey)
  url.searchParams.set('fields', 'files(id,name,mimeType,webContentLink)')
  url.searchParams.set('pageSize', '50')

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status}`)
  }

  const data = await response.json()
  return data.files || []
}

export function getDriveImageUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}
```

### YouTube Privacy-Enhanced Embed
```typescript
// lib/video.ts
export function getYouTubeEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  })
  if (autoplay) params.set('autoplay', '1')
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}
```

### Instagram Embed URL
```typescript
export function getInstagramEmbedUrl(postId: string): string {
  return `https://www.instagram.com/p/${postId}/embed`
}
```

### Font Setup (app/layout.tsx)
```typescript
import { Playfair_Display_SC, Karla } from 'next/font/google'

const playfairDisplay = Playfair_Display_SC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-heading',
})

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${karla.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Theme Provider Wrapper (app/layout.tsx)
```typescript
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 config (`tailwind.config.js`) | CSS-first config with `@theme inline` | TailwindCSS v4 (2024) | Theme colors defined in CSS variables, accessed via `@theme inline` in `globals.css` |
| `tailwindcss-animate` plugin | `tw-animate-css` package | March 2025 | New import pattern: `@import "tw-animate-css"` instead of `@plugin 'tailwindcss-animate'` |
| shadcn `style: "new-york"` | shadcn `style: "radix-nova"` | Late 2024/2025 | Different component styling, different preset system |
| Instagram oEmbed with `thumbnail_url` | No `thumbnail_url` in response | October 2025 | Must generate own thumbnails or use direct embed iframe |
| Google Drive `thumbnailLink` field | Still exists but short-lived | Always (documented) | Use `webContentLink` or direct URL pattern instead |

**Deprecated/outdated:**
- **tailwindcss-animate:** No longer used. Replaced by `tw-animate-css`. Already migrated in this project (`@import "tw-animate-css"` in globals.css).
- **tailwind.config.js:** Not used in TailwindCSS v4. Theme is configured via `@theme inline` in CSS.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `next-themes` 0.4.6 is compatible with Next.js 16 and React 19.2.4 | Standard Stack | Could cause SSR/hydration issues if not updated. If broken, use CSS `@media (prefers-color-scheme: dark)` as fallback — the `.dark` class approach still works, just without JS toggle. |
| A2 | Instagram's direct embed URL `https://www.instagram.com/p/{POST_ID}/embed` still works after the October 2025 oEmbed changes | Code Examples | If broken, must implement Instagram's oEmbed API with an access token. This adds complexity (requires Facebook developer app). The native embed code from Instagram's share dialog is the fallback. |
| A3 | `https://drive.google.com/uc?export=view&id={FILE_ID}` works for public files without authentication | Code Examples | If Google changes this endpoint, need to use `webContentLink` from API response instead. Both approaches require the folder to be public. |

## Open Questions

1. **Google Drive folder ID and API key setup**
   - What we know: The folder must be public ("Anyone with the link can view"), API key restricted by HTTP referrer.
   - What's unclear: The actual FOLDER_ID and API_KEY values haven't been provided yet. These are `NEXT_PUBLIC_` env vars needed at build/runtime.
   - Recommendation: Add a `.env.local` with placeholder values and document what the user needs to provide. Add a GitHub wiki or setup doc step.

2. **Instagram embed approach**
   - What we know: Direct iframe embed URL and oEmbed API are both options. oEmbed requires Facebook app + access token.
   - What's unclear: Will Instagram posts be reels, photos, or both? Do they need the rich embed with interactions or just the video player?
   - Recommendation: Start with the direct embed URL (`/embed`) — simplest approach. If richer integration is needed later, implement oEmbed with access token.

3. **Image count expectation**
   - What we know: The Drive API returns up to 1000 files per request. We set `pageSize: 50`.
   - What's unclear: How many images are expected? Is pagination needed?
   - Recommendation: Implement a `nextPageToken` check and load more on scroll if needed, but cap at a reasonable number initially.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | (system) | — |
| npm | Package management | ✓ | (system) | — |
| Google Drive API | Gallery | Depends on cloud project setup | — | Local placeholder images during dev |
| YouTube embed | Videos | Always (external service) | — | — |
| Instagram embed | Videos | Always (external service) | — | — |

**Missing dependencies with no fallback:**
- Google Cloud project with Drive API enabled + API key — the gallery cannot function without this. The user must set up a Google Cloud project, enable the Drive API, create an API key restricted by referrer, share the Drive folder as public, and set `NEXT_PUBLIC_DRIVE_FOLDER_ID` and `NEXT_PUBLIC_GOOGLE_API_KEY` in `.env.local`.

**Missing dependencies with fallback:**
- None — all other dependencies (YouTube/Instagram embeds) are external services that work without project setup.

## Validation Architecture

> nyquist_validation enabled — this section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Not yet configured (Phase 1 is first phase) |
| Config file | none |
| Quick run command | `npm run dev` (manual visual testing for Phase 1) |
| Full suite command | `npm run build` (type-check + build verification) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-01 | Single page layout, smooth scroll | Manual | — | ❌ Wave 0 |
| UI-02 | Responsive layout | Manual (resize browser) | — | ❌ Wave 0 |
| UI-03 | Brand-appropriate design | Manual visual review | — | ❌ Wave 0 |
| GALL-01 | Drive API fetches and displays images | Integration | — | ❌ Wave 0 |
| GALL-02 | YouTube/Instagram embeds play | Manual | — | ❌ Wave 0 |
| GALL-03 | Mobile-responsive gallery | Manual (resize) | — | ❌ Wave 0 |
| GALL-04 | New images appear without code change | Verify via Drive query | — | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (type-check only, no tests yet)
- **Per wave merge:** `npm run build`
- **Phase gate:** Build passes + manual visual verification of all sections, breakpoints, and API calls

### Wave 0 Gaps
- [ ] No test infrastructure configured — phase gates rely on build success + manual verification
- [ ] Future phases should add Vitest/Testing Library once form/payment logic exists

### Responsiveness Verification Checklist (Manual)
- [ ] Mobile (< 640px): 2-column gallery, single-column videos, hamburger nav
- [ ] Tablet (640-1023px): 3-column gallery, 2-column videos, expanded nav
- [ ] Desktop (≥ 1024px): 4-column gallery, 2-column videos, expanded nav with active link highlight
- [ ] Lightbox opens/closes correctly on all breakpoints
- [ ] Smooth scroll works on all breakpoints

## Security Domain

> `security_enforcement` enabled — this section is included.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in Phase 1 |
| V3 Session Management | no | No sessions in Phase 1 |
| V4 Access Control | no | No access control in Phase 1 |
| V5 Input Validation | no | No user input in Phase 1 |
| V6 Cryptography | no | No crypto in Phase 1 |
| V14 Config | yes | API key exposure |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposed in client bundle | Information disclosure | Restrict API key by HTTP referrer in Google Cloud Console. The API key only grants access to public data (folder must be shared "Anyone with the link"). No write operations are possible with just an API key on a public folder. |
| Drive API key theft via referrer spoofing | Tampering | HTTP referrer restriction in Google Cloud Console prevents unauthorized domains from using the key. Note: referrer spoofing is possible but uncommon for casual abuse. |
| Instagram/YouTube embed tracking | Privacy | Use `youtube-nocookie.com` for YouTube. Instagram embed does not have a nocookie equivalent — inform users that Instagram sets cookies even in embed mode. |

### Security-Specific Notes
- **API key safety:** Use `NEXT_PUBLIC_GOOGLE_API_KEY` (Next.js exposes `NEXT_PUBLIC_` env vars to the client). This is acceptable because the API key is restricted by referrer and only grants access to public data. The Drive folder must be shared with "Anyone with the link can view" — the API key does not bypass this.
- **No OAuth tokens** are stored or handled in Phase 1.
- **No user data** is collected in Phase 1 — no PII concerns yet.
- **CSP considerations:** YouTube embeds require `frame-src` and `img-src` permissions if you use Content-Security-Policy headers. Default Next.js does not set CSP — adding one is optional for this phase.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md] — Server/Client Component boundaries in Next.js 16
- [VERIFIED: node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md] — Font optimization with next/font/google
- [VERIFIED: project files (globals.css, layout.tsx, page.tsx, package.json, components.json)] — Existing project state
- [VERIFIED: shadcn info output] — Project's shadcn configuration (preset b1zdaQanb9, radix base, remixicon)
- [CITED: developers.google.com/workspace/drive/api/reference/rest/v3/files/list] — Drive API v3 files.list method
- [CITED: developers.google.com/workspace/drive/api/guides/manage-downloads] — Drive file download with webContentLink
- [CITED: developers.facebook.com/docs/instagram-platform/oembed/] — Instagram oEmbed API documentation
- [CITED: shadcn skill customization.md] — shadcn theming with CSS variables
- [CITED: shadcn skill rules/styling.md] — Tailwind v4 + shadcn styling rules

### Secondary (MEDIUM confidence)
- [CITED: stackoverflow.com/questions/52797225] — Drive API with API key for public folders
- [CITED: fleker.medium.com/using-the-google-drive-api-for-public-folders] — Confirmed Drive API public folder + API key works
- [CITED: infotrust.com/articles/youtube-privacy-enhanced-mode] — YouTube-nocookie.com privacy mode

### Tertiary (LOW confidence)
- [ASSUMED: next-themes compatibility] — next-themes 0.4.6 works with Next.js 16 + React 19.2.4
- [ASSUMED: Instagram direct embed URL still functional] — `/p/{POST_ID}/embed` iframe approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json or npm registry
- Architecture: HIGH — Server/Client Component pattern verified in Next.js docs
- Drive API: HIGH — multiple authoritative sources confirm public folder + API key approach
- YouTube/Instagram embeds: MEDIUM — Instagram embed details subject to Meta API changes
- Dark mode: MEDIUM — next-themes is standard but version compatibility unverified

**Research date:** 2026-07-02
**Valid until:** 2026-08-02 (30 days — moderate change risk for Meta APIs)

## Glossary

| Term | Definition |
|------|------------|
| RSC | React Server Component — renders on server, no client JS |
| shadcn/ui | Component collection added as source code via CLI (not a traditional npm package) |
| radix-nova | shadcn preset — Radix UI primitives with nova styling |
| OKLCH | Color format used by shadcn themes — perceptually uniform color space |
| Drive v3 | Current version of Google Drive API (v2 deprecated, v3 current) |
| oEmbed | Open protocol for embedding external content via URL |
| next-themes | React library for theme management with next.js (system preference / toggle) |
| webContentLink | Drive API field — URL to download file content in browser |
