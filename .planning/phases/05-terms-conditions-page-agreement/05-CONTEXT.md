# Phase 5: Terms & Conditions Page + Agreement - Context

**Gathered:** 2026-07-14
**Status:** Ready for planning

<domain>
## Phase Boundary

A dedicated `/terms` route displaying the full 8-clause Terms & Conditions text, and an "I agree to the Terms & Conditions" checkbox on the registration form that must be checked before submission. No env-driven config — Phase 4 was deferred, values are hardcoded.

</domain>

<decisions>
## Implementation Decisions

### T&C Page Approach
- **D-01:** Dedicated `/terms` route (Next.js `app/terms/page.tsx`) — not a dialog/modal
- **D-02:** Link opens in new tab (`target="_blank"`) so the registration form stays visible
- **D-03:** "Back to Registration" link/button on the T&C page that navigates to `/#form`
- **D-04:** Full NavBar appears on the T&C page with "Terms" as the active section

### T&C Content Authoring
- **D-05:** T&C text lives in a standalone data file `lib/terms.ts` — exports the clauses as typed data
- **D-06:** "Last updated: July 14, 2026" is a static string in the data file (not env-driven)

### Checkbox + Link UX
- **D-07:** Checkbox placed above the Submit button, after Social & About section
- **D-08:** Label text: "I agree to the Terms & Conditions" with the word "Terms & Conditions" as a link to `/terms`
- **D-09:** Standard checkbox with inline link — no separate button or card-style treatment
- **D-10:** Uses existing `@/components/ui/checkbox` shadcn component with `@radix-ui/react-checkbox`

### T&C Page Layout & Nav
- **D-11:** Centered card layout (`max-w-3xl`), matching the main page's content width
- **D-12:** Full footer (same as main page) appears on the T&C page

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §T&C Page — TC-01 through TC-05
- `.planning/ROADMAP.md` §Phase 5 — Phase goal and success criteria

### Existing Code
- `components/RegistrationForm.tsx` — Form that needs the T&C checkbox inserted. Uses React Hook Form + Controller pattern
- `lib/validations.ts` — Zod schema (`registrationSchema`) that needs `termsAccepted: z.literal(true)` added
- `components/ui/checkbox.tsx` — Existing Checkbox component (Radix UI) to use for the agreement field
- `components/NavBar.tsx` — Navigation bar that will appear on the T&C page
- `components/Footer.tsx` — Footer to include on the T&C page
- `lib/site-config.ts` — Site config module (not used for T&C content since Phase 4 was deferred)
- `app/layout.tsx` — Root layout with theme provider, fonts, and metadata
- `app/page.tsx` — Main single-page layout — T&C page should feel like a sibling, not disjoint

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/checkbox.tsx` — Radix-based checkbox, ready for the "I agree" field. Already styled to match the brand
- `components/ui/field.tsx` + `components/ui/label.tsx` — Field components for React Hook Form integration, same pattern used for all form fields
- `lib/validations.ts` — Zod schema that already validates the registration form. A `termsAccepted` boolean literal is the only addition needed
- `components/NavBar.tsx` — Full responsive navbar with mobile hamburger, theme toggle, and desktop CTA

### Established Patterns
- React Hook Form with `zodResolver` for all form state and validation
- `Controller` component wrapping shadcn Field/Input/Checkbox for controlled inputs
- TailwindCSS with warm red/gold palette (#DC2626/#F87171/#A16207) and Playfair Display SC + Karla font pairing
- Single-page hash-anchor navigation (NavBar scrolls to `#section`) — T&C route is the first multi-page navigation

### Integration Points
- New route: `app/terms/page.tsx` — Server component that imports terms data and renders the page
- Checkbox insertion point: `components/RegistrationForm.tsx` — After Social & About section, before the Submit `<Button>`
- Schema: `lib/validations.ts` — Add `termsAccepted: z.literal(true, { message: "..." })` to `registrationSchema`
- NavBar may need a minor update to mark "Terms" as active when on `/terms`

</code_context>

<specifics>
## Specific Ideas

No specific references — standard legal/UX approach. The 8-clause T&C content should cover: introduction, membership/eligibility, event participation, code of conduct, payment/refunds, liability disclaimer, privacy, and contact/modification clause.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-Terms & Conditions Page + Agreement*
*Context gathered: 2026-07-14*
