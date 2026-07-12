# Phase 3: Payment, Sheets & Email - Context

**Gathered:** 2026-07-12
**Status:** Ready for planning

<domain>
## Phase Boundary

After the guest submits the registration form (Phase 2), they see a payment section with a summary card and RazorPay checkout. On successful payment via RazorPay webhook, registration data is appended to a Google Sheet. A Brevo thank-you email is sent immediately to the guest. On failure, the guest is redirected back to the form.

</domain>

<decisions>
## Implementation Decisions

### Payment Provider & Flow
- **D-01:** Use RazorPay Order API (not PhonePe). Create order server-side; client opens RazorPay checkout modal.
- **D-02:** Webhook-based confirmation — RazorPay calls server endpoint on `payment.captured` event. Signature verified before writing to Sheets.
- **D-03:** On payment failure, show failure message and redirect guest back to the registration form section to review/resubmit.

### Google Sheets Write
- **D-04:** Write to the same spreadsheet as videos/locations (same `VIDEOS_SHEET_ID`), in a new sheet tab named `Registrations`.
- **D-05:** Full schema per row: Location, Event Date, Event Time, Name, Contact, Email, Aadhar, Bringing Guest, Guest Name, Guest Age, About, Social, Payment Status, Payment ID, Timestamp.
- **D-06:** Idempotency check via Payment ID — before appending, check if Payment ID already exists in the sheet to guard against duplicate webhook callbacks.
- **D-07:** On Sheets API failure, queue the failed write in memory and retry on the next request.

### Brevo Email
- **D-08:** Sent immediately on webhook confirmation (not batched).
- **D-09:** Full event details: subject "You're registered for Slow Simmer!", body includes event location, date, time, guest name, and a contact number from env var for queries.
- **D-10:** Configured via env vars: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `CONTACT_NUMBER`.

### Payment Section UI
- **D-11:** Before form submit — show a placeholder message: "Fill the registration form above to proceed to payment."
- **D-12:** After form submit — show a summary card (location, date, time, guest name) with a "Pay via RazorPay" button that opens RazorPay checkout modal.
- **D-13:** Three status states: (1) Awaiting — while RazorPay modal is open / payment processing; (2) Success — green card with checkmark + "Registration confirmed! Check your email."; (3) Failure — red card with "Payment failed" + link back to form.
- **D-14:** Amount varies by location — add a `Price` column to the `Location_Date` sheet (value in paise for RazorPay).

### Location Data Source (from earlier discussion)
- **D-15:** Event locations fetched dynamically from Google Sheet `Location_Date` tab — columns: Location, Date, Time, Price.
- **D-16:** Location value stored includes `eventDate` and `eventTime` in RegistrationData for downstream use.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Overall project vision, constraints, and key decisions
- `.planning/STATE.md` — Current phase and progress tracking

### Phase Structure
- `.planning/ROADMAP.md` — Phase 3 success criteria, dependencies, requirements (PAY-01 through PAY-03, SHEET-01 through SHEET-03, NOTF-01 through NOTF-03)

### Prior Phase Context
- `.planning/phases/02-registration-form/02-CONTEXT.md` — D-15 (form data in context), D-16 (sheets write after payment), D-18 (auto-scroll to payment)
- `.planning/phases/01-foundation-layout-gallery/01-CONTEXT.md` — Design system tokens, section pattern

### Existing Code
- `lib/google-auth.ts` — Shared service account auth (reuse for Sheets write)
- `lib/locations.ts` — Location fetch from Sheets (Location_Date tab with Price column)
- `app/api/locations/route.ts` — Server route for fetching locations (add Price column D)
- `components/RegistrationProvider.tsx` — RegistrationData includes location, eventDate, eventTime
- `components/PaymentPlaceholder.tsx` — Currently empty placeholder at `#payment`, to be replaced

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/google-auth.ts` — Service account JWT auth already extracted; reuse for Sheets write scope (`https://www.googleapis.com/auth/spreadsheets`)
- `components/PaymentPlaceholder.tsx` — Empty placeholder at `#payment` section, to be replaced with full payment UI
- `components/RegistrationProvider.tsx` — RegistrationData context with location, eventDate, eventTime fields added
- `components/ui/card` — Existing card component for summary display
- `components/ui/button` — Existing button for RazorPay checkout trigger

### Established Patterns
- Server API routes in `app/api/*` with `getAccessToken(scope)` for Google auth
- Client fetch pattern in `lib/*.ts` (see `lib/locations.ts`, `lib/drive.ts`, `lib/sheets.ts`)
- Section pattern: `bg-background px-4 py-16 sm:py-24 scroll-mt-16` with `Reveal` wrapper
- shadcn/ui components installed: button, card, select, dialog, separator, skeleton

### Integration Points
- `app/page.tsx` — `PaymentPlaceholder` at `#payment` section to be replaced
- `components/RegistrationForm.tsx` — `onSubmit` calls `setRegistrationData()` then auto-scrolls to `#payment`
- `lib/google-auth.ts` — Need to add `spreadsheets` scope for write access (currently readonly scope for videos)
- `app/api/gallery/[id]/route.ts` — Pattern for streaming content; not directly related but shows server route pattern

</code_context>

<specifics>
## Specific Ideas

- RazorPay checkout modal (not inline form) — standard drop-in UX
- Summary card with event details builds trust before payment
- Full audit trail in Sheets for manual review

</specifics>

<deferred>
None — discussion stayed within phase scope.

</deferred>

---

*Phase: 3-Payment, Sheets & Email*
*Context gathered: 2026-07-12*
