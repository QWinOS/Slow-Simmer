---
status: resolved
trigger: "Confirmation email not delivering on production (Vercel) site https://slowsimmer.hotelsweethomeinternational.com/"
created: 2026-07-13
updated: 2026-07-13
---

# Debug: email-not-delivering (RESOLVED)

## Symptoms

- Expected: after a successful Razorpay payment, guest receives the Brevo confirmation email.
- Actual: no email on the live Vercel site; Sheets row wrote fine; worked locally; spam already checked.

## Root Cause

`BREVO_API_KEY` and `BREVO_SENDER_EMAIL` existed in Vercel **Production** but their values were **empty strings (`""`)**. The Google/Razorpay vars had real values (hence Sheets worked). At runtime `lib/brevo.ts:16-17` threw `BREVO_API_KEY not configured`, and that throw was swallowed by the `.catch()` at `app/api/orders/verify/route.ts:75` and `app/api/webhooks/razorpay/route.ts:113` — so the failure was silent (payment + Sheets still succeeded). Worked locally because `.env.local` held the real values.

## Investigation Trail (scientific method)

1. Symptoms isolated failure to Brevo only (Sheets OK, local OK, spam ruled out).
2. `vercel env ls production` → BREVO_* vars *present* → eliminated "missing var" hypothesis.
3. `vercel env pull` → BREVO_API_KEY / SENDER_EMAIL / SENDER_NAME = `""` (empty). Root cause found.
4. Confirmed key itself is valid: using the real local key, `GET /v3/account` → 200 (free plan, 300/day).
5. Ruled out sender-verification blocker: real diagnostic `POST /v3/smtp/email` with the exact configured sender `contact-slowsimmer@hotelsweethomeinternational.com` → **201 + messageId** (delivered to dasaniket195@gmail.com). Brevo accepts the sender; no 400.

## Eliminated

- Missing env vars (they existed, just empty).
- Invalid API key (200 from /v3/account).
- Unverified sender / 400 (send returned 201).
- Spam misclassification; Google/Sheets auth.

## Fix Applied

- `vercel env rm` + `vercel env add` for `BREVO_API_KEY` (sensitive) and `BREVO_SENDER_EMAIL` (`--no-sensitive`, non-secret) in Production, values piped from `.env.local` (never printed).
- Verified SENDER_EMAIL landed real value via pull; API_KEY stored sensitive (hidden by design, still readable at runtime).
- `BREVO_SENDER_NAME` left empty — `lib/brevo.ts:31` falls back to `"Slow Simmer"`.
- Redeployed production: `vercel --prod` → dpl_7KxcVKZqkGesDAo38TGSifdsFuEy, READY.
- Cleaned up pulled `.vercel/.env.production.local` (contained secrets).

## Verification

- Pre-fix: prod key empty → Brevo 401.
- Isolated: real credentials → Brevo 201 (delivery confirmed).
- Post-fix: prod env now holds real values; new production deployment live.
- Optional full E2E (not run, invasive): craft valid Razorpay signature → POST prod `/api/orders/verify` → would write one test Sheet row + send one email. Left to a real registration.

## files_changed

- Vercel Production env vars only (BREVO_API_KEY, BREVO_SENDER_EMAIL). No source code changed.

## Follow-up Recommendations

- The `.catch()` that swallows email errors made this silent for hours. Consider surfacing/logging a distinct alert (or writing email status to the Sheet row) so future Brevo failures are visible. See `orders/verify/route.ts:75`, `webhooks/razorpay/route.ts:113`.
- If Preview env also needs email, note the Production BREVO_* now differ from Preview (which still had the 6h-old copies).
