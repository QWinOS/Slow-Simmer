---
phase: 03-payment-sheets-email
plan: 02
subsystem: api
tags: razorpay, nextjs, route-handlers, webhooks, payment, sheets, brevo

requires:
  - phase: 03-01
    provides: RazorPay SDK helpers (createOrder, verifyPaymentSignature, verifyWebhookSignature), Sheets write helpers (appendRegistrationRow, checkPaymentIdExists), Brevo email helper (sendConfirmationEmail)
provides:
  - POST /api/orders/create route handler — creates RazorPay order server-side
  - POST /api/orders/verify route handler — verifies client-side payment signature
  - POST /api/webhooks/razorpay route handler — processes payment.captured webhooks, appends to Sheets, sends Brevo email
affects: 03-03 (PaymentSection component consumes these routes)

tech-stack:
  added: []
  patterns:
    - Server route with try/catch error handling and NextResponse.json
    - Webhook handler: raw body via request.text(), HMAC verification, always-200 response
    - In-memory retry queue for transient Sheets write failures
    - Idempotency check via Payment ID before Sheets append

key-files:
  created:
    - app/api/orders/create/route.ts
    - app/api/orders/verify/route.ts
    - app/api/webhooks/razorpay/route.ts
  modified: []

key-decisions:
  - "Webhook handler uses RAZORPAY_WEBHOOK_SECRET for HMAC verification (not RAZORPAY_KEY_SECRET) — they are separate secrets per RESEARCH.md Pitfall 2"
  - "Raw body read via request.text() before any parsing (Pitfall 1) — re-stringifying would cause hash mismatch"
  - "Webhook returns 200 even on transient errors to prevent RazorPay exponential retries (Pitfall 5)"
  - "Brevo email sent fire-and-forget with .catch() — don't block webhook response on email failure"
  - "In-memory retry queue with max 5 retries for failed Sheets writes (D-07)"

patterns-established:
  - "Webhook handler pattern: raw body → signature verification → parse → idempotency check → process → always 200"
  - "Server route error handling: try/catch with err instanceof Error pattern from locations/route.ts"

requirements-completed:
  - PAY-01
  - PAY-02
  - SHEET-01
  - NOTF-01

coverage:
  - id: D1
    description: POST /api/orders/create creates a RazorPay order and returns orderId, amount, currency
    requirement: PAY-01
    verification:
      - kind: manual_procedural
        ref: "app/api/orders/create/route.ts — POST handler validates amount > 0, calls createOrder from lib/razorpay.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: POST /api/orders/verify validates client-side HMAC payment signature
    requirement: PAY-02
    verification:
      - kind: manual_procedural
        ref: "app/api/orders/verify/route.ts — POST handler validates fields, calls verifyPaymentSignature, returns { verified, paymentId }"
        status: pass
    human_judgment: false
  - id: D3
    description: POST /api/webhooks/razorpay processes payment.captured events — verifies signature, checks idempotency, appends to Sheets, sends email, returns 200
    requirement: SHEET-01
    verification:
      - kind: manual_procedural
        ref: "app/api/webhooks/razorpay/route.ts — HMAC verification via raw body, idempotency via checkPaymentIdExists, Sheets append via appendRegistrationRow, Brevo email via sendConfirmationEmail, in-memory retry queue with 5 retry limit, always-200 response"
        status: pass
    human_judgment: false
  - id: D4
    description: Brevo confirmation email sent on successful payment.captured webhook
    requirement: NOTF-01
    verification:
      - kind: manual_procedural
        ref: "app/api/webhooks/razorpay/route.ts — sendConfirmationEmail called fire-and-forget in webhook handler"
        status: pass
    human_judgment: false

duration: ~3min
completed: 2026-07-12
status: complete
---

# Phase 3 Plan 02: Server Routes for Order Creation, Payment Verification, and Webhook Processing

**Three API route handlers completing the server-side payment flow — order creation via RazorPay SDK, payment signature verification, and webhook processing with Sheets append and Brevo email dispatch**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-07-12T~02:00:00Z
- **Completed:** 2026-07-12T~02:03:00Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- **POST /api/orders/create** — Server-side RazorPay order creation using `createOrder` from lib/razorpay. Validates amount > 0, returns `orderId`, `amount`, `currency`. Called by PaymentSection component to obtain an order ID for the client-side checkout modal. (PAY-01)
- **POST /api/orders/verify** — Server-side HMAC payment signature verification using `verifyPaymentSignature` from lib/razorpay with `RAZORPAY_KEY_SECRET`. Validates all three required fields, provides immediate UI feedback before the webhook arrival. (PAY-02)
- **POST /api/webhooks/razorpay** — Sole source of truth for payment confirmation. Reads raw body via `request.text()`, verifies HMAC-SHA256 signature using `RAZORPAY_WEBHOOK_SECRET`, performs idempotency check via Payment ID, appends registration data to Google Sheets (SHEET-01), sends Brevo confirmation email fire-and-forget (NOTF-01), and implements an in-memory retry queue for transient Sheets write failures with max 5 retries (D-07). Always returns 200 to prevent RazorPay exponential retries.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create POST /api/orders/create route handler** — `d4b7969` (feat)
2. **Task 2: Create POST /api/orders/verify route handler** — `483c3b7` (feat)
3. **Task 3: Create POST /api/webhooks/razorpay route handler** — `0261549` (feat)

## Files Created

- `app/api/orders/create/route.ts` — POST handler: validates amount, calls createOrder, returns orderId
- `app/api/orders/verify/route.ts` — POST handler: validates fields, calls verifyPaymentSignature, returns verified status
- `app/api/webhooks/razorpay/route.ts` — POST handler: raw body HMAC verification, idempotency, Sheets append, Brevo email, in-memory retry queue, always-200

## Decisions Made

None — plan executed exactly as written. All patterns followed from RESEARCH.md and PATTERNS.md.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all three routes compiled without TypeScript errors on first attempt.

## Next Phase Readiness

- All three API routes are complete and compiling
- Ready for Plan 03-03 (PaymentSection component) which will consume `/api/orders/create` and `/api/orders/verify`
- The webhook endpoint at `POST /api/webhooks/razorpay` is ready to receive RazorPay webhook callbacks
- Note: `.env.local` must be configured with `RAZORPAY_WEBHOOK_SECRET` before webhooks will work
- Webhook URL must be registered in RazorPay Dashboard pointing to `https://<domain>/api/webhooks/razorpay`

---

*Phase: 03-payment-sheets-email*
*Completed: 2026-07-12*
