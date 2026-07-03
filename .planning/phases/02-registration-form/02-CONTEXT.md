# Phase 2: Registration Form - Context

**Gathered:** 2026-07-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the registration form that replaces the existing FormPlaceholder. Collects all guest details (name, contact, email, guest info, about yourself, social links, Aadhar) with client-side validation. Form data flows to Phase 3 via React context for payment processing and Google Sheets storage. No payment or sheets logic in this phase.

</domain>

<decisions>
## Implementation Decisions

### Form Layout
- **D-01:** Fields grouped into visual sections with labeled card titles inside a single outer card with dividers between sections
- **D-02:** Single column layout for all fields (consistent with site's max-w-lg pattern)
- **D-03:** Aadhar placed in Personal Info section (not separate section)
- **D-04:** Full-width submit button at the bottom of the form card

### Conditional Guest Fields
- **D-05:** Checkbox "Bringing a guest?" toggles guest name + age fields with slide animation
- **D-06:** Guest name and age both required when checkbox is checked

### Validation Strategy
- **D-07:** Real-time validation on blur (not submit-only)
- **D-08:** Required fields: name, contact number, email, Aadhar. Optional: social links, about yourself. Guest fields conditionally required.
- **D-09:** Error display: inline below each field + summary banner at form top with `role="alert"`
- **D-10:** Phone validation: strict 10-digit Indian mobile format (`/^[6-9]\d{9}$/`)
- **D-11:** Visible labels above inputs (not placeholder-only), required fields marked with asterisk

### Aadhar Input
- **D-12:** Masked input with eye toggle to reveal (like password field)
- **D-13:** Auto-format with spaces: XXXX XXXX XXXX
- **D-14:** Privacy note below field: "Your Aadhar is used only for event check-in"

### Form-to-Payment Handoff (Phase 3 contract)
- **D-15:** Validated form data stored in a React context provider — Phase 3 reads from the same context
- **D-16:** Google Sheets write happens only after payment confirmation (Phase 3), not on form submit

### Submission UX
- **D-17:** Submit button shows spinner and disables during validation
- **D-18:** On success: brief toast confirmation ("Form submitted! Now proceed to payment") then auto-scroll to payment section
- **D-19:** On error: error summary banner at top + inline field errors with focus on first invalid field

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Overall project vision, constraints, and key decisions
- `.planning/REQUIREMENTS.md` — FORM-01 through FORM-09 define field-level requirements

### Phase Structure
- `.planning/ROADMAP.md` — Phase dependencies and success criteria

### Prior Phase
- `.planning/phases/01-foundation-layout-gallery/01-CONTEXT.md` — Design system, section order, layout patterns

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/FormPlaceholder.tsx` — Currently at `#form` section in page.tsx, to be replaced with actual form
- `components/Reveal.tsx` — Scroll-triggered fade-in animation, used by all sections
- `lib/utils.ts` — `cn()` utility for class merging (available for conditional styles)
- `hooks/use-in-view.ts` — Intersection observer hook (used by Reveal)

### Established Patterns
- Section pattern: `bg-background px-4 py-16 sm:py-24 scroll-mt-16` with `Reveal` wrapper
- shadcn/ui components installed: `button`, `card`, `dialog`, `separator`, `skeleton`
- Client components use `"use client"` directive where needed
- CSS variables for theming with light/dark mode via `.dark` class

### Integration Points
- `app/page.tsx` — `FormPlaceholder` needs replacement by the new RegistrationForm component
- No form/input shadcn components exist yet — needs `input`, `label`, `form` or custom equivalents
- React context to be created for form data — consumed by Phase 3 payment and sheets logic
- `components/ui/` directory available for any new shadcn components

</code_context>

<specifics>
## Specific Ideas

- Card-based visual grouping with warm red/gold aesthetic matching Phase 1 design system
- Clean, elegant form that feels consistent with the supper club brand

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 2-Registration Form*
*Context gathered: 2026-07-04*
