---
phase: 01
slug: foundation-layout-gallery
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-02
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot --changed`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | UI-01 | T-01-01 / — | Nav links scroll to correct sections | unit | `npx vitest run -- --testPathPattern=navbar` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | UI-01, UI-02 | — / — | Sections render in correct order at mobile/desktop | unit | `npx vitest run -- --testPathPattern=layout` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | GALL-01 | T-01-02 / — | Gallery fetches images from Drive API and displays grid | unit | `npx vitest run -- --testPathPattern=gallery` | ❌ W0 | ⬜ pending |
| 01-01-04 | 01 | 1 | GALL-02 | — / — | Video thumbnails display with play overlay | unit | `npx vitest run -- --testPathPattern=video` | ❌ W0 | ⬜ pending |
| 01-01-05 | 01 | 1 | GALL-02 | — / — | Click play opens inline YouTube/Instagram embed | unit | `npx vitest run -- --testPathPattern=video` | ❌ W0 | ⬜ pending |
| 01-01-06 | 01 | 1 | GALL-03 | — / — | Gallery grid adapts to breakpoints | unit | `npx vitest run -- --testPathPattern=gallery` | ❌ W0 | ⬜ pending |
| 01-01-07 | 01 | 1 | GALL-04 | — / — | Gallery loads images dynamically from Drive API | unit | `npx vitest run -- --testPathPattern=gallery` | ❌ W0 | ⬜ pending |
| 01-01-08 | 01 | 1 | UI-03 | — / — | Dark mode renders with correct palette | visual | manual | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install vitest @testing-library/react @testing-library/jest-dom jsdom` — install test framework
- [ ] `src/__tests__/navbar.test.tsx` — stubs for navbar interactions (UI-01)
- [ ] `src/__tests__/gallery.test.tsx` — stubs for gallery rendering (GALL-01, GALL-03, GALL-04)
- [ ] `src/__tests__/video.test.tsx` — stubs for video grid (GALL-02)
- [ ] `vitest.config.ts` — test configuration with jsdom environment

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode color accuracy | UI-03 | Visual appearance cannot be asserted programmatically | Toggle system dark mode; verify all sections render with correct dark palette |
| Google Drive API integration | GALL-01 | Requires live API key and network access | Run dev server; verify photos load from Drive folder |
| YouTube/Instagram embed | GALL-02 | Third-party iframe behavior | Tap play on video; verify embed loads and plays inline |
| Mobile touch targets | UI-02 | Physical interaction quality | Open on mobile device or Chrome DevTools mobile emulation; verify 44x44px minimum tap targets |
| Lightbox swipe navigation | GALL-03 | Touch gesture quality | Open lightbox on mobile; verify swipe navigates photos |
| Smooth scroll behavior | UI-01 | Animation quality / prefers-reduced-motion | Tap nav links; verify smooth scroll; test with prefers-reduced-motion enabled |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
