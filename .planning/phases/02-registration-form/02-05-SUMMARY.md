---
phase: 02-registration-form
plan: 05
subsystem: test
tags: [integration-test, vitest, testing-library, user-event]
requires:
  - phase: 02-registration-form
    plan: 01
    provides: shadcn UI components, vitest + jsdom + testing-library setup
  - phase: 02-registration-form
    plan: 02
    provides: RegistrationProvider context
  - phase: 02-registration-form
    plan: 03
    provides: Zod validation schema (lib/validations.ts)
  - phase: 02-registration-form
    plan: 04
    provides: RegistrationForm component
provides:
  - Integration test suite for RegistrationForm (18 tests)
  - Regression coverage for form behavior (onBlur validation, guest toggle, Aadhar masking, submit flow)
affects: [phase-03-payment]
tech-stack:
  added: []
  patterns:
    - userEvent.setup() async interaction pattern with realistic blur simulation
    - getAllByText / getAllByRole with filter for components emitting duplicate role="alert" elements
    - user.click(nextField) to trigger onBlur cross-field (not user.tab(), which is unreliable with Radix wrappers)
    - Polyfill pattern for jsdom gaps (ResizeObserver, scrollIntoView, IntersectionObserver)
key-files:
  created:
    - tests/RegistrationForm.test.tsx
  modified: []
key-decisions:
  - "Use user.click(fieldLabel) instead of user.tab() to trigger onBlur — user.tab() is unreliable across Radix UI field wrappers in jsdom"
  - "Use getAllByText for error messages that render in both ErrorSummary (<li>) and FieldError (<div>) simultaneously"
  - "Use getAllByRole('alert') with .filter() to distinguish ErrorSummary from FieldError when both share role='alert'"
  - "Wrap blur assertions in waitFor to handle async validation timing between RHF and React re-renders"
requirements-completed:
  - FORM-01
  - FORM-02
  - FORM-03
  - FORM-04
  - FORM-07
  - FORM-08
duration: 12min
completed: 2026-07-04
status: complete
---

# Phase 2 Plan 5: RegistrationForm Integration Tests Summary

**18 integration tests across 8 categories for the RegistrationForm component — covering render, validation, guest toggle, Aadhar masking, and submit behavior — all passing with `npx vitest run`**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-04T00:49:00Z
- **Completed:** 2026-07-04T01:58:00Z
- **Tasks:** 1 (auto)
- **Files modified:** 1

## Accomplishments

- Created `tests/RegistrationForm.test.tsx` with 18 tests across 8 describe blocks:
  1. **Form renders all sections** — verifies "Reserve Your Spot" heading, all 3 section titles, all 9 field labels, submit button
  2. **Required fields show asterisk** — verifies "Full Name *", "Contact Number *", "Email Address *", "Aadhar Number *" labels contain asterisks; "About Yourself" and "Instagram or LinkedIn" do not
  3. **onBlur validation shows inline errors** — types invalid values and clicks next field, verifies validation errors appear (name, contact, email)
  4. **Guest fields toggle with checkbox** — clicks "Bringing a guest?" checkbox and verifies guest name/age fields appear/disappear; checks aria-checked transitions
  5. **Error summary banner on submit** — submits empty form, verifies `role="alert"` banner with "Please fix the following errors:" heading and error list
  6. **Submit succeeds with valid data** — fills all required fields with valid data, submits, verifies no errors render
  7. **Aadhar input masks and formats** — types 12 digits, verifies formatted value (spaces inserted every 4 chars), verifies `type="password"` attribute
  8. **Guest fields conditionally required** — enables guest, submits with empty guest fields → errors appear; fills valid guest data → errors clear
- Polyfilled jsdom gaps: `ResizeObserver`, `scrollIntoView`, `IntersectionObserver`
- Mocked sonner `toast` to prevent portal requirement failures
- Wrapped form in `RegistrationProvider` for context

## Task Commits

Each task was committed atomically:

1. **Task 1: Create RegistrationForm integration tests** - `f3f77d1` (test)

**Plan metadata:** Pending after SUMMARY.md commit

## Files Created/Modified

- `tests/RegistrationForm.test.tsx` — 357-line integration test suite with 18 tests, polyfills, mocking, and helper functions

## Decisions Made

- **user.click over user.tab** — `user.tab()` triggers focus shift but does not reliably trigger React Hook Form's onBlur validation when the next focusable element is inside a Radix UI wrapper. Using `user.click(nextField)` directly on the next input's label reliably fires blur on the current field and focus on the target.
- **getAllByText for duplicate errors** — When onBlur triggers validation on Field A, React Hook Form marks Field A's error, causing both the ErrorSummary banner (`<li>`) and the inline FieldError (`<div>`) to render the same message text. `findByText` / `getByText` throw on multiple matches. Using `getAllByText` with `.length >= 1` assertion handles both.
- **waitFor wrapping on blur assertions** — After triggering blur via click, there is an asynchronous delay for RHF validation + React re-render. Wrapping assertions in `waitFor` avoids flaky timeout failures.
- **getAllByRole + filter for ErrorSummary** — Both `ErrorSummary` and `FieldError` use `role="alert"`. To assert on the summary specifically, use `getAllByRole("alert")` and filter by content (e.g., `el.textContent.includes("Email is required")`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] user.tab() does not reliably trigger onBlur in jsdom**
- **Found during:** Task 1 (test debugging)
- **Issue:** `user.tab()` moves focus to the next input but does not consistently trigger React Hook Form's onBlur detection when the Radix UI `FieldControl` wrapper intercepts the blur event. Tests using `user.tab()` between fields would timeout waiting for validation errors.
- **Fix:** Replaced `user.tab()` with `user.click(screen.getByLabelText(/next field label/i))` — clicking the next field's label directly triggers blur on the current field.
- **Files modified:** `tests/RegistrationForm.test.tsx`
- **Verification:** All 3 blur tests pass consistently
- **Committed in:** `f3f77d1` (Task 1 commit)

**2. [Rule 1 - Bug] findByText fails on duplicate error elements**
- **Found during:** Task 1 (test debugging)
- **Issue:** When onBlur triggers validation, the error message renders in both ErrorSummary (`<li>`) and FieldError (`<div role="alert">`). `findByText` throws `Found multiple elements with the text` because two elements contain the same string.
- **Fix:** Changed blur assertions to use `getAllByText` inside `waitFor`, asserting `errors.length >= 1`. Changed submit error checks to use `getAllByRole("alert")` with `.filter()` to isolate ErrorSummary from FieldError.
- **Files modified:** `tests/RegistrationForm.test.tsx`
- **Verification:** All 18 tests pass — duplicate error text no longer causes failures
- **Committed in:** `f3f77d1` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Necessary fixes for jsdom interaction quirks. No scope creep.

## Issues Encountered

- **jsdom gap — ResizeObserver:** Not present in jsdom; causes `ResizeObserver is not defined` in Radix UI dialog internals. Added class-level polyfill.
- **jsdom gap — scrollIntoView:** Not present in jsdom; causes `scrollIntoView is not defined` when ErrorSummary calls `focus()` on the first invalid field. Added `Element.prototype.scrollIntoView` polyfill.
- **jsdom gap — IntersectionObserver:** Not present in jsdom; causes `IntersectionObserver is not defined` in Reveal component. Added polyfill.
- **Duplicate role="alert":** Both `ErrorSummary` and `FieldError` render with `role="alert"`, making `getByRole("alert")` ambiguous. Resolved with `getAllByRole("alert")` + `filter()`.

## Known Stubs

None — test file is self-contained with all necessary mocks.

## Threat Flags

None — test file does not introduce new security surface. All test interactions exercise the same Zod schema and form components verified in production.

## Self-Check: PASSED

- [x] `tests/RegistrationForm.test.tsx` — exists on disk
- [x] Commit `f3f77d1` — Task 1 (create integration tests)
- [x] `npx vitest run tests/RegistrationForm.test.tsx` — 18/18 tests pass
- [x] `npx tsc --noEmit` — no TypeScript errors
