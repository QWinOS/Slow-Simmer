---
phase: 01-foundation-layout-gallery
plan: 06
subsystem: gallery-video
tags: sheets-api, youtube, instagram, env, runtime-fetch, tdd
requires: []
provides:
  - Runtime video feed from Google Sheets (auto-discovery: add a row, see a video)
  - URL parsing utilities for YouTube and Instagram links
  - fetchVideoLinks() with graceful-fallback contract matching fetchGalleryImages
affects: []
tech-stack:
  added: []
  patterns:
    - Module-per-integration: lib/sheets.ts mirrors lib/drive.ts exactly
    - URL parsers co-located with embed builders in lib/video.ts
    - TDD discipline for pure parsing functions
key-files:
  created:
    - lib/sheets.ts
    - scripts/test-url-parsers.ts
    - .env.example
  modified:
    - lib/video.ts
    - components/VideoSection.tsx
    - components/VideoGrid.tsx
    - components/VideoThumbnail.tsx
    - .env.local
    - .gitignore
key-decisions:
  - "VideoSection owns the fetch/loading/error state (mirrors GallerySection), passes loading prop to VideoGrid"
  - "Keep URL parsers co-located with embed builders in lib/video.ts (already an embedding module)"
  - "TDD for parsers — 16 test cases covering YouTube watch/shorts/youtu.be/bare-ID and Instagram post/reel with/without trailing slash/query"
  - ".gitignore updated with !.env.example to allow the template to be committed"
patterns-established:
  - "Integration modules: one file per external API (drive.ts, sheets.ts) with identical fetch/fallback/throw contracts"
  - "Runtime data sources: client-side useEffect+useCallback fetch on mount, loading/empty/error states"
requirements-completed:
  - GALL-05
coverage:
  - id: D1
    description: "URL parsing utilities — getYouTubeVideoIdFromUrl, getInstagramPostIdFromUrl, detectVideoPlatform"
    requirement: GALL-05
    verification:
      - kind: other
        ref: scripts/test-url-parsers.ts (16 assertions)
        status: pass
    human_judgment: false
  - id: D2
    description: "fetchVideoLinks in lib/sheets.ts — runtime Google Sheets data source mirroring drive.ts"
    requirement: GALL-05
    verification:
      - kind: other
        ref: grep assertions in 01-06-VERIFICATION.md
        status: pass
    human_judgment: false
  - id: D3
    description: "VideoSection rewired — hardcoded VIDEOS constant removed, runtime fetch on mount, loading/empty states from parent"
    requirement: GALL-05
    verification:
      - kind: other
        ref: grep assertions — placeholder IDs zero, fetchVideoLinks imported, build passes
        status: pass
    human_judgment: false
  - id: D4
    description: ".env.example documenting all NEXT_PUBLIC_ env vars"
    requirement: GALL-05
    verification:
      - kind: other
        ref: grep -q NEXT_PUBLIC_VIDEOS_SHEET_ID .env.example
        status: pass
    human_judgment: false
duration: 20min
completed: 2026-07-02
status: complete
---

# Phase 1 Plan 6: Video Sheet Source Summary

**Runtime video feed from Google Sheets — add a row to the source sheet, see a new video with no code change and no redeploy. Closes GALL-05, the last unbuilt Phase 1 requirement.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-07-02T21:10:00Z
- **Completed:** 2026-07-02T21:33:00Z
- **Tasks:** 3 (4 commits)
- **Files modified:** 8

## Accomplishments

- **URL parsers (TDD):** `getYouTubeVideoIdFromUrl`, `getInstagramPostIdFromUrl`, `detectVideoPlatform` — 16/16 test cases passing — handle watch/shorts/youtu.be/p/reel, query stripping, bare ID detection, null for non-matching platforms.
- **VideoItem relocated** from `VideoSection.tsx` to `lib/video.ts` — all three consuming components (`VideoSection`, `VideoGrid`, `VideoThumbnail`) import from `@/lib/video`.
- **fetchVideoLinks in lib/sheets.ts** — mirrors `fetchGalleryImages` exactly: read env vars, warn + return [] when missing, build URL with searchParams, throw on non-ok, parse response, skip unparseable rows, return [].

## TDD Compliance

The URL parsers were developed with TDD (RED/GREEN):

| Gate | Commit | Status |
|------|--------|--------|
| RED  | `674aa1e test(01-06): add failing tests for URL parsers` | ✓ |
| GREEN | `49bc1a6 feat(01-06): implement URL parsers and relocate VideoItem to lib/video.ts` | ✓ |

## Task Commits

1. **Task 1: Add URL-parsing helpers (TDD)** — `674aa1e` (test) + `49bc1a6` (feat)
2. **Task 2: Create lib/sheets.ts** — `47916c7` (feat)
3. **Task 3: Rewire VideoSection + env template** — `5a509fb` (feat)

## Files Created/Modified

### Created
- `lib/sheets.ts` — `fetchVideoLinks()` with graceful-fallback contract
- `scripts/test-url-parsers.ts` — 16 assertions for URL parsers
- `.env.example` — committed template documenting all NEXT_PUBLIC_ vars

### Modified
- `lib/video.ts` — added VideoItem interface + 3 URL parsers
- `components/VideoSection.tsx` — hardcoded VIDEOS removed, runtime fetch wired
- `components/VideoGrid.tsx` — accepts `loading` prop from parent, artificial timer removed
- `components/VideoThumbnail.tsx` — VideoItem import rerouted to `@/lib/video`
- `.env.local` — appended `NEXT_PUBLIC_VIDEOS_SHEET_ID=` (gitignored)
- `.gitignore` — added `!.env.example` negation to allow template commit

## Decisions Made

- **VideoSection owns fetch state** — mirrors GallerySection's pattern (owns loading/error, passes data down). `loading` prop drives VideoGrid skeleton instead of its own artificial timer.
- **URL parsers co-located with embed builders** — kept in `lib/video.ts` since existing `getYouTubeEmbedUrl`/`getInstagramEmbedUrl` consume the bare IDs the new parsers extract. No new module needed.
- **TDD for pure functions** — 16 test cases written before implementation. Parsers are pure (input→output) so the TDD RED/GREEN cycle was natural.
- **Sheets API range capped** — `Sheet1!A2:B1000` bounds payload size (same threshold accepted in threat model T-01-06-03).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all tasks completed without issues.

## User Setup Required

**External services require manual configuration.** See [plan frontmatter](./01-06-PLAN.md#user_setup) for Google Sheets setup:
1. Enable the Google Sheets API (v4) on the same GCP project that owns `NEXT_PUBLIC_GOOGLE_API_KEY`
2. Share the videos spreadsheet as "Anyone with the link can view"
3. Set `NEXT_PUBLIC_VIDEOS_SHEET_ID` in `.env.local` to the spreadsheet ID
4. The existing `NEXT_PUBLIC_GOOGLE_API_KEY` is reused (no new key needed)

## Next Phase Readiness

- Phase 1 foundation is complete — all requirements (GALL-01 through GALL-05) are built
- Ready for next phase: registration form with payment integration
