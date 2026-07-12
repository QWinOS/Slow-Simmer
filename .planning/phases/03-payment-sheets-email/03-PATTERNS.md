# Phase 3: Payment, Sheets & Email - Pattern Map

**Mapped:** 2026-07-12
**Files analyzed:** 11 (5 new files, 3 modified files, 3 config/env)
**Analogs found:** 8 / 8 custom files have matches

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `app/api/orders/create/route.ts` | controller (API route) | request-response | `app/api/locations/route.ts` | role-match |
| `app/api/orders/verify/route.ts` | controller (API route) | request-response | `app/api/locations/route.ts` | role-match |
| `app/api/webhooks/razorpay/route.ts` | controller (API route) | event-driven | `app/api/locations/route.ts` | partial |
| `lib/razorpay.ts` | service | CRUD | `lib/locations.ts` | role-match |
| `lib/sheets-write.ts` | service | CRUD | `lib/google-auth.ts` | role-match |
| `lib/brevo.ts` | service | request-response | `lib/locations.ts` | role-match |
| `components/PaymentSection.tsx` | component | request-response | `components/RegistrationForm.tsx` | role-match |
| `app/page.tsx` | route | request-response | `app/page.tsx` (existing - modification) | exact |
| `lib/google-auth.ts` | service | CRUD | Already exists — no changes needed (scope-parameterized) | exact |
| `.env.local` | config | — | `.env.local` (existing - append) | exact |
| `.env.example` | config | — | `.env.example` (existing - append) | exact |

---

## Pattern Assignments

### `app/api/orders/create/route.ts` (controller / API route, request-response)

**Analog:** `app/api/locations/route.ts` — closest server API route with try/catch error handling and external API call pattern.

**Imports + exports pattern** (`locations/route.ts` lines 1-5):
```typescript
import { getAccessToken } from "@/lib/google-auth"

export const dynamic = "force-dynamic"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"

export async function GET() {
```

Pattern to follow for orders/create:
```typescript
import Razorpay from "razorpay"
import { NextResponse } from "next/server"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: Request) {
```

**Try/catch error handling pattern** (`locations/route.ts` lines 14-54):
```typescript
  try {
    // ... operation ...
    return Response.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
```

**Config validation pattern** (`locations/route.ts` lines 8-12):
```typescript
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) {
    return Response.json({ error: "VIDEOS_SHEET_ID not configured" }, { status: 500 })
  }
```

**Core order creation pattern** (from RESEARCH.md — code examples, `razorpay` SDK `orders.create`):
```typescript
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
```

**Apply to:** `app/api/orders/create/route.ts` — POST handler

---

### `app/api/orders/verify/route.ts` (controller / API route, request-response)

**Analog:** `app/api/locations/route.ts` — same server route pattern.

**Imports pattern** (follow the existing route conventions):
```typescript
import { NextResponse } from "next/server"
import crypto from "crypto"
```

**Core verification pattern** (from RESEARCH.md — RazorPay signature verification):
```typescript
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

**Apply to:** `app/api/orders/verify/route.ts` — POST handler

---

### `app/api/webhooks/razorpay/route.ts` (controller / API route, event-driven)

**Analog:** `app/api/locations/route.ts` — closest server route pattern. This is the only event-driven route in the project; data flow differs (incoming webhook vs request-response), but the route file structure, env validation, and error handling patterns are shared.

**CRITICAL pattern — raw body before signature verification** (from RESEARCH.md — anti-patterns section):
```typescript
// DO THIS: read raw body FIRST, verify, then parse
const rawBody = await request.text()
const signature = request.headers.get("x-razorpay-signature")

// Verify HMAC-SHA256 using webhook secret (NOT key_secret)
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(rawBody)
  .digest("hex")

const sigBuffer = Buffer.from(signature, "hex")
const expectedBuffer = Buffer.from(expectedSignature, "hex")
if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
}

// Then parse body AFTER verification
const event = JSON.parse(rawBody)
```

**Webhook return-200 pattern** (from RESEARCH.md — anti-pitfalls):
```typescript
// Always return 200 for RazorPay (prevents infinite retries)
return NextResponse.json({ received: true })

// Even on error, return 200 with error field:
return NextResponse.json({ received: true, error: message })
// (Never let RazorPay see a 5xx for transient errors)
```

**Apply to:** `app/api/webhooks/razorpay/route.ts` — POST handler

---

### `lib/razorpay.ts` (service, CRUD)

**Analog:** `lib/locations.ts` — same service layer role, exports typed async functions consumed by server routes.

**Service module pattern** (`lib/locations.ts` lines 1-17):
```typescript
export interface LocationEvent {
  location: string
  date: string
  time: string
  price: number
}

export async function fetchLocations(): Promise<LocationEvent[]> {
  const response = await fetch("/api/locations")
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to load locations: ${response.status}`)
  }
  return response.json()
}
```

**Pattern for `lib/razorpay.ts`:**
- Export `createOrder(amount, notes)` using `razorpay` SDK's `orders.create()`
- Export `verifyPaymentSignature(order_id, payment_id, signature)` using `crypto.createHmac()`
- Use the same `razorpay` instance initialized at module level with env vars
- Error handling: let errors propagate (caller handles)

**Apply to:** `lib/razorpay.ts` — module with RazorPay helper functions

---

### `lib/sheets-write.ts` (service, CRUD)

**Analog:** `lib/google-auth.ts` — same pattern of server-side auth'd fetch to Google APIs, hand-rolled fetch (no googleapis SDK).

**Auth + fetch pattern** (`lib/google-auth.ts` lines 61-80):
```typescript
const res = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }),
})

if (!res.ok) {
  const text = await res.text()
  throw new Error(`Token exchange failed: ${res.status} ${text}`)
}
```

**Pattern for `lib/sheets-write.ts`** (from RESEARCH.md):
```typescript
import { getAccessToken } from "@/lib/google-auth"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

export async function appendRegistrationRow(row: RegistrationRow): Promise<void> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getAccessToken(SHEETS_SCOPE)

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
    body: JSON.stringify({ values: [/* ...15-column row... */] }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Sheets append failed: ${response.status} ${text}`)
  }
}
```

**Idempotency check pattern** (from RESEARCH.md — Pattern 5):
```typescript
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

  if (!response.ok) return false
  const data = await response.json()
  const rows: string[][] = data.values || []
  return rows.slice(1).some((row) => row[0]?.trim() === paymentId)
}
```

**Apply to:** `lib/sheets-write.ts` — two exported functions: `appendRegistrationRow()`, `checkPaymentIdExists()`

---

### `lib/brevo.ts` (service, request-response)

**Analog:** `lib/locations.ts` — single-purpose service module, clean interface + typed params, async function with fetch.

**Service module pattern** (`lib/locations.ts` lines 1-17):
```typescript
export interface LocationEvent { ... }
export async function fetchLocations(): Promise<LocationEvent[]> {
  const response = await fetch("/api/locations")
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to load locations: ${response.status}`)
  }
  return response.json()
}
```

**Pattern for `lib/brevo.ts`** (from RESEARCH.md — Pattern 7):
```typescript
interface ConfirmationEmailParams {
  email: string
  name: string
  location: string
  eventDate: string
  eventTime: string
}

export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY not configured")

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
      to: [{ email: params.email, name: params.name }],
      subject: "You're registered for Slow Simmer!",
      htmlContent: `...inline HTML...`,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Brevo email failed: ${response.status} ${text}`)
  }
}
```

**Apply to:** `lib/brevo.ts` — single exported function `sendConfirmationEmail()`

---

### `components/PaymentSection.tsx` (component, request-response)

**Analog:** `components/RegistrationForm.tsx` — same role ("use client" component with state management, uses `useRegistration()` context, `Reveal` wrapper, shadcn/ui components, section container pattern).

**Client directive + imports pattern** (`RegistrationForm.tsx` lines 1-10):
```tsx
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRegistration } from "@/components/RegistrationProvider"
import Reveal from "@/components/Reveal"
```

**Section container pattern** (`RegistrationForm.tsx` lines 117-119):
```tsx
<section id="form" className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16">
  {/* Backdrop accent */}
  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
```

**State machine pattern** (from RESEARCH.md — Pattern 6):
```tsx
type PaymentStatus = "idle" | "awaiting" | "success" | "failure"

export function PaymentSection() {
  const { data } = useRegistration()
  const [status, setStatus] = useState<PaymentStatus>("idle")
  const [paymentId, setPaymentId] = useState<string | null>(null)
```

**Card component usage** (`RegistrationForm.tsx` uses card patterns from `ui/card.tsx`):
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
```

**Loading button pattern** (`RegistrationForm.tsx` lines 442-449):
```tsx
<Button
  type="submit"
  className="w-full mt-6"
  disabled={form.formState.isSubmitting}
>
  {form.formState.isSubmitting && <Spinner className="size-4" />}
  {form.formState.isSubmitting ? "Submitting..." : "Submit Registration"}
</Button>
```

**Apply to:** `components/PaymentSection.tsx` — replace `PaymentPlaceholder`, render `#payment` section with three states (idle/awaiting/success/failure)

---

### `app/page.tsx` (route, request-response — modification)

**Analog:** `app/page.tsx` — existing file, same modification pattern as Phase 2 (replaced `FormPlaceholder` with `RegistrationForm`).

**Current import structure** (lines 1-9):
```tsx
import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import { RegistrationForm } from "@/components/RegistrationForm"
import { RegistrationProvider } from "@/components/RegistrationProvider"
import { PaymentPlaceholder } from "@/components/PaymentPlaceholder"
import Footer from "@/components/Footer"
```

**Current render tree** (lines 11-26):
```tsx
export default function HomePage() {
  return (
    <RegistrationProvider>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <RegistrationForm />
        <PaymentPlaceholder />
      </main>
      <Footer />
    </RegistrationProvider>
  )
}
```

**Modification pattern:** Replace `PaymentPlaceholder` import and JSX with `PaymentSection`:
```tsx
import { PaymentSection } from "@/components/PaymentSection"
// ... remove PaymentPlaceholder import ...
// In JSX:
<PaymentSection />
```

**Apply to:** `app/page.tsx` — replace `PaymentPlaceholder` with `PaymentSection`

---

### `lib/google-auth.ts` (service, CRUD — minimal modification)

**Analog:** Already exists — `lib/google-auth.ts` already accepts `scope` parameter, so no refactoring needed.

**Existing call pattern** — currently called with readonly scope:
```typescript
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"
const token = await getAccessToken(SHEETS_SCOPE)
```

**For write access** — call with write scope (no code change to `google-auth.ts`):
```typescript
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"
const token = await getAccessToken(SHEETS_SCOPE)
```

The `getAccessToken()` function already handles per-scope caching (line 29: `const tokenCache = new Map<string, ...>()`). Calling with a different scope auto-mints a new token.

**Apply to:** `lib/google-auth.ts` — NO code change needed. Scope is already parameterized.

---

### `.env.local` and `.env.example` (config — modification)

**Analog:** `.env.local` — existing file; `.env.example` — existing file.

**Existing env var pattern** (`.env.example` lines 7-24):
```
# Google API Configuration
# [description of where to get the value]
NEXT_PUBLIC_GOOGLE_API_KEY=
# [description]
NEXT_PUBLIC_DRIVE_FOLDER_ID=
```

**New env vars to append to both `.env.local` and `.env.example`:**
```
# RazorPay Configuration
# 1. Create account at razorpay.com
# 2. Get API keys from Dashboard → Settings → API Keys
# 3. Configure webhook at Dashboard → Settings → Webhooks → Add Webhook
#    URL: https://yourdomain.com/api/webhooks/razorpay
#    Events: payment.captured
#    Secret: set a secret and save as RAZORPAY_WEBHOOK_SECRET
RAZORPAY_KEY_ID=rzp_test_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Brevo (Sendinblue) Email Configuration
# 1. Create account at brevo.com
# 2. Get API key from Dashboard → SMTP & API → API Keys
# 3. Verify sender email at Dashboard → Senders
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=hello@example.com
BREVO_SENDER_NAME=Slow Simmer
CONTACT_NUMBER=+91-XXXXXXXXXX
```

**Apply to:** `.env.local` (append with actual values), `.env.example` (append with template values)

---

## Shared Patterns

### Server API Route Pattern
**Source:** `app/api/locations/route.ts`
**Apply to:** `app/api/orders/create/route.ts`, `app/api/orders/verify/route.ts`, `app/api/webhooks/razorpay/route.ts`
```typescript
import { NextResponse } from "next/server"

// Config validation at top of handler
const val = process.env.SOME_VAR
if (!val) {
  return NextResponse.json({ error: "Not configured" }, { status: 500 })
}

// Try/catch with typed error handling
try {
  // ... logic ...
  return NextResponse.json({ result })
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error"
  return NextResponse.json({ error: message }, { status: 500 })
}
```

### Section Container Pattern
**Source:** `components/GallerySection.tsx` lines 16-46, `components/RegistrationForm.tsx` lines 117-119
**Apply to:** `components/PaymentSection.tsx`
```tsx
<section id="payment" className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16">
  {/* Background accent */}
  <div className="absolute ... blur-3xl -z-10" />
  
  <Reveal>
    {/* Card content */}
  </Reveal>
</section>
```

### Client Component Pattern
**Source:** All interactive components (`GallerySection.tsx`, `RegistrationForm.tsx`, `Reveal.tsx`, etc.)
**Apply to:** `components/PaymentSection.tsx`
```tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
```

### Context Consumption Pattern
**Source:** `components/RegistrationForm.tsx` line 50
**Apply to:** `components/PaymentSection.tsx`
```tsx
import { useRegistration } from "@/components/RegistrationProvider"

// Inside component:
const { data, setRegistrationData } = useRegistration()
```

### Error Handling Pattern (Server Routes)
**Source:** `app/api/locations/route.ts` lines 51-54
**Apply to:** All new `app/api/*/route.ts` files
```typescript
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error"
  return Response.json({ error: message }, { status: 500 })
}
```

### shadcn/ui Component Pattern
**Source:** `components/ui/card.tsx` lines 6-21, `components/ui/button.tsx` lines 44-65
**Apply to:** `components/PaymentSection.tsx`
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
```
- Uses `data-slot` attributes
- Uses `cn()` for className merging
- Exports named functions

### Env Var Validation Pattern
**Source:** `app/api/locations/route.ts` lines 8-12
**Apply to:** All server routes that use new env vars
```typescript
const val = process.env.SOME_VAR
if (!val) {
  return Response.json({ error: "SOME_VAR not configured" }, { status: 500 })
}
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/api/webhooks/razorpay/route.ts` | controller (API route) | event-driven | No webhook handlers exist in the project — unique pattern with `req.text()`/`timingSafeEqual`. All patterns from RESEARCH.md. |

**Note:** `lib/google-auth.ts` requires no code modification — the `getAccessToken(scope)` function is already scope-parameterized with per-scope token caching (line 29). Simply call it with `"https://www.googleapis.com/auth/spreadsheets"` (no `.readonly` suffix) for write operations.

---

## Metadata

**Analog search scope:** `app/api/`, `lib/`, `components/`, `components/ui/`, `.env.*`
**Files scanned:** 20+ existing files
**Pattern extraction date:** 2026-07-12
