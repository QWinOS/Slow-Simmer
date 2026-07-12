# Phase 3: User Setup Required

**Generated:** 2026-07-12
**Phase:** 03-payment-sheets-email
**Status:** Incomplete

Complete these items for the payment + email integrations to function. The agent automated everything possible; these items require human access to external dashboards/accounts.

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `RAZORPAY_KEY_ID` | RazorPay Dashboard → Settings → API Keys | `.env.local` |
| [ ] | `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Same value as RAZORPAY_KEY_ID (needs `NEXT_PUBLIC_` prefix for client-side access) | `.env.local` |
| [ ] | `RAZORPAY_KEY_SECRET` | RazorPay Dashboard → Settings → API Keys | `.env.local` |
| [ ] | `RAZORPAY_WEBHOOK_SECRET` | RazorPay Dashboard → Settings → Webhooks → Add Webhook → Set secret | `.env.local` |
| [ ] | `BREVO_API_KEY` | Brevo Dashboard → SMTP & API → API Keys | `.env.local` |
| [ ] | `BREVO_SENDER_EMAIL` | Brevo Dashboard → Senders (must be verified) | `.env.local` |
| [ ] | `BREVO_SENDER_NAME` | Your choice (e.g., "Slow Simmer") | `.env.local` |
| [ ] | `CONTACT_NUMBER` | The phone number guests can contact for queries | `.env.local` |

## Account Setup

- [ ] **Create RazorPay account** (if needed)
  - URL: https://razorpay.com
  - Skip if: Already have RazorPay account

- [ ] **Create Brevo account** (if needed)
  - URL: https://brevo.com
  - Skip if: Already have Brevo account

## Dashboard Configuration

### RazorPay

- [ ] **Get API Keys**
  - Location: RazorPay Dashboard → Settings → API Keys
  - Copy Key ID → `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`
  - Copy Key Secret → `RAZORPAY_KEY_SECRET`

- [ ] **Configure webhook endpoint**
  - Location: RazorPay Dashboard → Settings → Webhooks → Add Webhook
  - URL: `https://yourdomain.com/api/webhooks/razorpay`
  - Events: `payment.captured`
  - Set a webhook secret → copy to `RAZORPAY_WEBHOOK_SECRET`

### Google Sheets — Registrations Tab

- [ ] **Create Registrations sheet tab**
  - Location: Google Sheets → Open spreadsheet (VIDEOS_SHEET_ID) → + (Add Sheet)
  - Name it exactly **"Registrations"** (case-sensitive)
  - The Registrations tab does not exist by default. If missing, the Sheets API append will fail.

- [ ] **Verify Location_Date has Price column**
  - Location: Google Sheets → Open spreadsheet → `Location_Date` tab
  - Ensure column **D (Price)** has numeric values in paise (e.g., 50000 = INR 500)
  - The locations API reads columns A-D.

### Brevo

- [ ] **Verify sender email**
  - Location: Brevo Dashboard → Senders
  - Add and verify the email you'll use as `BREVO_SENDER_EMAIL`

- [ ] **Get API key**
  - Location: Brevo Dashboard → SMTP & API → API Keys
  - Create/retrieve API key → set as `BREVO_API_KEY`

## Verification

After completing setup, verify with:

```bash
# Check all env vars are set
grep -E "RAZORPAY_|BREVO_|CONTACT_NUMBER" .env.local

# Verify build passes
npm run build

# Test env var loading (run in dev server)
curl -s http://localhost:3000/api/orders/create \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}' | head -5
```

Expected results:
- All 8 env vars have non-empty values in `.env.local`
- Build passes without errors
- API routes start without "not configured" errors

---

**Once all items complete:** Mark status as "Complete" at top of file.
