---
phase: 5
slug: terms-conditions-page-agreement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-14
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 1 | TC-01 | — / — | N/A | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | TC-02 | — / — | N/A | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | TC-03 | — / — | N/A | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | TC-04 | — / — | N/A | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | TC-05 | — / — | N/A | unit | `npx vitest run --reporter=dot` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test setup needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| T&C page renders with correct brand styling (colors, fonts, layout) | TC-02 | Visual correctness requires human judgment | Navigate to `/terms`, verify Playfair Display SC heading, Karla body, warm red/gold palette |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
