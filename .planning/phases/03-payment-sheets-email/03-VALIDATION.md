---
phase: 03
slug: payment-sheets-email
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-12
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Extracted from RESEARCH.md Validation Architecture section.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (from Phase 2 setup) |
| **Config file** | `vitest.config.ts` — already exists |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | PAY-01 | T-03-01 / — | RazorPay order creation returns `order_id` | integration | `npx vitest run --reporter=verbose` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | PAY-02 | T-03-01 / T-03-03 | Webhook signature verification: valid sig passes, invalid rejected | unit | (same) | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | SHEET-01 | T-03-04 / — | `appendRegistrationRow` makes correct Sheets API call | integration | (same) | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | SHEET-02 | — | Row data contains all 15 columns in correct order | unit | (same) | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | SHEET-03 | T-03-02 / — | Duplicate Payment ID returns true from `checkPaymentIdExists` | unit | (same) | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 2 | NOTF-01 | T-03-05 / — | `sendConfirmationEmail` makes correct Brevo API call | integration | (same) | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 2 | NOTF-02 | — | Email body includes `CONTACT_NUMBER` from env | unit | (same) | ❌ W0 | ⬜ pending |
| 03-02-06 | 02 | 2 | NOTF-03 | — | Email HTML contains event details (location, date, time, name) | unit | (same) | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | PAY-02 | T-03-02 / T-03-06 | Webhook handler calls Sheets.append + Brevo email on valid `payment.captured` | integration | (same) | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | PAY-02 | — | Idempotency check blocks duplicate Payment IDs | integration | (same) | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | PAY-03 | — | PaymentSection shows correct UI for idle/awaiting/success/failure | unit | (same) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/razorpay.test.ts` — order creation, signature verification, webhook handler
- [ ] `tests/sheets.test.ts` — `appendRegistrationRow`, `checkPaymentIdExists`
- [ ] `tests/brevo.test.ts` — `sendConfirmationEmail` formatting and API call
- [ ] `tests/PaymentSection.test.tsx` — UI state rendering
- [ ] Mock helpers for RazorPay API, Google Sheets API, Brevo API (MSW or viest mocks)
- [ ] `npm install -D msw` — if MSW chosen for HTTP mocking

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| RazorPay checkout modal opens and processes payment | PAY-01 | Requires real RazorPay test credentials and browser interaction | Run dev server, submit form, click "Pay via RazorPay", verify modal opens in test mode |
| Webhook callback from RazorPay | PAY-02 | Requires RazorPay webhook configuration pointing to deployed endpoint | Configure webhook in RazorPay dashboard, trigger test payment, verify endpoint receives callback |
| Email delivery via Brevo | NOTF-01 | Requires real Brevo API key and verified sender | Process a test payment, verify email arrives at the guest's inbox |
| Idempotency with duplicate webhook | SHEET-03 | Requires sending same webhook event twice | Trigger webhook twice with same Payment ID, verify only one row appended |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
