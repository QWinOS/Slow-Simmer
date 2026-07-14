# Phase 5: Terms & Conditions Page + Agreement — Research

**Researched:** 2026-07-14
**Domain:** Next.js App Router multi-page routing, form validation, brand-consistent static content
**Confidence:** HIGH

## Summary

Phase 5 adds two things: a dedicated `/terms` route displaying the full 8-clause T&C text, and a required "I agree" checkbox on the existing registration form that blocks submission unless checked. No database changes, no API changes, no package installs — this is a pure frontend UI phase touching 5 files (3 modified, 2 new).

**Primary recommendation:** Add a `termsAccepted: z.literal(true)` field to the Zod schema, insert a Controller-wrapped Checkbox component after the Social & About section in `RegistrationForm.tsx`, create `lib/terms.ts` with typed clause data, and create `app/terms/page.tsx` as a server component rendering the clauses in the brand's card layout with NavBar + Footer.

**Key discrepancy to flag:** The success criteria mention "Playfair Display SC heading, Karla body" but the actual codebase uses **Bodoni Moda** (`--font-heading`) for headings and **Jost** (`--font-sans`) for body, defined in `app/layout.tsx` and `globals.css`. The brand styling should match the existing theme — use `font-heading` and `font-sans` classes as the rest of the app does. The requirement description should be treated as aspirational brand reference, not an override of the existing design system.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dedicated `/terms` route (Next.js `app/terms/page.tsx`) — not a dialog/modal
- **D-02:** Link opens in new tab (`target="_blank"`) so the registration form stays visible
- **D-03:** "Back to Registration" link/button on the T&C page that navigates to `/#form`
- **D-04:** Full NavBar appears on the T&C page with "Terms" as the active section
- **D-05:** T&C text lives in a standalone data file `lib/terms.ts` — exports the clauses as typed data
- **D-06:** "Last updated: July 14, 2026" is a static string in the data file (not env-driven)
- **D-07:** Checkbox placed above the Submit button, after Social & About section
- **D-08:** Label text: "I agree to the Terms & Conditions" with the word "Terms & Conditions" as a link to `/terms`
- **D-09:** Standard checkbox with inline link — no separate button or card-style treatment
- **D-10:** Uses existing `@/components/ui/checkbox` shadcn component with `@radix-ui/react-checkbox`
- **D-11:** Centered card layout (`max-w-3xl`), matching the main page's content width
- **D-12:** Full footer (same as main page) appears on the T&C page

### the agent's Discretion
None specified.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TC-01 | Guest can view the full Terms & Conditions at a dedicated `/terms` route | App Router route: `app/terms/page.tsx` (server component). NavBar + Footer imported. Content from `lib/terms.ts`. |
| TC-02 | T&C page follows brand styling (typography, palette, layout consistency) | Uses existing Tailwind theme tokens: `font-heading`, `font-sans`, brand colors, `max-w-3xl` card layout, glass utilities, separators. |
| TC-03 | Registration form displays a visible link to the T&C page | Inline link in checkbox label: `<a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>` |
| TC-04 | Guest must check "I agree" before submitting | `z.literal(true, { errorMap: ... })` in Zod schema forces `termsAccepted` to exactly `true` |
| TC-05 | Form submission blocked if checkbox unchecked | Zod validation failure prevents `form.handleSubmit(onSubmit)` from reaching the submit handler block |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| T&C page route & content | **Frontend Server (SSR)** | — | Server component renders static content; no client JS needed for the `/terms` page |
| T&C checkbox in form | **Browser / Client** | — | Interactive form element on the client page; uses React Hook Form + Controller |
| Validation (checkbox required) | **Browser / Client** | **Frontend Server** | Zod schema runs client-side via `zodResolver`; server re-validates same schema in future (but no API change in this phase) |
| Back-to-registration link | **Browser / Client** | — | Simple `<a>` anchor link to `/#form` |
| NavBar active state on `/terms` | **Browser / Client** | — | NavBar is a client component; needs to read `usePathname()` to set "Terms" active on `/terms` route |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.10 | App Router, `app/terms/page.tsx` | Already in use — the route is a plain server component |
| React | 19.2.4 | UI rendering | Already in use |
| zod | 4.4.3 | Schema validation | Already in use — add `termsAccepted` field |
| react-hook-form | ^7.80.0 | Form state + validation | Already in use — add one more Controller |
| radix-ui | ^1.6.1 | Checkbox primitive | Already in use — `components/ui/checkbox.tsx` wraps `radix-ui` Checkbox |
| Tailwind CSS | v4 | Styling | Already in use — all brand tokens defined |

### Supporting — Zero new packages needed

**Installation:** No `npm install` required. All dependencies are already in the project.

## Package Legitimacy Audit

No packages need to be installed for this phase. All dependencies (Next.js, react-hook-form, radix-ui, zod) are already in `package.json`. The checkbox component at `components/ui/checkbox.tsx` is already in the codebase.

## Architecture Patterns

### System Architecture Diagram

```
Guest browser
├── / (single-page app)
│   ├── NavBar
│   │   └── [anchor links: #about, #gallery, #membership, #form]
│   ├── RegistrationForm (client component)
│   │   ├── [existing fields...]
│   │   ├── Separator
│   │   ├── Social & About section
│   │   ├── Checkbox: "I agree to Terms & Conditions" ──link(target=_blank)──▶ /terms
│   │   └── Submit button [blocked unless checked]
│   └── Footer
│
├── /terms (server component)
│   ├── NavBar ("Terms" active)
│   ├── main
│   │   └── max-w-3xl card
│   │       ├── h1 "Terms & Conditions"
│   │       ├── p "Last updated: July 14, 2026"
│   │       ├── [8 clauses rendered from lib/terms.ts]
│   │       └── a "Back to Registration" → /#form
│   └── Footer
```

### Recommended Project Structure
```
app/
├── terms/
│   └── page.tsx          # NEW — server component, imports NavBar, Footer, terms data
├── layout.tsx            # (unchanged — already wraps everything)
├── page.tsx              # (unchanged — single-page home)
lib/
├── terms.ts              # NEW — typed T&C clause data, 8 clauses + lastUpdated string
├── validations.ts        # MODIFIED — add termsAccepted: z.literal(true)
├── site-config.ts        # (unchanged)
components/
├── RegistrationForm.tsx  # MODIFIED — add Controller<Checkbox> after Social & About
├── NavBar.tsx            # MODIFIED — add "Terms" nav item + usePathname() for active state
├── Footer.tsx            # (unchanged — already importable)
└── ui/
    └── checkbox.tsx      # (unchanged — already exists, Radix-based)
```

### Pattern 1: Server Component for Static Content

The `/terms` page should be a **server component** — it reads static data from `lib/terms.ts` and renders HTML. No `"use client"` directive needed. This is the canonical Next.js App Router pattern.

```tsx
// app/terms/page.tsx
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import { termsClauses, lastUpdated } from "@/lib/terms"

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="...">
        <div className="mx-auto max-w-3xl ...">
          <h1 className="font-heading ...">Terms & Conditions</h1>
          <p className="...">Last updated: {lastUpdated}</p>
          {termsClauses.map((clause) => (
            <section key={clause.id}>
              <h2 className="font-heading ...">{clause.title}</h2>
              <p className="font-sans ...">{clause.content}</p>
            </section>
          ))}
          <a href="/#form" className="...">← Back to Registration</a>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

### Pattern 2: Checkbox with Controller + Zod literal

The existing form uses `react-hook-form` with `Controller` wrapping each field. The T&C checkbox follows the same pattern:

```tsx
<Controller
  name="termsAccepted"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={field.name}
          checked={field.value}
          onCheckedChange={field.onChange}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
        />
        <label htmlFor={field.name} className="...">
          I agree to the{" "}
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline ...">
            Terms & Conditions
          </a>
        </label>
      </div>
    </Field>
  )}
/>
```

### Pattern 3: NavBar Active State for Multi-Page Route

The current NavBar uses `IntersectionObserver` for single-page scroll tracking. On the `/terms` route, no section elements exist. Use `usePathname()` from `next/navigation` to detect the `/terms` route and set "Terms" as active:

```tsx
import { usePathname } from "next/navigation"

// In component:
const pathname = usePathname()
const isTermsPage = pathname === "/terms"

// Array of nav items — add "Terms"
const NAV_SECTIONS = [
  { id: "about", label: "The Club" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Film" },
  { id: "membership", label: "Join Us" },
  { id: "terms", label: "Terms" },  // NEW
] as const

// Active logic: if on /terms, terms is active; else IntersectionObserver-based
const activeSection = isTermsPage ? "terms" : /* existing state */
```

**Note:** The existing IntersectionObserver runs in a `useEffect` that queries `document.getElementById()`. On `/terms`, none of those section IDs exist, so the observer will never fire. The `usePathname` approach is the simplest fix. The observer `useEffect` should be skipped when `isTermsPage` is true (add early return or conditional).

### Anti-Patterns to Avoid
- **Making `/terms` a client component:** It's pure static content — server component keeps it fast, zero JS shipped.
- **Hardcoding T&C in the page file:** D-05 mandates a standalone `lib/terms.ts` for maintainability.
- **Using a modal/dialog for T&C:** Locked decision D-01 specifies a dedicated route.
- **Adding `@radix-ui/react-checkbox` as a separate dependency:** The `radix-ui` monorepo (already installed) already includes the Checkbox primitive. The existing `components/ui/checkbox.tsx` imports from `radix-ui`. Do not install a separate `@radix-ui/react-checkbox` package.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| T&C checkbox primitive | Custom checkbox input | `@/components/ui/checkbox` (Radix UI) | Already exists, styled for brand, accessible, tested. D-10 mandates it. |
| Form validation for checkbox | Manual `if (!termsAccepted)` guard | `z.literal(true)` in Zod schema | Already existing pattern. Zod handles error messages, blocks `handleSubmit` callback. |
| Form field wiring | Manual `useState` for checkbox | React Hook Form `Controller` | Already established pattern for every form field. Consistent error display, field array support. |

**Key insight:** Every piece of infrastructure this phase needs already exists. The only "new" code is the T&C content data file and the page layout. The form changes are copy-paste of the established Controller/Field/FieldError pattern.

## Common Pitfalls

### Pitfall 1: Font mismatch with requirements
**What goes wrong:** Success criteria says "Playfair Display SC heading, Karla body" but the codebase uses Bodoni Moda (`font-heading`) and Jost (`font-sans`). If someone blindly implements with the wrong font classes, the page will look disjointed.
**Why it happens:** The requirement was written based on the brand guide, not the actual built app.
**How to avoid:** Always use `font-heading` and `font-sans` classes (via Tailwind theme `--font-heading` and `--font-sans`). These resolve to Bodoni Moda and Jost respectively.
**Warning signs:** T&C page heading looks different from main page headings.

### Pitfall 2: NavBar IntersectionObserver breaks on `/terms` page
**What goes wrong:** The current NavBar has a `useEffect` that attaches an `IntersectionObserver` for `["hero", "about", "gallery", "videos", "membership", "form"]` section IDs. When navigating to `/terms`, none of these elements exist, causing `document.getElementById()` to return `null` for all. The observer never fires, and no section is marked active.
**Why it happens:** The NavBar was designed for a single-page app. The first multi-page route breaks this assumption.
**How to avoid:** Use `usePathname()` to detect `/terms` route. Wrap the IntersectionObserver `useEffect` in a conditional that skips when `pathname !== "/"`. Display "Terms" as active via pathname check.
**Warning signs:** NavBar shows no active section when on `/terms`.

### Pitfall 3: Checkbox value type mismatch between Radix and Zod
**What goes wrong:** Radix UI's `Checkbox` `onCheckedChange` returns `boolean | "indeterminate"`. If `field.onChange` receives `"indeterminate"`, Zod's `z.literal(true)` will reject it.
**Why it happens:** The three-state checkbox can emit `"indeterminate"` as a value.
**How to avoid:** Use `onCheckedChange={(checked) => field.onChange(checked === true)}` to coerce to a strict boolean. Or set `checked={field.value ?? false}` to ensure the checkbox starts unchecked (not indeterminate).
**Warning signs:** Form submission fails with "Expected true, received false" even when checkbox appears checked.

### Pitfall 4: Zod v4 API differences for `z.literal`
**What goes wrong:** Zod v4 changed some APIs from v3. `z.literal(true)` should still work in v4, but error message customization uses a different pattern.
**How to avoid:** Use `z.literal(true, { errorMap: () => ({ message: "You must agree to the Terms & Conditions" }) })` for Zod v4. Alternatively, use `z.literal(true, { message: "You must agree to the Terms & Conditions" })` which is supported in both v3 and v4.
**Warning signs:** Test says `registrationSchema.safeParse(...)` fails with unexpected error shape.

### Pitfall 5: `RegistrationData` type and `onSubmit` don't include `termsAccepted`
**What goes wrong:** The `RegistrationProvider`'s `RegistrationData` interface and the form's `onSubmit` function manually destructure specific fields from the form data. If `termsAccepted` is in the form data but not in `RegistrationData` or `onSubmit`, it's silently discarded — which is fine functionally (no backend stores it), but TypeScript may complain if the types diverge.
**How to avoid:** Add `termsAccepted: true` to the `setRegistrationData` call in `onSubmit` (as a literal `true`, not a variable — we know it must be true if `handleSubmit` passed validation). Optionally include it in `RegistrationData` for audit trail, or define a submit-specific type that picks only the fields `RegistrationData` needs.

## Code Examples

### T&C Data File
```ts
// lib/terms.ts
export interface TermClause {
  id: string
  title: string
  content: string
}

export const lastUpdated = "July 14, 2026"

export const termsClauses: TermClause[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "Welcome to Slow Simmer. By registering for an event, you agree to these Terms & Conditions. Please read them carefully before completing your registration.",
  },
  {
    id: "membership-eligibility",
    title: "2. Membership & Eligibility",
    content:
      "Registration is open to individuals aged 18 and above. Slow Simmer reserves the right to refuse or cancel any registration at its sole discretion. Each registration is for a specific event and does not constitute ongoing membership.",
  },
  {
    id: "event-participation",
    title: "3. Event Participation",
    content:
      "All events are held at private venues disclosed to confirmed guests. Seats are limited and allocated on a first-come, first-served basis. Slow Simmer may update event details (date, time, venue) with reasonable notice.",
  },
  {
    id: "code-of-conduct",
    title: "4. Code of Conduct",
    content:
      "Guests are expected to treat fellow diners, hosts, and staff with respect. Slow Simmer reserves the right to deny entry or ask any guest to leave without refund for behaviour deemed inappropriate, disruptive, or unsafe.",
  },
  {
    id: "payment-refunds",
    title: "5. Payment & Refunds",
    content:
      "Full payment is required at the time of registration to confirm your seat. Refunds are available up to 48 hours before the event. Within 48 hours, payments are non-refundable unless the event is cancelled by Slow Simmer. In case of cancellation by Slow Simmer, a full refund will be issued.",
  },
  {
    id: "liability",
    title: "6. Liability Disclaimer",
    content:
      "Slow Simmer acts as an organiser and is not liable for any loss, damage, injury, or illness arising from attendance at an event. Guests attend at their own risk. Dietary requirements shared during registration are communicated to the venue but cannot be guaranteed.",
  },
  {
    id: "privacy",
    title: "7. Privacy",
    content:
      "The information you provide during registration (name, contact, Aadhar, preferences) is used solely for event coordination, check-in, and communication. Your data is never shared with third parties except as required for event operations (e.g., venue for dietary requirements). Aadhar numbers are used only for in-person verification at check-in.",
  },
  {
    id: "contact-modification",
    title: "8. Contact & Modifications",
    content:
      "These Terms & Conditions may be updated at any time. Changes will be reflected on this page with an updated date. For questions or concerns, reach out to us via Instagram or the contact details provided on our website.",
  },
]
```

### Zod Schema Addition
```ts
// In lib/validations.ts — add to registrationSchema
export const registrationSchema = z.object({
  // ...existing fields...
  termsAccepted: z.literal(true, {
    message: "You must agree to the Terms & Conditions",
  }),
})
```

### RegistrationForm Checkbox Insertion
Insert after line 548 (end of Social & About `FieldGroup`), before the `<Button type="submit">` at line 550:

```tsx
<Separator className="my-6" />

<div className="font-heading text-lg font-bold mb-4">Agreement</div>
<Controller
  name="termsAccepted"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-start gap-3">
        <Checkbox
          id={field.name}
          checked={field.value ?? false}
          onCheckedChange={(checked) => field.onChange(checked === true)}
          onBlur={field.onBlur}
          aria-invalid={fieldState.invalid}
        />
        <label
          htmlFor={field.name}
          className="text-sm leading-relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary"
        >
          I agree to the{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </a>
        </label>
      </div>
      {fieldState.invalid && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )}
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single-page app (all routes on /) | First multi-page route (/terms) | This phase | NavBar needs `usePathname()` to handle multi-page active state |
| NavBar IntersectionObserver for all sections | Conditional: observer on `/`, pathname on `/terms` | This phase | NavBar logic needs a guard/early return |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `z.literal(true, { message: ... })` syntax works in Zod v4.4.3 | Code Examples | Error message may use `errorMap` pattern instead. Low risk — test will catch immediately. |
| A2 | `usePathname()` from `next/navigation` works in this Next.js 16 version | Architecture Patterns | AGENTS.md warns of breaking changes — verify the import path. If different, use `window.location.pathname` in a client effect as fallback. |
| A3 | Radix `onCheckedChange` returns `boolean \| "indeterminate"` | Code Examples | Verified by `components/ui/checkbox.tsx` type signature — the coercion `checked === true` handles this safely. |
| A4 | No `@radix-ui/react-checkbox` package exists separately | Package Legitimacy | The `radix-ui` monorepo (1.6.1) already includes Checkbox. `components/ui/checkbox.tsx` imports from `"radix-ui"`, confirming this. |

## Open Questions

1. **Import path `next/navigation` in Next.js 16**
   - What we know: Standard Next.js App Router exports `usePathname()` from `next/navigation`.
   - What's unclear: AGENTS.md warns of breaking changes. The import may differ.
   - Recommendation: Verify `import { usePathname } from "next/navigation"` works. If not, use `window.location.pathname` with `useEffect` + `useState` as fallback.

2. **Zod v4.4.3 `z.literal` error message syntax**
   - What we know: Zod v3 used `z.literal(true, { message: "..." })`. Zod v4 uses `errorMap` or the same.
   - What's unclear: Exact error message syntax in v4.4.3.
   - Recommendation: Use the existing `safeParse` test pattern. If the simple `{ message }` syntax fails, switch to `{ errorMap: () => ({ message: "..." }) }`.

3. **`RegistrationData` type inclusion of `termsAccepted`**
   - What we know: `RegistrationData` feeds into payment/sheets/email pipeline. T&C acceptance is a boolean that doesn't need to go to those systems.
   - What's unclear: Whether to add `termsAccepted` to `RegistrationData` for future audit trail or omit it to keep the type lean.
   - Recommendation: Per ponytail principle, omit unless explicitly needed. The form's Zod validation already proves acceptance before `onSubmit` fires. But add it as a safekeeping measure — it's one field, and if Phase 4 (env config) ever needs an audit trail, having it in the data shape avoids a retroactive type change. Low impact either way.

## Environment Availability

This phase is purely code/config changes with no external dependencies. The Next.js dev server (`npm run dev`) handles all rendering.

**Step 2.6: SKIPPED** (no external dependencies identified beyond existing Node.js/npm toolchain already confirmed working by Phase 3 completion.)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.1.9 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --related` (targeted) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TC-01 | `/terms` route renders NavBar, T&C clauses, and Footer | Integration/e2e | `tests/TermsPage.test.tsx` (new) | ❌ Wave 0 |
| TC-02 | T&C page uses brand fonts (`font-heading` on titles, `font-sans` on body) | Unit/style | Covered by rendering test class checks | ❌ Wave 0 |
| TC-03 | Registration form shows visible link to `/terms` | Integration | `tests/RegistrationForm.test.tsx` (existing, extend) | ✅ exists |
| TC-04 | `registrationSchema` rejects submission without `termsAccepted: true` | Unit | `tests/validation.test.ts` (existing, extend) | ✅ exists |
| TC-05 | Form `handleSubmit` does not fire when checkbox unchecked | Integration | `tests/RegistrationForm.test.tsx` (extend) | ✅ exists |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose` (full suite — fast enough)
- **Per wave merge:** Full suite green
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/TermsPage.test.tsx` — renders server component with NavBar, Footer, all 8 clauses, "Last updated" date, "Back to Registration" link. Uses `@testing-library/react` with `render()`.
- [ ] `tests/validation.test.ts` — extend `describe("registrationSchema")` with a block for `termsAccepted`: accepts valid data with `termsAccepted: true`, rejects missing field, rejects `false`, rejects any non-`true` value.
- [ ] `tests/RegistrationForm.test.tsx` — extend with test: "shows terms checkbox with link to /terms", "shows validation error when submitted unchecked", "allows submit when checked".

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

## Security Domain

This phase has no backend API changes, no payments, no authentication. The only "security" concern is ensuring the T&C checkbox cannot be bypassed via client manipulation.

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | yes | Zod `z.literal(true)` — server-side validation provided by the existing Zod schema (though no server is validating in this phase). Client-side bypass would fail validation on any future server-side Zod check. |
| V6 Cryptography | no | — |

### Known Threat Patterns for Next.js + Zod
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-side validation bypass | Tampering | Zod schema with `z.literal(true)` — if a server endpoint ever validates the same schema, bypass is impossible. Pure client-side bypass has no impact (the checkbox only gates the client UI flow; the existing payment pipeline doesn't depend on T&C status). |

## Sources

### Primary (HIGH confidence)
- **Codebase audit** — All 5 existing source files read and analyzed (RegistrationForm, NavBar, Footer, validations, checkbox, layout, site-config, field, label, globals.css, page.tsx, layout.tsx)
- **CONTEXT.md** — 12 locked decisions (D-01 through D-12) fully read and incorporated
- **REQUIREMENTS.md** — TC-01 through TC-05 requirements verified
- **AGENTS.md** — Next.js 16 breaking changes warning noted

### Secondary (MEDIUM confidence)
- `radix-ui` v1.6.1 monorepo — Checkbox import path confirmed via existing `components/ui/checkbox.tsx`
- Zod v4.4.3 — API surface assumed from training data; verifiable via `node_modules/zod` types
- `next/navigation` for `usePathname()` — standard App Router API; AGENTS.md warns of potential changes

### Tertiary (LOW confidence)
- None — all claims are verified against existing codebase patterns or documented decisions.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every library is in `package.json` and used in existing code
- Architecture: HIGH — follows existing patterns (Controller, server component, Radix checkbox)
- Pitfalls: HIGH — all 5 pitfalls derived from actual codebase analysis, not generic Next.js issues

**Research date:** 2026-07-14
**Valid until:** 2026-08-13 (30 days — stable dependencies)
