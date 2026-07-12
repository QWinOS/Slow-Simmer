# Phase 3: Payment, Sheets & Email - Research

**Researched:** 2026-07-12
**Domain:** Payment processing (RazorPay), Google Sheets API write, transactional email (Brevo), webhook signature verification
**Confidence:** HIGH

## Summary

Phase 3 completes the registration-to-confirmation flow. After the guest submits the registration form (Phase 2), they see a payment section with a summary card and RazorPay Checkout modal. On successful payment (verified via webhook), registration data is written to Google Sheets (Registrations tab) and a Brevo transactional email is sent. The flow is: form submit → summary card → RazorPay order (server) → Checkout modal (client) → webhook callback (server) → Sheets append + email send.

**Primary recommendation:** Use **`razorpay` 2.9.6** official SDK for server-side order creation. Use **Node.js `crypto`** (built-in) for HMAC-SHA256 webhook signature verification — no Express body-parser needed; Next.js App Router's `req.text()` provides raw body. Call the **Brevo REST API directly** via `fetch` (no SDK — matches the project's hand-rolled Google auth pattern). Extend the existing `getAccessToken()` with the `spreadsheets` scope for Sheets write. The `PaymentSection` component replaces `PaymentPlaceholder.tsx` with three states (awaiting/success/failure).

**Architecture is Express.js-free** — the webhook handler at `app/api/webhooks/razorpay/route.ts` uses `req.text()` for raw body, then `crypto.createHmac('sha256', secret).update(body).digest('hex')` for signature verification.

**Critical gotchas to plan around:**
1. RazorPay webhook signature requires the **raw request body** — `req.text()`, never `req.json()`
2. Webhook secret is a separate configuration from the API key secret — use `RAZORPAY_WEBHOOK_SECRET`
3. `@getbrevo/brevo` v6.0.2 was flagged `[SUS]` due to a today publish date — use raw REST API instead
4. Sheets API write scope is `https://www.googleapis.com/auth/spreadsheets` (current code uses `.readonly`)
5. Idempotency check must come BEFORE the Sheets append — query the Registrations tab for existing Payment ID

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Payment Provider & Flow
- **D-01:** Use RazorPay Order API (not PhonePe). Create order server-side; client opens RazorPay checkout modal.
- **D-02:** Webhook-based confirmation — RazorPay calls server endpoint on `payment.captured` event. Signature verified before writing to Sheets.
- **D-03:** On payment failure, show failure message and redirect guest back to the registration form section to review/resubmit.

#### Google Sheets Write
- **D-04:** Write to the same spreadsheet as videos/locations (same `VIDEOS_SHEET_ID`), in a new sheet tab named `Registrations`.
- **D-05:** Full schema per row: Location, Event Date, Event Time, Name, Contact, Email, Aadhar, Bringing Guest, Guest Name, Guest Age, About, Social, Payment Status, Payment ID, Timestamp.
- **D-06:** Idempotency check via Payment ID — before appending, check if Payment ID already exists in the sheet to guard against duplicate webhook callbacks.
- **D-07:** On Sheets API failure, queue the failed write in memory and retry on the next request.

#### Brevo Email
- **D-08:** Sent immediately on webhook confirmation (not batched).
- **D-09:** Full event details: subject "You're registered for Slow Simmer!", body includes event location, date, time, guest name, and a contact number from env var for queries.
- **D-10:** Configured via env vars: `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `CONTACT_NUMBER`.

#### Payment Section UI
- **D-11:** Before form submit — show a placeholder message: "Fill the registration form above to proceed to payment."
- **D-12:** After form submit — show a summary card (location, date, time, guest name) with a "Pay via RazorPay" button that opens RazorPay checkout modal.
- **D-13:** Three status states: (1) Awaiting — while RazorPay modal is open / payment processing; (2) Success — green card with checkmark + "Registration confirmed! Check your email."; (3) Failure — red card with "Payment failed" + link back to form.
- **D-14:** Amount varies by location — add a `Price` column to the `Location_Date` sheet (value in paise for RazorPay).

#### Location Data Source
- **D-15:** Event locations fetched dynamically from Google Sheet `Location_Date` tab — columns: Location, Date, Time, Price.
- **D-16:** Location value stored includes `eventDate` and `eventTime` in RegistrationData for downstream use.

### the agent's Discretion
No areas delegated to agent discretion.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAY-01 | RazorPay Order API creates order server-side; client opens RazorPay checkout modal | `razorpay` SDK `orders.create()` — see Code Examples |
| PAY-02 | Payment confirmation is verified (webhook or polling) | Webhook handler with HMAC-SHA256 signature verification — see Code Examples |
| PAY-03 | User sees success/failure feedback after payment | `PaymentSection` component with 3 states (awaiting/success/failure) — see Code Examples |
| SHEET-01 | On successful payment, guest details are inserted into Google Sheets | `getAccessToken(spreadsheets scope)` + Sheets API `values.append` — see Code Examples |
| SHEET-02 | Google Sheet columns include: name, contact, email, guest name & age, about, social links, aadhar, payment status, timestamp | D-05 schema: 15-column row appended to `Registrations` tab |
| SHEET-03 | Duplicate submissions (same email/contact) are handled gracefully | Idempotency check via Payment ID before append — D-06 |
| NOTF-01 | On successful payment, send a thank-you email via Brevo API | Brevo REST API `POST /v3/smtp/email` — see Code Examples |
| NOTF-02 | Email body includes contact number fetched from env var | `CONTACT_NUMBER` env var — D-10 |
| NOTF-03 | Email uses inline HTML with supper club branding | `htmlContent` field in Brevo API call — see Code Examples |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| RazorPay order creation | API / Backend | — | Order creation requires `key_secret` — never expose to client. Server route at `app/api/orders/create/route.ts` |
| RazorPay checkout modal | Browser / Client | — | RazorPay's `checkout.js` SDK runs in the browser. Client component loads Script, opens modal with `order_id` |
| Payment signature verification | API / Backend | — | Client sends `razorpay_payment_id` + `razorpay_signature` to server for HMAC verification against `key_secret` |
| Webhook event processing | API / Backend | — | RazorPay calls public endpoint. Never trust client-reported payment status alone |
| Google Sheets append | API / Backend | — | `getAccessToken()` runs server-side only — private key must not reach browser bundle |
| Brevo email send | API / Backend | Database / Storage | Email triggered from webhook handler. No client involvement |
| Payment status UI | Browser / Client | — | React state tracks `idle` → `processing` → `success` / `failure` based on client-side verification callback + fallback |
| Idempotency check | API / Backend | Database / Storage | Query existing Payment IDs from Sheets before append |
| Retry queue (failed Sheets write) | API / Backend | — | In-memory Map<string, RegistrationData> in webhook handler; retry on next webhook call |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| razorpay | 2.9.6 | RazorPay payment processing — order creation, payment verification | Official Node.js SDK from RazorPay; MIT license; 8+ years on npm; 285K+ weekly downloads [VERIFIED: npm registry] |
| crypto | built-in (Node.js) | HMAC-SHA256 webhook signature verification | Node.js built-in; no install needed; the correct tool for RazorPay's HMAC hex verification |
| crypto | built-in (Node.js) | Payment signature verification (`crypto.createHmac`) | Same built-in; verifies the `razorpay_payment_id|razorpay_order_id` HMAC returned from frontend |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @getbrevo/brevo (SKIPPED) | — | Brevo transactional email SDK | **Not recommended** — v6.0.2 flagged `[SUS]` (too-new). Use raw Brevo REST API with fetch instead, matching project pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `razorpay` npm package | Raw `fetch` to RazorPay Orders API | Both valid. The npm package is the official SDK and handles auth headers and errors. Raw fetch avoids one dependency but needs manual auth handling. Recommend the SDK for safety. |
| `@getbrevo/brevo` SDK | Raw Brevo REST API `POST /v3/smtp/email` | SDK is SUS-flagged. Raw fetch matches project pattern (hand-rolled Google auth, hand-rolled sheets requests). Brevo API is simple enough — just `api-key` header + JSON body. |
| `nodemailer` + SMTP | Brevo REST API | SMTP relay is another option but requires SMTP credentials (different from API key) and nodemailer install. REST API is simpler: one POST call. |
| Manual `crypto` HMAC | `razorpay` SDK's `validateWebhookSignature()` | The razorpay SDK provides `Razorpay.validateWebhookSignature(body, signature, secret)` but it requires the raw body string. Same work as hand-rolled crypto HMAC — either approach works. Hand-rolled is preferred to avoid SDK dependency version issues with raw body handling. |

**Installation:**
```bash
# Only extra npm package needed
npm install razorpay

# No Brevo SDK — use raw fetch
# No extra crypto — built-in
```

**Version verification:**
```bash
npm view razorpay version           # 2.9.6 [VERIFIED]
# crypto is built-in Node.js module
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| razorpay | npm | ~8 yrs (since 2016-09) | ~285K/wk | github.com/razorpay/razorpay-node | OK | Approved |
| @getbrevo/brevo | npm | ~3 yrs (since 2023-06) | ~216K/wk | github.com/getbrevo/brevo-node | SUS (too-new: v6.0.2 published today) | Flagged — do NOT use; use raw Brevo REST API instead |

**Packages removed due to [SLOP] verdict:** None
**Packages flagged as suspicious [SUS]:** `@getbrevo/brevo` — the v6.0.2 was published on 2026-07-12 (today) triggering a freshness gate. The SDK itself has existed since 2023 with 216K weekly downloads and official Brevo maintainers. However, to match the project's hand-rolled API pattern (no googleapis SDK, no body-parser), use raw `fetch` to call the Brevo REST API directly. This avoids any package concern entirely.

**Recommended: No new npm packages for Brevo.** Call `POST https://api.brevo.com/v3/smtp/email` with `api-key` header via `fetch`.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  Phase 3 Data Flow                                                              │
│                                                                                 │
│  ┌──────────────────┐     Form Submit      ┌───────────────────────────────┐   │
│  │ RegistrationForm  │ ──────────────────►  │ RegistrationProvider (ctx)    │   │
│  │ (Phase 2)         │                     │  { name, contact, email,      │   │
│  └──────────────────┘                     │    location, eventDate,       │   │
│               │                            │    eventTime, price, ... }    │   │
│               ▼                            └──────────────┬────────────────┘   │
│  ┌──────────────────────────────┐                         │                    │
│  │  PaymentSection (Client)     │◄────────────────────────┘                    │
│  │                              │   reads RegistrationData from context        │
│  │  ┌─ Summary Card ─────────┐ │                                               │
│  │  │ Location, Date, Time   │ │                                               │
│  │  │ Guest Name, Amount     │ │                                               │
│  │  │ [Pay via RazorPay]    │ │                                               │
│  │  └───────────┬────────────┘ │                                               │
│  └──────────────┼──────────────┘                                               │
│                 │                                                              │
│        ① POST /api/orders/create    ← { amount }                              │
│        ② Response: { order_id }                                                │
│        ③ Opens RazorPay Checkout modal (checkout.js)                          │
│        ④ User completes payment in modal                                      │
│        ⑤ RazorPay calls handler with { payment_id, order_id, signature }       │
│        ⑥ Client calls POST /api/orders/verify                                 │
│           → crypto.createHmac('sha256', key_secret)                            │
│             .update(order_id + '|' + payment_id).digest('hex')                 │
│           → compares with signature                                            │
│        ⑦ If verified → show success state                                     │
│           If failed → show failure state + link back to form                   │
│                                                                                │
│  ┌──────────────────────┐      ⑧ webhook         ┌────────────────────────┐   │
│  │  RazorPay            │ ───────────────────►    │  POST /api/webhooks/   │   │
│  │  (payment.captured)  │   X-Razorpay-Signature  │  razorpay/route.ts     │   │
│  └──────────────────────┘                        │                        │   │
│                                                    │  1. req.text() raw body│   │
│                                                    │  2. crypto HMAC verify  │   │
│                                                    │  3. Parse event JSON    │   │
│                                                    │  4. Idempotency check   │   │
│                                                    │     (query Sheets for   │   │
│                                                    │      Payment ID)        │   │
│                                                    │  5. Sheets.append       │   │
│                                                    │     (Registrations tab) │   │
│                                                    │  6. Brevo send email    │   │
│                                                    │     (POST /v3/smtp/    │   │
│                                                    │      email via fetch)   │   │
│                                                    └───────────┬────────────┘   │
│                                                                │                │
│                          Sheets API (write)                    │                │
│                          scope: spreadsheets                   │                │
│                          ┌────────────────────┐                │                │
│                          │  Google Sheets      │◄───────────────┘                │
│                          │  VIDEOS_SHEET_ID    │                                │
│                          │  Registrations tab  │                                │
│                          │  Row: 15 columns    │                                │
│                          └────────────────────┘                                │
│                                                                                 │
│                          Brevo REST API (fetch)                                 │
│                          ┌────────────────────┐                                │
│                          │  Brevo Email        │◄──────────────────────────────┘
│                          │  POST /v3/smtp/    │                                │
│                          │  email              │                                │
│                          │  api-key header     │                                │
│                          └────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure
```
app/api/
├── orders/
│   ├── create/
│   │   └── route.ts           # POST — creates RazorPay order, returns order_id
│   └── verify/
│       └── route.ts           # POST — verifies payment signature (client callback)
├── webhooks/
│   └── razorpay/
│       └── route.ts           # POST — webhook handler: verify, Sheets append, email send
└── ... (existing routes unchanged)

components/
├── PaymentSection.tsx          # Replaces PaymentPlaceholder — 3 states
└── ... (existing components unchanged)

lib/
├── google-auth.ts              # Already exists — add spreadsheets scope
├── sheets.ts                   # (optional) Shared Sheets append helper
├── brevo.ts                    # Brevo REST API wrapper (hand-rolled fetch)
└── razorpay.ts                 # (optional) RazorPay helpers
```

### Pattern 1: RazorPay Order Creation (Server Route)

**What:** Server-side order creation using the `razorpay` SDK. The client POSTs the amount (in paise), the server creates an order via RazorPay's Orders API, and returns the `order_id` to the client.

**When to use:** Always create orders server-side. Never expose `key_secret` to the browser. D-01 mandates this.

**Example:**
```typescript
// Source: RazorPay official Node.js SDK docs (razorpay.com/docs/api/orders/create)
// app/api/orders/create/route.ts
import Razorpay from "razorpay"
import { NextResponse } from "next/server"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { amount } = (await request.json()) as { amount: number }

    const options = {
      amount,           // in paise (e.g., 50000 = INR 500)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({ orderId: order.id, amount: order.amount })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

### Pattern 2: RazorPay Checkout Modal (Client)

**What:** After getting an `order_id` from the server, load the RazorPay checkout script and open the modal with the order details. On completion, verify the payment signature on the server.

**When to use:** Every payment flow. The `checkout.js` script must be loaded globally or dynamically.

**Example:**
```typescript
// Source: RazorPay Standard Checkout docs (razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
// Inside PaymentSection.tsx ("use client")

// Load RazorPay checkout script — use Script from next/script or dynamic import
// Option A: Add to layout.tsx once
// <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />

// Option B: Dynamic load in component
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve()
      return
    }
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve()
    document.body.appendChild(script)
  })
}

async function handlePayment(amount: number, registration: RegistrationData) {
  // 1. Create order on server
  const res = await fetch("/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  })
  const { orderId } = await res.json()

  // 2. Load checkout script
  await loadRazorpayScript()

  // 3. Open RazorPay checkout modal
  const options = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount,
    currency: "INR",
    name: "Slow Simmer",
    description: `${registration.location} — ${registration.eventDate}`,
    order_id: orderId,
    prefill: {
      name: registration.name,
      email: registration.email,
      contact: registration.contact,
    },
    theme: { color: "#A16207" }, // matches brand gold
    handler: async function (response: {
      razorpay_payment_id: string
      razorpay_order_id: string
      razorpay_signature: string
    }) {
      // 4. Verify payment on server
      const verifyRes = await fetch("/api/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })

      if (verifyRes.ok) {
        // Show success state
        setStatus("success")
        setPaymentId(response.razorpay_payment_id)
      } else {
        // Show failure state
        setStatus("failure")
      }
    },
    modal: {
      ondismiss: function () {
        // User closed modal without paying
        setStatus("idle")
      },
    },
  }

  const rzp = new window.Razorpay(options)
  rzp.on("payment.failed", function () {
    setStatus("failure")
  })
  rzp.open()
  setStatus("awaiting") // RazorPay modal is open
}
```

### Pattern 3: Payment Signature Verification (Server Route)

**What:** The client calls this endpoint after a successful RazorPay checkout to verify the payment signature. Uses Node.js crypto HMAC-SHA256.

**When to use:** After every successful client-side RazorPay payment callback. This is the first line of defense — do NOT skip it just because the webhook also verifies.

**Example:**
```typescript
// Source: RazorPay signature verification docs (razorpay.com/docs/webhooks/validate-test/)
// app/api/orders/verify/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = (await request.json()) as {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }

    // HMAC-SHA256 of order_id|payment_id using key_secret
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      )
    }

    return NextResponse.json({ verified: true, paymentId: razorpay_payment_id })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

### Pattern 4: RazorPay Webhook Signature Verification (Raw Body — No Express)

**What:** The webhook handler that RazorPay calls on `payment.captured` events. Uses `req.text()` for raw body (not `req.json()`), then HMAC-SHA256 verification against the webhook secret. On success: Sheets append + Brevo email.

**When to use:** This is the **sole source of truth** for payment confirmation per D-02. The client-side `/verify` route is for UI feedback only.

**CRITICAL:** This route MUST NOT use `req.json()` before verifying the signature. The raw body bytes are hashed by RazorPay. If you parse → re-stringify, the hash changes and verification fails.

```typescript
// Source: RazorPay webhook validation docs + Next.js App Router raw body pattern
// app/api/webhooks/razorpay/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // 1. Read RAW body — this is CRITICAL for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    // 2. Verify webhook signature using webhook secret (NOT API key secret)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex")

    // Use timing-safe comparison
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // 3. Parse event after verification
    const event = JSON.parse(rawBody)

    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true }) // Acknowledge non-payment events silently
    }

    const payment = event.payload.payment.entity
    const paymentId = payment.id
    const notes = payment.notes || {}  // Registration data passed as notes during order creation

    // 4. Idempotency check: query Sheets for existing Payment ID
    //    (see Pattern 5 helper)
    const isDuplicate = await checkPaymentIdExists(paymentId)
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    // 5. Append to Google Sheets
    await appendToSheet({
      location: notes.location,
      eventDate: notes.eventDate,
      eventTime: notes.eventTime,
      name: notes.name,
      contact: notes.contact,
      email: notes.email,
      aadhar: notes.aadhar,
      bringingGuest: notes.bringingGuest,
      guestName: notes.guestName,
      guestAge: notes.guestAge,
      about: notes.about,
      social: notes.social,
      paymentStatus: "captured",
      paymentId,
      timestamp: new Date().toISOString(),
    })

    // 6. Send Brevo email
    await sendConfirmationEmail({
      email: notes.email,
      name: notes.name,
      location: notes.location,
      eventDate: notes.eventDate,
      eventTime: notes.eventTime,
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook handler error:", message)
    // Return 200 to acknowledge receipt (RazorPay retries non-200)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

### Pattern 5: Google Sheets Append (via Service Account)

**What:** Uses the existing `getAccessToken()` from `lib/google-auth.ts` with the `https://www.googleapis.com/auth/spreadsheets` scope (not `.readonly`). Calls the Sheets API `values.append` endpoint to add a row.

**When to use:** After webhook verification passes and idempotency check is clear.

**Key change:** Update `SHEETS_SCOPE` from `spreadsheets.readonly` to `spreadsheets` in the existing locations route, OR create a separate write helper with the write scope.

```typescript
// Source: Google Sheets API v4 docs — values.append
// lib/sheets.ts (new file)
import { getAccessToken } from "@/lib/google-auth"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

interface RegistrationRow {
  location: string
  eventDate: string
  eventTime: string
  name: string
  contact: string
  email: string
  aadhar: string
  bringingGuest: string  // "Yes" or "No"
  guestName: string
  guestAge: string
  about: string
  social: string
  paymentStatus: string
  paymentId: string
  timestamp: string
}

/**
 * Appends a registration row to the Registrations sheet tab.
 * Returns the updated spreadsheet response, or throws on failure.
 */
export async function appendRegistrationRow(row: RegistrationRow): Promise<void> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getAccessToken(SHEETS_SCOPE)

  const values = [[
    row.location,
    row.eventDate,
    row.eventTime,
    row.name,
    row.contact,
    row.email,
    row.aadhar,
    row.bringingGuest,
    row.guestName,
    row.guestAge,
    row.about,
    row.social,
    row.paymentStatus,
    row.paymentId,
    row.timestamp,
  ]]

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Registrations!A:O:append`,
  )
  url.searchParams.set("valueInputOption", "USER_ENTERED")
  url.searchParams.set("insertDataOption", "INSERT_ROWS")

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Sheets append failed: ${response.status} ${text}`)
  }
}

/**
 * Idempotency check — queries the Registrations tab for an existing Payment ID.
 * Returns true if the Payment ID already exists (duplicate webhook).
 */
export async function checkPaymentIdExists(paymentId: string): Promise<boolean> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getAccessToken(SHEETS_SCOPE)

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Registrations!N:N`,
  )

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return false // If we can't query, assume not duplicate to be safe

  const data = await response.json()
  const rows: string[][] = data.values || []

  // Skip header row, check all Payment ID values
  return rows.slice(1).some((row) => row[0]?.trim() === paymentId)
}
```

### Pattern 6: PaymentSection Component (3 States)

**What:** Replaces `PaymentPlaceholder.tsx` at `#payment`. Reads `RegistrationData` from context. Shows placeholder before form submit, summary card after submit, and three payment states.

**When to use:** The only client component for this phase. Manages all UI states.

```typescript
// components/PaymentSection.tsx
"use client"

import { useState } from "react"
import { useRegistration } from "@/components/RegistrationProvider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowLeft, Loader2 } from "lucide-react"

type PaymentStatus = "idle" | "awaiting" | "success" | "failure"

export function PaymentSection() {
  const { data } = useRegistration()
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [paymentId, setPaymentId] = useState<string | null>(null)

  // D-11: Before form submit — placeholder
  if (!data) {
    return (
      <section id="payment" className="bg-background px-4 py-16 sm:py-24 scroll-mt-16">
        <Card className="mx-auto max-w-lg text-center">
          <CardContent className="py-8">
            <p className="text-muted-foreground">
              Fill the registration form above to proceed to payment.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  // D-13: Success state
  if (status === "success") {
    return (
      <section id="payment" className="bg-background px-4 py-16 sm:py-24 scroll-mt-16">
        <Card className="mx-auto max-w-lg border-green-500/50">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="mx-auto size-12 text-green-500" />
            <CardTitle className="mt-4 text-green-700 dark:text-green-400">
              Registration confirmed!
            </CardTitle>
            <CardDescription className="mt-2">
              Check your email for event details.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
    )
  }

  // D-13: Failure state
  if (status === "failure") {
    return (
      <section id="payment" className="bg-background px-4 py-16 sm:py-24 scroll-mt-16">
        <Card className="mx-auto max-w-lg border-destructive/50">
          <CardContent className="py-8 text-center">
            <XCircle className="mx-auto size-12 text-destructive" />
            <CardTitle className="mt-4 text-destructive">
              Payment failed
            </CardTitle>
            <CardDescription className="mt-2">
              Your payment could not be processed.
            </CardDescription>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStatus("idle")
                document.getElementById("form")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to form
            </Button>
          </CardContent>
        </Card>
      </section>
    )
  }

  // D-12: Summary card + Pay button (idle or awaiting)
  return (
    <section id="payment" className="bg-background px-4 py-16 sm:py-24 scroll-mt-16">
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
          <CardDescription>
            Review your details and proceed to payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary details */}
          <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-medium">{data.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{data.eventDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{data.eventTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest</span>
              <span className="font-medium">{data.name}</span>
            </div>
          </div>

          <Button
            className="w-full"
            disabled={status === "awaiting"}
            onClick={() => handlePayment(/* amount from price field */)}
          >
            {status === "awaiting" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay via RazorPay"
            )}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}
```

### Pattern 7: Brevo Email Send (REST API via fetch)

**What:** Hand-rolled Brevo transactional email call using `fetch`. No SDK needed. Sends plain HTML email with event details.

**When to use:** After webhook verification passes and Sheets append succeeds (or at least attempted).

```typescript
// Source: Brevo API docs — POST /v3/smtp/email (developers.brevo.com/reference/send-transac-email)
// lib/brevo.ts
interface ConfirmationEmailParams {
  email: string
  name: string
  location: string
  eventDate: string
  eventTime: string
}

/**
 * Sends a confirmation email via Brevo transactional email API.
 * Uses raw fetch — no SDK dependency.
 */
export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY not configured")

  const contactNumber = process.env.CONTACT_NUMBER || ""

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Slow Simmer",
      },
      to: [
        {
          email: params.email,
          name: params.name,
        },
      ],
      subject: "You're registered for Slow Simmer!",
      htmlContent: `
        <div style="font-family: Karla, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="font-family: 'Playfair Display SC', serif; color: #A16207;">
            You're in! 🎉
          </h1>
          <p>Hi <strong>${params.name}</strong>,</p>
          <p>Your registration for Slow Simmer is confirmed!</p>
          <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p><strong>📍 Location:</strong> ${params.location}</p>
            <p><strong>📅 Date:</strong> ${params.eventDate}</p>
            <p><strong>⏰ Time:</strong> ${params.eventTime}</p>
          </div>
          <p>You'll receive remaining details within 24 hours.</p>
          ${contactNumber ? `<p>For queries, contact: <strong>${contactNumber}</strong></p>` : ""}
          <p style="color: #666; margin-top: 30px;">
            — Slow Simmer Team
          </p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Brevo email failed: ${response.status} ${text}`)
  }
}
```

### Anti-Patterns to Avoid

- **DO NOT call `req.json()` before webhook signature verification** — RazorPay signs the raw body bytes. Parsing and re-stringifying changes the hash. Always call `req.text()` first, verify, then `JSON.parse()`.
- **DO NOT use `key_secret` for webhook verification** — RazorPay has TWO secrets: `key_secret` (API secret, for order creation and payment verification) and `webhook_secret` (configured in webhook settings, for webhook signature verification). They are different.
- **DO NOT use `===` for HMAC comparison** — Always use `crypto.timingSafeEqual()` to prevent timing attacks.
- **DO NOT return non-200 for transient failures** — RazorPay retries webhooks on non-2xx responses. If Sheets API fails but you've already processed the webhook, return 200 and queue the retry internally (D-07).
- **DO NOT pass sensitive data (Aadhar) in order notes without consideration** — RazorPay order notes are stored in clear text. Aadhar is moderately sensitive. D-05 includes it in the Sheets schema, so it will be stored there regardless. For the payment flow, pass registration data as notes during order creation so the webhook can access it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RazorPay order creation | Manual HTTP requests to RazorPay Orders API | `razorpay` SDK `orders.create()` | SDK handles auth, error parsing, response types. 8-year-old mature package. |
| HMAC-SHA256 hashing | Custom hash implementation | Node.js `crypto.createHmac()` | Built-in, tested, constant-time comparison via `timingSafeEqual()`. Never write your own crypto. |
| Brevo email sending | SMTP server / nodemailer | Brevo REST API + `fetch` | SMTP relay requires SMTP credentials (different from API key) and nodemailer install. REST API is one POST call with `api-key` header. |
| Payment UI state machine | Ad-hoc state management | React `useState<PaymentStatus>` | Three states (awaiting/success/failure) plus idle. Simple enough for `useState`. No library needed. |
| Sheets idempotency | Complex dedup logic | Simple query of Payment ID column | Payment ID is unique per transaction. Query column N, check if value exists. Straightforward. |
| In-memory retry queue | Redis / DB queue | `Map<string, RegistrationData>` | Per D-07, a simple in-memory Map scoped to the server process lifetime. On next webhook call, retry any pending entries. This is ephemeral — for MVP scale, acceptable. |

**Key insight:** This phase's complexity is in the orchestration (order→verify→webhook→sheets→email), not in any single piece. Each individual integration is well-documented with official APIs. The primary risk is the webhook raw body handling — the single most common cause of webhook integration failure. Everything else is standard REST API calls.

## Common Pitfalls

### Pitfall 1: Webhook Signature Verification Fails Because Body Was Parsed
**What goes wrong:** `crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex')` never matches the `X-Razorpay-Signature` header.
**Why it happens:** RazorPay signs the **raw request body bytes**. When Next.js parses `req.json()`, it may strip whitespace, reorder keys, or change encoding. The re-stringified body differs from the original.
**How to avoid:** Always call `await request.text()` first, verify against that raw string, then call `JSON.parse(text)` for the data.
**Warning signs:** Webhook logs show "Invalid signature" for every event. Switching from `req.json()` to `req.text()` fixes it.

### Pitfall 2: Webhook Secret vs API Key Secret Confusion
**What goes wrong:** Using `RAZORPAY_KEY_SECRET` for webhook signature verification instead of `RAZORPAY_WEBHOOK_SECRET`.
**Why it happens:** These are two different secrets configured in different places in the RazorPay dashboard. The API key secret is for server-side API calls (order creation). The webhook secret is set when configuring a webhook endpoint.
**How to avoid:** Use separate env vars: `RAZORPAY_KEY_SECRET` for order creation and payment verification, `RAZORPAY_WEBHOOK_SECRET` for webhook HMAC.
**Warning signs:** Payment verification works (`/api/orders/verify`) but webhook signature always fails.

### Pitfall 3: Timing Attack in Signature Comparison
**What goes wrong:** Using `expectedSignature === receivedSignature` for HMAC comparison.
**Why it happens:** String comparison in JavaScript short-circuits on the first mismatched character, allowing an attacker to infer the correct signature byte-by-byte via timing.
**How to avoid:** Always use `crypto.timingSafeEqual(a, b)` with equal-length buffers.
**Warning signs:** (Silent — you wouldn't notice until an audit.)

### Pitfall 4: Google Sheets Append Scope Mismatch
**What goes wrong:** Calling Sheets `values.append` with a read-only token fails with 403.
**Why it happens:** The existing `getAccessToken()` calls use `spreadsheets.readonly` scope (for fetching locations/videos). Write operations need `spreadsheets` scope (without `.readonly`).
**How to avoid:** Create a separate token cache entry with the write scope. `getAccessToken` already caches per-scope, so calling it with the write scope will mint a new token.
**Warning signs:** `400` or `403` from Sheets API on append requests while read requests work fine.

### Pitfall 5: RazorPay Webhook Returns Non-200 Causing Infinite Retries
**What goes wrong:** RazorPay retries webhooks exponentially (up to 18 hours) on non-2xx responses. A handler that throws on transient errors (Sheets rate limit, Brevo timeout) causes repeated webhook deliveries.
**How to avoid:** Return 200 immediately after signature verification, then process asynchronously. Or catch all downstream errors and still return 200. Use the in-memory retry queue (D-07) for Sheets failures instead of rejecting the webhook.
**Warning signs:** The same `payment.captured` event appears multiple times in logs.

### Pitfall 6: CORS or Script Loading Issues with RazorPay Checkout
**What goes wrong:** `Razorpay is not defined` or checkout modal doesn't open.
**Why it happens:** The `checkout.js` script must be loaded before `new window.Razorpay()`. If using lazy loading, ensure the script has loaded before attempting to open the modal.
**How to avoid:** Use a Promise-based script loader (see Pattern 2) or add the `<Script>` tag to the root layout with `strategy="beforeInteractive"`.

## Code Examples

### Complete RazorPay Webhook Handler (Production Pattern)

```typescript
// app/api/webhooks/razorpay/route.ts
// Source: RazorPay webhook docs (razorpay.com/docs/webhooks/validate-test/)
// + Next.js App Router raw body pattern
import { NextResponse } from "next/server"
import crypto from "crypto"
import { appendRegistrationRow, checkPaymentIdExists } from "@/lib/sheets"
import { sendConfirmationEmail } from "@/lib/brevo"

export const dynamic = "force-dynamic"

// In-memory retry queue (D-07)
const pendingWrites = new Map<string, {
  row: Parameters<typeof appendRegistrationRow>[0]
  emailParams: Parameters<typeof sendConfirmationEmail>[0]
  retries: number
}>()

export async function POST(request: Request) {
  // Process queued writes from previous failures (D-07)
  await processPendingWrites()

  try {
    // 1. Raw body — must be read BEFORE any other body access
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 })
    }

    // 2. Verify HMAC-SHA256 signature using webhook secret
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex")

    try {
      const a = Buffer.from(signature, "hex")
      const b = Buffer.from(expectedSig, "hex")
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return NextResponse.json({ error: "Signature mismatch" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid signature format" }, { status: 401 })
    }

    // 3. Parse verified payload
    const event = JSON.parse(rawBody)

    // Only process payment.captured events
    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true })
    }

    const payment = event.payload.payment.entity
    const paymentId = payment.id
    const notes = payment.notes || {}

    // 4. Idempotency check (D-06)
    const isDuplicate = await checkPaymentIdExists(paymentId).catch(() => false)
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    // 5. Prepare data
    const registrationRow = {
      location: notes.location || "",
      eventDate: notes.eventDate || "",
      eventTime: notes.eventTime || "",
      name: notes.name || "",
      contact: notes.contact || "",
      email: notes.email || "",
      aadhar: notes.aadhar || "",
      bringingGuest: notes.bringingGuest === "true" ? "Yes" : "No",
      guestName: notes.guestName || "",
      guestAge: notes.guestAge || "",
      about: notes.about || "",
      social: notes.social || "",
      paymentStatus: "captured",
      paymentId,
      timestamp: new Date().toISOString(),
    }

    const emailParams = {
      email: notes.email,
      name: notes.name,
      location: notes.location,
      eventDate: notes.eventDate,
      eventTime: notes.eventTime,
    }

    // 6. Write to Sheets + send email
    // Try sheets first; if it fails, queue it
    try {
      await appendRegistrationRow(registrationRow)
    } catch (sheetsErr) {
      console.error("Sheets append failed, queuing for retry:", sheetsErr)
      pendingWrites.set(paymentId, { row: registrationRow, emailParams, retries: 0 })
      // Still try to send email even if sheets fails
    }

    // Send email (fire-and-forget — don't block on email failure)
    sendConfirmationEmail(emailParams).catch((err) => {
      console.error("Confirmation email failed:", err)
    })

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook error:", message)
    // Always return 200 to prevent RazorPay retries for transient errors
    return NextResponse.json({ received: true, error: message })
  }
}

async function processPendingWrites() {
  for (const [paymentId, pending] of pendingWrites) {
    try {
      await appendRegistrationRow(pending.row)
      pendingWrites.delete(paymentId)
      console.log(`Retry succeeded for payment ${paymentId}`)
    } catch {
      pending.retries++
      if (pending.retries > 5) {
        console.error(`Giving up on payment ${paymentId} after 5 retries`)
        pendingWrites.delete(paymentId)
      }
    }
  }
}
```

### Complete Order Creation + Verification Routes

```typescript
// app/api/orders/create/route.ts
import Razorpay from "razorpay"
import { NextResponse } from "next/server"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
  try {
    const { amount } = (await request.json()) as { amount: number }

    const order = await razorpay.orders.create({
      amount,          // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
```

```typescript
// app/api/orders/verify/route.ts
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      razorpay_order_id: string
      razorpay_payment_id: string
      razorpay_signature: string
    }

    const hmacBody = body.razorpay_order_id + "|" + body.razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(hmacBody)
      .digest("hex")

    if (expectedSignature !== body.razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    return NextResponse.json({
      verified: true,
      paymentId: body.razorpay_payment_id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const dynamic = "force-dynamic"
```

### Google Auth Scope Update

```typescript
// lib/google-auth.ts — ADD write scope alongside existing readonly scope
// Required env vars to add to .env.local:
// RAZORPAY_KEY_ID=rzp_test_...
// RAZORPAY_KEY_SECRET=...
// RAZORPAY_WEBHOOK_SECRET=...
// NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
// BREVO_API_KEY=xkeysib-...
// BREVO_SENDER_EMAIL=hello@example.com
// BREVO_SENDER_NAME=Slow Simmer
// CONTACT_NUMBER=+91-XXXXXXXXXX
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Express `body-parser` for raw body | Next.js App Router `request.text()` | 2025 (Next.js 13+) | Webhook handlers no longer need `express.raw()`. Call `req.text()` for raw body, verify signature, then `JSON.parse()`. |
| `@getbrevo/brevo` v3.x (class-based API) | `@getbrevo/brevo` v6.x (`BrevoClient` API) | 2026-07 | New SDK uses `new BrevoClient({apiKey})` and `.transactionalEmails.sendTransacEmail()`. Old `sendTransacEmail(message)` API deprecated. However, package v6.0.2 was published today — SUS flag. Use raw REST API instead. |
| RazorPay `validateWebhookSignature()` SDK method | Hand-rolled `crypto.createHmac('sha256', secret)` | Always | Both work. The SDK method is a convenience wrapper. Hand-rolled is preferred here to avoid SDK body handling issues. |
| Google Sheets `googleapis` SDK | Hand-rolled `fetch` + JWT auth | Phase 1 (project pattern) | Project doesn't use googleapis SDK anywhere. Match existing pattern. |

**Deprecated/outdated:**
- `@getbrevo/brevo` v3.x legacy API: Uses `TransactionalEmailsApi` + `SendSmtpEmail` constructors. Replaced by v6.x `BrevoClient`. If anyone uses old code, migrate to raw REST API.
- RazorPay checkout inline form: The standard approach is the Checkout modal (D-01). Inline forms are not supported for drop-in integration.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | RazorPay order `notes` field forwards registration data to the webhook payload | Architecture Patterns | Medium — if notes are not forwarded to webhooks (they are per RazorPay docs), the webhook handler won't have registration data. Mitigation: pass notes when creating order, verify in testing. |
| A2 | The `Registrations` sheet tab already exists in the spreadsheet | Architecture Patterns | Low — if it doesn't exist, the Sheets `values.append` API can auto-create it (but only if the sheet exists). Mitigation: include a "create sheet tab if not exists" setup step or document manual creation. |
| A3 | `checkout.js` from `https://checkout.razorpay.com/v1/checkout.js` is the correct CDN URL | Code Examples | Low — this is the standard RazorPay CDN URL documented on razorpay.com. |
| A4 | The project will add the `Price` column to the `Location_Date` sheet (D-14) | Architecture Patterns | Medium — the locations API currently reads columns A:D (Location, Date, Time, Price). Price is already in the schema according to `lib/locations.ts`. Verify the sheet has this column. |

## Open Questions

1. **RazorPay webhook notes payload structure**
   - What we know: RazorPay webhooks include `payload.payment.entity.notes` which contains the notes passed during order creation
   - What's unclear: Whether nested objects in notes survive serialization through RazorPay's system
   - Recommendation: Pass all registration data as flat string key-value pairs in order notes. Test with actual webhook delivery.

2. **Sheets `Registrations` tab existence**
   - What we know: The spreadsheet has `Location_Date` and `Videos` tabs
   - What's unclear: Whether a `Registrations` tab already exists or needs to be created
   - Recommendation: Add PLAN.md task to either create it programmatically (Sheets API `spreadsheets.batchUpdate`) or document as manual setup step.

3. **Brevo sender domain verification**
   - What we know: `BREVO_SENDER_EMAIL` must be a verified sender in Brevo
   - What's unclear: Whether the sender email is already verified in the user's Brevo account
   - Recommendation: Add a setup note that the sender must be configured in Brevo dashboard before emails work.

4. **Price pass-through from location data**
   - What we know: `LocationEvent` interface has a `price` field
   - What's unclear: Whether the price is passed from the RegistrationProvider to PaymentSection, or if PaymentSection needs to fetch it separately
   - Recommendation: Include price in `RegistrationData` so PaymentSection has it directly. If not already there, store it during form submission.

## Validation Architecture

> Required by Nyquist validation (workflow.nyquist_validation: true).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (from Phase 2 setup) |
| Config file | `vitest.config.ts` — already exists |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | RazorPay order creation returns `order_id` | integration | `npx vitest run --reporter=verbose` | ❌ Wave 0 — needs MSW for HTTP mocking |
| PAY-02 | Webhook signature verification: valid sig passes, invalid sig rejected | unit | (same) | ❌ Wave 0 |
| PAY-02 | Webhook handler calls Sheets.append + Brevo email on valid `payment.captured` | integration | (same) | ❌ Wave 0 |
| PAY-02 | Idempotency check blocks duplicate Payment IDs | integration | (same) | ❌ Wave 0 |
| PAY-03 | PaymentSection shows correct UI for idle/awaiting/success/failure | unit | (same) | ❌ Wave 0 |
| SHEET-01 | `appendRegistrationRow` makes correct Sheets API call | integration | (same) | ❌ Wave 0 |
| SHEET-02 | Row data contains all 15 columns in correct order | unit | (same) | ❌ Wave 0 |
| SHEET-03 | Duplicate Payment ID returns true from `checkPaymentIdExists` | unit | (same) | ❌ Wave 0 |
| NOTF-01 | `sendConfirmationEmail` makes correct Brevo API call | integration | (same) | ❌ Wave 0 |
| NOTF-02 | Email body includes `CONTACT_NUMBER` from env | unit | (same) | ❌ Wave 0 |
| NOTF-03 | Email HTML contains event details (location, date, time, name) | unit | (same) | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Unit tests for the specific module changed
- **Per wave merge:** Full vitest suite
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/razorpay.test.ts` — order creation, signature verification, webhook handler
- [ ] `tests/sheets.test.ts` — `appendRegistrationRow`, `checkPaymentIdExists`
- [ ] `tests/brevo.test.ts` — `sendConfirmationEmail` formatting and API call
- [ ] `tests/PaymentSection.test.tsx` — UI state rendering
- [ ] Mock helpers for RazorPay API, Google Sheets API, Brevo API (MSW or viest mocks)

## Security Domain

> Required: security_enforcement is true (config.json).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No user authentication in this phase |
| V3 Session Management | No | No sessions — webhook handler is stateless |
| V4 Access Control | No | No authorization boundaries (public registration flow) |
| V5 Input Validation | Yes | RazorPay webhook signature verification via HMAC-SHA256; Zod validation already in Phase 2 |
| V6 Cryptography | Yes | Node.js `crypto` for HMAC-SHA256; `timingSafeEqual` for constant-time comparison |
| V8 Data Protection | Partial | Aadhar travels via RazorPay order notes (in transit over HTTPS); stored in Sheets (at rest in Google's infrastructure) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Forged webhook event | Spoofing | HMAC-SHA256 signature verification with webhook secret + `timingSafeEqual` comparison |
| Stale/retried webhook | Repudiation | Idempotency check via Payment ID query before Sheets append |
| Aadhar in transit | Information Disclosure | All API calls over HTTPS; Aadhar in RazorPay order notes (encrypted in transit) |
| Sheets API credential misuse | Elevation of Privilege | Service account with minimal scope (`spreadsheets` only); private key never in client bundle |
| Brevo API key leak | Tampering | API key stored server-side only (`.env.local`); never exposed to browser |
| Client-side payment lying | Tampering | Payment verification on server + webhook as source of truth; client-side success is never trusted |
| Replay attack (webhook) | Tampering | Idempotency check via Payment ID; RazorPay also includes event timestamps |
| Timing attack on HMAC | Information Disclosure | `crypto.timingSafeEqual()` prevents byte-by-byte timing inference |

### Env Var Security Checklist
```
# Must be set in .env.local:
RAZORPAY_KEY_ID=rzp_test_...             # Semi-public (used in client SDK)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_... # MUST be NEXT_PUBLIC_ for client
RAZORPAY_KEY_SECRET=...                   # NEVER expose to client
RAZORPAY_WEBHOOK_SECRET=...               # NEVER expose — different from KEY_SECRET
BREVO_API_KEY=xkeysib-...                 # NEVER expose to client
BREVO_SENDER_EMAIL=...                    # Server-side
BREVO_SENDER_NAME=Slow Simmer             # Server-side
CONTACT_NUMBER=...                         # Server-side

# Already existing (reuse):
VIDEOS_SHEET_ID=...                        # Server-side (used for Sheets write)
GOOGLE_SERVICE_ACCOUNT_EMAIL=...           # Server-side
GOOGLE_PRIVATE_KEY=...                     # Server-side — NEVER expose to client
```

## Sources

### Primary (HIGH confidence)
- [CITED: razorpay.com/docs/api/orders/create] — RazorPay Orders API: amount in paise, currency INR, response structure
- [CITED: razorpay.com/docs/webhooks/validate-test] — Webhook signature verification: HMAC-SHA256, raw body, hex encoding, webhook_secret vs key_secret
- [CITED: razorpay.com/docs/payments/server-integration/nodejs] — Node.js SDK integration: order creation, checkout modal, payment verification
- [CITED: developers.brevo.com/reference/send-transac-email] — Brevo transactional email API: `POST /v3/smtp/email`, api-key auth, sender/to/htmlContent
- [CITED: developers.brevo.com/docs/send-a-transactional-email] — Brevo sending guide with `BrevoClient` example
- [CITED: developers.brevo.com/docs/api-clients] — Brevo Node.js SDK documentation
- [CITED: ui.shadcn.com/docs/components/radix/card] — shadcn Card component for summary display
- [VERIFIED: npm registry] — `razorpay` v2.9.6: verified version, age (since 2016), weekly downloads (285K), maintainers (razorpay team)

### Secondary (MEDIUM confidence)
- [CITED: razorpay.com/docs/payments/quickstart] — RazorPay quickstart: test mode, API key generation, webhook setup
- [CITED: hookray.com/blog/webhooks/razorpay/nextjs] — Next.js App Router webhook raw body pattern using `req.text()`
- [ASSUMED] — `Registrations` sheet tab exists or will be created manually
- [ASSUMED] — RazorPay webhook `payment.notes` passes through all order notes fields

### Tertiary (LOW confidence)
- [ASSUMED] — Price column already exists in `Location_Date` sheet (D-14 mentions adding it; verify before planning)
- [ASSUMED] — Brevo sender email is already verified in the Brevo account

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — `razorpay` verified on npm, Brevo REST API documented, crypto is built-in
- Architecture: HIGH — patterns follow official RazorPay and Brevo documentation; raw body handling is the standard Next.js App Router pattern
- Pitfalls: HIGH — based on documented common webhook failures (raw body, timing attacks, secret confusion)
- Security: HIGH — signature verification, timing-safe comparison, idempotency, and tier separation are all addressed
- Assumptions: MEDIUM — some assumptions about Sheet tab existence and Brevo account setup need verification

**Research date:** 2026-07-12
**Valid until:** 30 days (stable packages; Brevo SDK API may evolve but raw REST API is versioned)
