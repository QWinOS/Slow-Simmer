# Phase 5: Terms & Conditions Page + Agreement - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-14
**Phase:** 5-Terms & Conditions Page + Agreement
**Areas discussed:** T&C page approach, T&C content authoring, Checkbox + link UX, T&C page layout & nav

---

## T&C Page Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /terms route | Full page at /terms matching brand styling | ✓ |
| Dialog/modal overlay | T&C displayed in a dialog using existing dialog.tsx | |

**User's choice:** Dedicated /terms route
**Notes:** Form state is preserved via React Hook Form + RegistrationProvider when navigating between pages.

| Option | Description | Selected |
|--------|-------------|----------|
| Open in new tab | Keeps the form visible in the original tab | ✓ |
| Navigate same tab | Client-side transition preserves form state | |

**User's choice:** Open in new tab
**Notes:** Less disruptive to the registration flow.

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — 'Back to Registration' button | Takes guest back to main page at #form | ✓ |
| No — just the NavBar | Uses existing NavBar CTA instead | |

**User's choice:** Yes — 'Back to Registration' button

| Option | Description | Selected |
|--------|-------------|----------|
| Full NavBar with 'Terms' active | Same NavBar component, consistent styling | ✓ |
| Simplified NavBar | Brand + Reserve CTA only, no section links | |

**User's choice:** Full NavBar with 'Terms' active

---

## T&C Content Authoring

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone data file | 8-clause text in lib/terms.ts as typed constant | ✓ |
| Inline in page component | Text directly in app/terms/page.tsx | |

**User's choice:** Standalone data file
**Notes:** Follows Phase 4's deferred status; can be wrapped by env config later.

| Option | Description | Selected |
|--------|-------------|----------|
| Static date in data file | Hardcode "Last updated: July 14, 2026" | ✓ |
| Env-driven date | Read from .env via site-config.ts | |

**User's choice:** Static date in data file

---

## Checkbox + Link UX

| Option | Description | Selected |
|--------|-------------|----------|
| Above Submit button | After Social & About section, right before Submit | ✓ |
| Before Guest Details | After personal info, before guests | |

**User's choice:** Above Submit button

| Option | Description | Selected |
|--------|-------------|----------|
| 'I agree to the Terms & Conditions' | Standard phrasing, links to /terms | ✓ |
| 'I have read and agree to the Terms & Conditions' | Explicit consent phrasing | |
| 'I agree to the Terms & Conditions and Privacy Policy' | Fuller legal language | |

**User's choice:** 'I agree to the Terms & Conditions'

| Option | Description | Selected |
|--------|-------------|----------|
| Standard checkbox with link | Uses existing Checkbox component, inline link | ✓ |
| Card-style with separate button | Bordered card with separate 'Read Terms' button | |

**User's choice:** Standard checkbox with link

---

## T&C Page Layout & Nav

| Option | Description | Selected |
|--------|-------------|----------|
| Centered card layout | max-w-3xl centered content card, NavBar, footer | ✓ |
| Narrow document-style layout | Legal document style with minimal decoration | |

**User's choice:** Centered card layout

| Option | Description | Selected |
|--------|-------------|----------|
| Show footer | Same footer as main page | ✓ |
| No footer | Just NavBar, back button, T&C content | |

**User's choice:** Show footer

---

## Agent's Discretion

None — all decisions were user-selected through discussion.

## Deferred Ideas

None — discussion stayed within phase scope.
