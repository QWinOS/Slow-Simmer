---
phase: 02
slug: registration-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-04
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Extracted from RESEARCH.md Validation Architecture section.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (to be installed — Wave 0) |
| **Config file** | none — Wave 0 installs `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FORM-01 | T-02-01 / — | Name is a string, min 2 chars, no injection | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | FORM-02 | T-02-01 / — | Contact validates /^[6-9]\d{9}$/ — no script injection | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | FORM-03 | T-02-01 / — | Email validates correctly, no XSS payloads | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | FORM-07 | — / D-12, D-13, D-14 | Aadhar 12 digits only, masked input, privacy note | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | FORM-04 | — / D-05, D-06 | Checkbox toggles guest fields, conditional required | integration | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-06 | 01 | 1 | FORM-05 | — / D-08 | About textarea accepts max 200 chars | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-07 | 01 | 1 | FORM-06 | — / D-08 | Social URL validates URL or empty | unit | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-08 | 01 | 1 | FORM-08 | T-02-01 / — | Required fields blocked on submit, errors displayed | integration | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 02-01-09 | 01 | 1 | FORM-09 | — / D-11 | Touch targets >= 44px, visible labels above inputs | manual | visual inspection | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — install test framework
- [ ] `vitest.config.ts` — basic vitest config with jsdom environment
- [ ] `tests/validation.test.ts` — unit tests for Zod schema covering all field rules
- [ ] `tests/RegistrationForm.test.tsx` — integration tests for conditional guest fields, submit behavior, error display
- [ ] `tests/setup.ts` — test framework setup with jest-dom matchers

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Touch targets >= 44px | FORM-09 | Requires visual inspection of rendered element dimensions | Open form on mobile viewport (375px width), verify all inputs/buttons have minimum 44x44px touch target area using browser devtools |
| Error summary banner `role="alert"` | FORM-08 / D-09 | Requires manual screen reader verification | With NVDA/VoiceOver, submit empty form and verify error banner is announced |
| Aadhar eye toggle accessibility | FORM-07 / D-12 | Requires manual keyboard + screen reader verification | Tab to eye toggle, verify Enter/Space activates, aria-label changes between "Show Aadhar" / "Hide Aadhar" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
