# Phase 3: Payment, Sheets & Email - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-12
**Phase:** 3-payment-sheets-email
**Areas discussed:** Payment Provider & Flow, Google Sheets Write, Brevo Email, Payment Section UI, Location Data Source

---

## Payment Provider & Flow

| Option | Description | Selected |
|--------|-------------|----------|
| RazorPay Order API + Webhook | Server-side order, client checkout modal, webhook confirmation | ✓ |
| RazorPay Payment Link | Simplified link-based flow, less UX control | |

**User's choice:** RazorPay Order API + Webhook (switched from PhonePe)
**Notes:** User explicitly chose RazorPay over PhonePe. Webhook-based confirmation with signature verification.

---

## Google Sheets Write

| Option | Description | Selected |
|--------|-------------|----------|
| Same spreadsheet, new 'Registrations' sheet | Uses same VIDEOS_SHEET_ID, new tab | ✓ |
| New spreadsheet | Separate spreadsheet with own env var | |

| Option | Description | Selected |
|--------|-------------|----------|
| All registration fields | Full schema with every field + payment metadata | ✓ |
| Minimal + pointer | Fewer columns, omits optional fields | |

| Option | Description | Selected |
|--------|-------------|----------|
| Idempotency check via Payment ID | Check before append to guard duplicates | ✓ |
| Trust RazorPay retry logic | Append every callback | |

| Option | Description | Selected |
|--------|-------------|----------|
| Queue failed writes + retry | In-memory queue, retry on next request | ✓ |
| Log and move on | Log error, return 200 | |

**User's choice:** Same spreadsheet, full schema, idempotency check, queue + retry

---

## Brevo Email

| Option | Description | Selected |
|--------|-------------|----------|
| Send immediately on webhook | Instant confirmation | ✓ |
| Batched send | Daily batch | |

| Option | Description | Selected |
|--------|-------------|----------|
| Full event details | Location, date, time, name, contact number | ✓ |
| Minimal confirmation | Brief thank-you only | |

| Option | Description | Selected |
|--------|-------------|----------|
| Env vars for everything | BREVO_API_KEY, sender email/name, contact number | ✓ |
| API key only in env | Sender hardcoded | |

**User's choice:** Send immediately with full event details, all config via env vars

---

## Payment Section UI

| Option | Description | Selected |
|--------|-------------|----------|
| Empty placeholder message | "Fill the form above to proceed" before submit | ✓ |
| Hidden section | Revealed only after form submit | |

| Option | Description | Selected |
|--------|-------------|----------|
| Summary card + RazorPay button | Event details + pay button opening RazorPay modal | ✓ |
| Summary + QR + button | Also shows QR code | |

| Option | Description | Selected |
|--------|-------------|----------|
| Three states (awaiting/success/failure) | Full status progression | ✓ |
| Two states (success/failure only) | Simpler | |

| Option | Description | Selected |
|--------|-------------|----------|
| Amount varies by location | Price column in Location_Date sheet | ✓ |
| Fixed amount from env var | Same price for all | |

**User's choice:** Placeholder before submit, summary card + RazorPay button after, three status states, price per location

---

## Location Data Source (earlier discussion)

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded enum | Static LOCATIONS array in validations.ts | |
| Google Sheets dynamic | Fetch from Location_Date sheet | ✓ |

**User's choice:** Google Sheets dynamic fetch (A=Location, B=Date, C=Time, D=Price)

---

## Deferred Ideas

None — discussion stayed within phase scope.
