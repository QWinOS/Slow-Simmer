---
phase: 01-foundation-layout-gallery
plan: 01
subsystem: ui
tags: [next-themes, shadcn, theming, typography, google-drive, youtube, instagram]

# Dependency graph
requires:
  - phase: null
    provides: n/a (first plan in phase)
provides:
  - Warm red/gold CSS theme variables (light + dark mode)
  - Playfair Display SC heading font + Karla body font
  - ThemeProvider wrapping for system-preference dark mode
  - shadcn UI primitives: button, dialog, card, separator, skeleton
  - Google Drive API helper functions with typed interfaces
  - YouTube/Instagram embed URL generation helpers
  - .env.local template for Drive API credentials
affects:
  - 01-02-layout-shell
  - 01-03-gallery
  - 01-04-video

# Tech tracking
tech-stack:
  added:
    - next-themes@0.4.6 (system dark mode)
    - components/ui/button.tsx, dialog.tsx, card.tsx, separator.tsx, skeleton.tsx (shadcn UI primitives)
  patterns:
    - CSS variable theming with TailwindCSS v4 @theme inline mapping
    - next/font/google with CSS variable approach for typography
    - next-themes ThemeProvider wrapping for system dark mode
    - Client-safe Google Drive API fetch with URL + searchParams
    - Privacy-enhanced YouTube embeds via youtube-nocookie.com

key-files:
  created:
    - components/ui/button.tsx
    - components/ui/dialog.tsx
    - components/ui/card.tsx
    - components/ui/separator.tsx
    - components/ui/skeleton.tsx
    - lib/drive.ts
    - lib/video.ts
    - .env.local (gitignored)
  modified:
    - app/globals.css
    - app/layout.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Used CSS variable approach (variable property) for fonts instead of className — allows referencing font-family via --font-heading and --font-sans in CSS"
  - "set brand color #DC2626 as a separate --brand-primary CSS custom property for decorative use only (not for buttons, text, or interactive elements)"
  - "Google Drive fetch uses URL + searchParams pattern (not string concat) for safe URL construction"
  - "YouTube embeds use youtube-nocookie.com for privacy-enhanced mode"
  - "next-themes uses attribute='class' defaultTheme='system' enableSystem for SSR-safe dark mode"

patterns-established:
  - "CSS variable theming: TailwindCSS v4 @theme inline block maps CSS vars to utility classes, variable values overridden in :root and .dark"
  - "Typography: Playfair Display SC for headings (--font-heading), Karla for body (--font-sans), both loaded via next/font/google with variable property"
  - "Font variables applied via className on <html> using cn() utility for class merging"

requirements-completed: [UI-01, UI-03]

coverage:
  - id: D1
    description: "Theme system with warm red/gold color palette in light and dark mode"
    requirement: UI-03
    verification:
      - kind: unit
        ref: "npm run build — CSS compiles without errors"
        status: pass
    human_judgment: true
    rationale: "Color accuracy requires human visual verification against UI-SPEC hex values"
  - id: D2
    description: "Playfair Display SC headings and Karla body fonts loaded and applied globally"
    requirement: UI-03
    verification:
      - kind: unit
        ref: "npm run build — TypeScript compiles, font imports resolve"
        status: pass
    human_judgment: true
    rationale: "Font rendering quality and visual hierarchy require human assessment"
  - id: D3
    description: "Smooth scroll active via CSS scroll-behavior: smooth on html element"
    requirement: UI-01
    verification:
      - kind: other
        ref: "CSS declaration verified in app/globals.css"
        status: pass
    human_judgment: false
  - id: D4
    description: "System-preference dark mode via next-themes ThemeProvider wrapping layout"
    verification:
      - kind: other
        ref: "npm run build — ThemeProvider import and usage resolves without errors"
        status: pass
    human_judgment: true
    rationale: "Dark mode toggle behavior requires manual verification (system preference change, no flash)"
  - id: D5
    description: "shadcn UI primitives installed (button, dialog, card, separator, skeleton)"
    verification:
      - kind: other
        ref: "ls components/ui/ — all 5 files exist"
        status: pass
    human_judgment: false
  - id: D6
    description: "Google Drive API typed utility module (fetchGalleryImages, getDriveImageUrl)"
    verification:
      - kind: unit
        ref: "npm run build — TypeScript compiles without errors"
        status: pass
    human_judgment: false
  - id: D7
    description: "YouTube/Instagram embed URL generation helpers (getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getInstagramEmbedUrl)"
    verification:
      - kind: unit
        ref: "npm run build — TypeScript compiles without errors"
        status: pass
    human_judgment: false
  - id: D8
    description: ".env.local template with NEXT_PUBLIC_GOOGLE_API_KEY and NEXT_PUBLIC_DRIVE_FOLDER_ID placeholders"
    verification:
      - kind: other
        ref: "file exists and contains placeholder values"
        status: pass
    human_judgment: false

duration: 1 min
completed: 2026-07-02
status: complete
---

# Phase 1 Plan 01: Theme System, Fonts, shadcn UI Components, Utility Libraries Summary

**Warm red/gold theme system with Playfair Display SC + Karla typography, next-themes dark mode, shadcn UI primitives, and typed Drive/Video utility helpers**

## Performance

- **Duration:** 1 min
- **Started:** 2026-07-02T16:08:12Z
- **Completed:** 2026-07-02T16:09:51Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Installed next-themes@0.4.6 for system-preference dark mode with SSR-safe hydration
- Added 5 shadcn UI primitives (button, dialog, card, separator, skeleton) via CLI
- Overrode globals.css with warm red/gold palette — light mode (#FEF2F2 bg, #450A0A fg, #A16207 primary) and dark mode (#1A0A0A bg, #FEF2F2 fg, #A16207 primary)
- Added decorative `--brand-primary: #DC2626` CSS custom property
- Added smooth scroll (`scroll-behavior: smooth`) with `prefers-reduced-motion` respect
- Replaced Geist/Public_Sans/Raleway with Playfair Display SC (headings) + Karla (body) fonts via next/font/google
- Wrapped children in ThemeProvider with `attribute="class" defaultTheme="system" enableSystem`
- Created `lib/drive.ts` with typed DriveFile interface, fetchGalleryImages(), getDriveImageUrl()
- Created `lib/video.ts` with youtube-nocookie.com privacy-enhanced embed, thumbnail, and Instagram embed helpers
- Created `.env.local` template with NEXT_PUBLIC_GOOGLE_API_KEY and NEXT_PUBLIC_DRIVE_FOLDER_ID placeholders

## Task Commits

Each task was committed atomically:

1. **Task 1.1: Install next-themes and shadcn UI components** — `eb254bd` (feat)
2. **Task 1.2: Theme system — globals.css override and layout.tsx with fonts + ThemeProvider** — `d206689` (feat)
3. **Task 1.3: Utility modules (drive.ts, video.ts) and .env.local template** — `f7cb2f1` (feat)

**Plan metadata:** pending (will commit after STATE/ROADMAP updates)

## Files Created/Modified

- `components/ui/button.tsx` — shadcn Button primitive (CTA, play buttons)
- `components/ui/dialog.tsx` — shadcn Dialog (gallery lightbox overlay)
- `components/ui/card.tsx` — shadcn Card (gallery items, video thumbnails)
- `components/ui/separator.tsx` — shadcn Separator (section dividers)
- `components/ui/skeleton.tsx` — shadcn Skeleton (loading shimmer placeholders)
- `lib/drive.ts` — DriveFile interface, fetchGalleryImages(), getDriveImageUrl()
- `lib/video.ts` — getYouTubeEmbedUrl(), getYouTubeThumbnailUrl(), getInstagramEmbedUrl()
- `.env.local` — Template with NEXT_PUBLIC_* placeholders (gitignored)
- `app/globals.css` — Overridden with warm red/gold palette + smooth scroll
- `app/layout.tsx` — Replaced fonts, added ThemeProvider, suppressHydrationWarning
- `package.json` — Added next-themes@0.4.6 dependency

## Decisions Made

- Used CSS variable approach (`variable` property) for fonts instead of `className` — allows referencing via `--font-heading` and `--font-sans` in Tailwind/globals.css
- Brand color `#DC2626` set as dedicated `--brand-primary` CSS variable for decorative elements only (per D-06 restriction — not for buttons, text, or interactive elements)
- Google Drive URL construction uses `URL + searchParams` pattern for correctness (not string concatenation)
- YouTube embeds use `youtube-nocookie.com` for privacy-enhanced mode
- next-themes configured with `attribute="class"` to match `.dark` CSS selector in globals.css

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all three tasks completed without issues.

## User Setup Required

**External services require manual configuration.** See `.env.local` for:
- Google Cloud Project setup with Drive API enabled and API key restricted by HTTP referrer
- Google Drive folder shared as "Anyone with the link can view"
- Set `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_DRIVE_FOLDER_ID` in `.env.local`

## Next Phase Readiness

- Ready for Plan 01-02 (Layout shell: NavBar, Hero, About, Form placeholder, Footer)
- shadcn primitives ready for gallery (dialog lightbox, card grid items, skeleton loaders)
- Theme system and fonts applied globally — all subsequent sections inherit styling
- Drive and video utilities available for Plans 01-03 and 01-04

---

*Phase: 01-foundation-layout-gallery*
*Completed: 2026-07-02*

## Self-Check: PASSED
