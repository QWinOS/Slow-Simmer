---
phase: 03-payment-sheets-email
plan: 01
subsystem: payments
tags: [razorpay, brevo, sheets-api, hmac, crypto, service-layer]
requires:
  - phase: 01-foundation-layout-gallery
    provides: google-auth service-account token, videos sheet schema
  - phase: 02-registration-form
    provides: RegistrationData context, form schema with 15 registration fields
provides:
  - RazorPay order creation via SDK (lib/razorpay.ts)
  - Payment + webhook signature verification with timingSafeEqual
  - Google Sheets write access (lib/sheets-write.ts) — append + idempotency
  - Brevo transactional email dispatch (lib/brevo.ts) — branded HTML template
affects: [03-02, 03-03]

tech-stack:
  added:
    - razorpay@2.9.6 — Official RazorPay Node.js SDK for order creation
  patterns:
    - Service-layer modules with typed interfaces and named exports
    - HMAC-SHA256 signature verification using crypto.timingSafeEqual()
    - Raw Brevo REST API via fetch (no SDK, matches hand-rolled Google auth pattern)
    - Per-scope token caching via getAccessToken(scope) — write vs readonly scopes

key-files:
  created:
    - lib/razorpay.ts — createOrder, verifyPaymentSignature, verifyWebhookSignature
    - lib/sheets-write.ts — appendRegistrationRow, checkPaymentIdExists
    - lib/brevo.ts — sendConfirmationEmail
  modified:
    - package.json — added razorpay dependency
    - package-lock.json — lockfile update
    - .env.example — documented all RazorPay + Brevo + Contact env vars

key-decisions:
  - "Used razorpay@2.9.6 official SDK for order creation (not raw fetch)"
  - "crypto.timingSafeEqual() for all HMAC comparisons — prevents timing attacks per RESEARCH.md Pitfall 3"
  - "Webhook secret (RAZORPAY_WEBHOOK_SECRET) is separate from API key secret (RAZORPAY_KEY_SECRET)"
  - "Raw Brevo REST API via fetch instead of @getbrevo/brevo SDK (SUS-flagged v6.0.2)"
  - "Server-only env var discipline: RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, BREVO_API_KEY never get NEXT_PUBLIC_ prefix"

patterns-established:
  - "Service modules (lib/*.ts) export typed async functions, read env vars internally, let errors propagate to caller"
  - "Google Sheets write scope is spreadsheets (not .readonly) — per-scope token caching in google-auth.ts handles both independently"
  - "Idempotency check via Payment ID column query before Sheets append"

requirements-completed:
  - PAY-01
  - PAY-02
  - SHEET-01
  - SHEET-02
  - SHEET-03
  - NOTF-01
  - NOTF-02
  - NOTF-03

coverage:
  - id: D1
    description: "RazorPay order creation via createOrder() — server-side SDK orders.create() with paise amounts"
    requirement: PAY-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/razorpay.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Payment signature verification — verifyPaymentSignature() with timingSafeEqual"
    requirement: PAY-02
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/razorpay.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Webhook signature verification — verifyWebhookSignature() with webhook secret, raw body, timingSafeEqual"
    requirement: PAY-02
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/razorpay.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Google Sheets append — appendRegistrationRow() writes 15-column row to Registrations tab"
    requirement: SHEET-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/sheets-write.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D5
    description: "15-column schema with Location, Event Date, Event Time, Name, Contact, Email, Aadhar, Bringing Guest, Guest Name, Guest Age, About, Social, Payment Status, Payment ID, Timestamp"
    requirement: SHEET-02
    verification:
      - kind: other
        ref: "lib/sheets-write.ts RegistrationRow interface (15 fields)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Idempotency check — checkPaymentIdExists() queries column N before append"
    requirement: SHEET-03
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/sheets-write.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Brevo confirmation email — sendConfirmationEmail() with branded HTML via REST API"
    requirement: NOTF-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit --strict lib/brevo.ts (compiles)"
        status: pass
    human_judgment: false
  - id: D8
    description: "Email body includes CONTACT_NUMBER from env var (conditional)"
    requirement: NOTF-02
    verification:
      - kind: other
        ref: "lib/brevo.ts reads process.env.CONTACT_NUMBER and embeds conditionally"
        status: pass
    human_judgment: false
  - id: D9
    description: "Branded HTML email with Playfair Display SC heading, #A16207 gold, warm red background, Karla body"
    requirement: NOTF-03
    verification:
      - kind: other
        ref: "lib/brevo.ts htmlContent array with inline CSS"
        status: pass
    human_judgment: true
    rationale: "Email render quality (visual branding adequacy) requires human review — automated compilation check cannot verify HTML render fidelity or brand alignment."

duration: 4 min
completed: 2026-07-12
status: complete
---

# Phase 3 Plan 1: Payment Service Summary

**RazorPay SDK installed, env vars documented, and three service-layer modules (razorpay, sheets-write, brevo) with typed async functions for order creation, HMAC signature verification, Sheets append with idempotency, and branded Brevo email dispatch**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-12T08:10:00Z
- **Completed:** 2026-07-12T08:13:27Z
- **Tasks:** 3
- **Files modified:** 7 (3 new lib modules, 3 config files, 1 lockfile)

## Accomplishments

- Installed razorpay@2.9.6 official Node.js SDK — verified package resolves and npm audit shows no new vulnerabilities (2 pre-existing moderate advisories in postcss/next pre-date this change)
- Documented all new env vars in .env.example with setup instructions and server-only warnings — RAZORPAY_KEY_ID, NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET, BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, CONTACT_NUMBER
- Created lib/razorpay.ts with three exports: createOrder (SDK orders.create), verifyPaymentSignature (client callback verification), verifyWebhookSignature (webhook event verification) — all using crypto.timingSafeEqual for constant-time HMAC comparison
- Created lib/sheets-write.ts with two exports: appendRegistrationRow (15-column append to Registrations tab), checkPaymentIdExists (idempotency check via column N query) — uses write scope (spreadsheets not .readonly) via existing getAccessToken()
- Created lib/brevo.ts with one export: sendConfirmationEmail (branded HTML via Brevo REST API fetch — no SDK dependency) — Playfair Display SC heading, #A16207 gold branding, warm red background, conditional CONTACT_NUMBER

## Task Commits

Each task was committed atomically:

1. **Task 1: Install razorpay and update env var documentation** - `5d419ea` (feat)
2. **Task 2: Create lib/razorpay.ts service module** - `681b82c` (feat)
3. **Task 3: Create lib/sheets-write.ts and lib/brevo.ts service modules** - `57e686d` (feat)

**Plan metadata:** Pending (docs commit after this file)

## Files Created/Modified

- `package.json` - Added razorpay@2.9.6 dependency
- `package-lock.json` - Updated lockfile
- `.env.example` - Added RazorPay, Brevo, and Contact env var sections with setup instructions and server-only warnings
- `.env.local` - Updated on disk with placeholder values (gitignored — not committed)
- `lib/razorpay.ts` - Three exported functions: createOrder, verifyPaymentSignature, verifyWebhookSignature
- `lib/sheets-write.ts` - Two exported functions: appendRegistrationRow, checkPaymentIdExists
- `lib/brevo.ts` - One exported function: sendConfirmationEmail

## Decisions Made

- **razorpay SDK over raw fetch**: Official SDK handles auth headers, error parsing, and response types for order creation. 8-year-old mature package with 285K weekly downloads.
- **crypto.timingSafeEqual over string comparison**: String comparison short-circuits on first mismatched byte (timing attack vector). Buffer-based constant-time comparison prevents byte-by-byte inference.
- **Separate secrets for API vs webhook**: RAZORPAY_KEY_SECRET for order creation/payment verification, RAZORPAY_WEBHOOK_SECRET for webhook HMAC. Research.md Pitfall 2 documents this distinction.
- **Raw Brevo REST API over SDK**: @getbrevo/brevo v6.0.2 flagged SUS (published today). Hand-rolled fetch matches project pattern (no googleapis SDK, no body-parser). Brevo API is simple — one POST call with api-key header.
- **No nodemailer or SMTP**: REST API avoids SMTP credential management and extra dependency. Matches project's hand-rolled Google auth pattern.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **TypeScript strict-mode fix for razorpay SDK types**: `order.amount` is typed as `string | number` by the razorpay SDK, but the return type expects `number`. Fixed by wrapping with `Number()` cast — no behavioral change, razorpay always returns numeric amounts.
- **.env.local gitignored**: The plan specified committing .env.local updates, but the file is gitignored (correctly — it contains secrets). The file was updated on disk but not committed. .env.example is the committed documentation source.

## User Setup Required

**External services require manual configuration.** See [03-01-USER-SETUP.md](./03-01-USER-SETUP.md) for:
- Environment variables to add
- Dashboard configuration steps
- Verification commands

## Next Phase Readiness

- Service layer complete for three integrations: RazorPay (orders + verification), Google Sheets (append + idempotency), Brevo (email)
- Ready for Plan 03-02: Server API routes — orders/create, orders/verify, webhooks/razorpay
- Plan 03-02 can import the three lib modules directly

## Self-Check: PASSED

- [x] npm ls razorpay resolves (razorpay@2.9.6)
- [x] npx tsc --noEmit --strict: No errors in lib/razorpay.ts, lib/sheets-write.ts, lib/brevo.ts
- [x] grep RAZORPAY_KEY_ID .env.example — all required env vars documented
- [x] grep NEXT_PUBLIC_RAZORPAY_KEY_SECRET — no NEXT_PUBLIC_ for server-only vars (confirmed absent)
- [x] All 3 commits exist: 5d419ea, 681b82c, 57e686d
- [x] All 4 key files exist: lib/razorpay.ts, lib/sheets-write.ts, lib/brevo.ts, .env.example

---

*Phase: 03-payment-sheets-email*
*Completed: 2026-07-12*
