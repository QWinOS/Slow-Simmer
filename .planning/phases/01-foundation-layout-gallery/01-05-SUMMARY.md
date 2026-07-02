---
phase: 01-foundation-layout-gallery
plan: 05
subsystem: ui
tags: typography, palette, theme, shadcn, tailwind, css
requires: []
provides:
  - Brand typography wired: Playfair Display SC headings, Karla body text
  - Warm red/gold palette applied to all functional shadcn theme tokens
affects: [phase 2 (registration form), phase 3 (payment integration)]
tech-stack:
  added: []
  patterns:
    - next/font/google `variable` binding for named font families
    - @theme inline font-heading var() resolution
key-files:
  created: []
  modified:
    - app/layout.tsx
    - app/globals.css
key-decisions:
  - "Replaced Inter body font with Karla (weights 400, 700) bound to --font-sans"
  - "Linked @theme inline --font-heading to var(--font-heading) instead of var(--font-sans)"
  - "Replaced all functional shadcn token values in :root/.dark from OKLCH to warm hex"
  - "Preserved out-of-scope tokens: --destructive, --chart-*, --sidebar-*, --radius, --brand-primary"
requirements-completed:
  - UI-03
coverage:
  - id: D1
    description: "Brand typography — Playfair Display SC headings + Karla body text applied globally"
    requirement: UI-03
    verification:
      - kind: other
        ref: "grep .next/static/chunks/*.css → .font-heading{font-family:var(--font-heading)} and --font-sans:'Karla'"
        status: pass
    human_judgment: false
  - id: D2
    description: "Warm red/gold color palette (#DC2626/#F87171/#A16207) renders in compiled CSS"
    requirement: UI-03
    verification:
      - kind: other
        ref: "grep compiled CSS → #FEF2F2 :root --background, #1A0A0A .dark --background, #A16207 primary tokens"
        status: pass
    human_judgment: false
duration: 6min
completed: 2026-07-02
status: complete
---

# Phase 1 Plan 5: Theme Gap Closure Summary

**Closed two blocking UI-03 gaps: brand typography (Playfair headings + Karla body) and warm red/gold shadcn palette applied globally**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-02T21:19:00Z
- **Completed:** 2026-07-02T21:25:03Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- **Gap 1 — Brand typography wired:** Removed Inter entirely; instantiated Karla with weights 400/700 bound to `--font-sans`; changed `@theme inline --font-heading` from `var(--font-sans)` to `var(--font-heading)`. Headings now resolve to Playfair Display SC and body to Karla. No Inter reference remains in source or compiled CSS.
- **Gap 2 — Warm palette applied:** Replaced all functional shadcn tokens (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--border`, `--input`, `--ring`, `--accent`, `--popover`, their `*-foreground` variants) in both `:root` (light) and `.dark` blocks with the UI-SPEC warm hex palette. Out-of-scope tokens (`--destructive`, `--chart-*`, `--sidebar-*`, `--radius`, `--brand-primary`) untouched.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire brand typography** — `f266b0a` (feat)
2. **Task 2: Apply warm palette** — `871e6ef` (feat)

**Plan metadata:** (committed below)

## Files Created/Modified

- `app/layout.tsx` — Removed Inter import/instantiation; added Karla with `--font-sans` binding; replaced `inter.variable` with `karla.variable` on `<html>` element
- `app/globals.css` — Changed `@theme inline --font-heading` from `var(--font-sans)` to `var(--font-heading)`; replaced all `:root` and `.dark` shadcn token values from zinc OKLCH to UI-SPEC warm hex palette

## Decisions Made

- Replaced Inter with Karla (matches UI-SPEC body font requirement, 2-weight set 400/700)
- Karla bound to CSS variable `--font-sans` matching the existing Tailwind utility mapping
- Used straight hex values for all color tokens except where opacity was needed (muted-foreground, accent), using `rgba()` for explicit alpha control
- `--accent` uses low-opacity gold (15% light, 20% dark) as a subtle tint — matches UI-SPEC spec for accent use on CTA buttons and dividers only

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Both blocking UI-03 gaps are closed. The phase goal is fully achieved.
- Ready for Phase 2 (registration form) or subsequent phases.
- All 15 must-haves from 01-VERIFICATION.md are now satisfied.

---

*Phase: 01-foundation-layout-gallery*
*Completed: 2026-07-02*

## Self-Check: PASSED

- [x] SUMMARY.md exists: `.planning/phases/01-foundation-layout-gallery/01-05-SUMMARY.md`
- [x] All 3 commits in git history:
  - `f266b0a` feat: wire brand typography
  - `871e6ef` feat: apply warm palette
  - `7c4f656` docs: complete plan metadata
- [x] `npm run build` passes (type-check + compile)
- [x] Compiled CSS shows Playfair Display SC font-heading and Karla font-sans
- [x] Compiled CSS shows warm hex palette values (#FEF2F2, #1A0A0A, #A16207, etc.)
- [x] No Inter reference in source or compiled CSS
