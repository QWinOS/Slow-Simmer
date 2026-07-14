# Requirements: Slow Simmer

**Defined:** 2026-07-02
**Core Value:** Guests can register for a Slow Simmer event, pay via GPay UPI, and have their registration automatically recorded in Google Sheets.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Gallery & Media

- [x] **GALL-01**: Photo gallery displays past event images from Google Drive via Drive API
- [x] **GALL-04**: New images added to the Drive folder appear automatically (no code change)
- [x] **GALL-02**: Video section embeds YouTube videos and Instagram reels
- [x] **GALL-03**: Gallery is mobile-responsive (swipeable / grid adapts to mobile)
- [x] **GALL-05**: Videos are sourced dynamically at runtime from a Google Sheet of YouTube + Instagram links; new rows appear on the site with no code change or redeploy

### Registration Form

- [x] **FORM-01**: Guest can enter full name
- [x] **FORM-02**: Guest can enter contact number
- [x] **FORM-03**: Guest can enter email address
- [x] **FORM-04**: Guest can indicate if bringing someone + provide their name & age
- [x] **FORM-05**: Guest can share 1-2 lines about themselves
- [x] **FORM-06**: Guest can share Instagram or LinkedIn profile
- [x] **FORM-07**: Guest can enter Aadhar number
- [x] **FORM-08**: Form validates required fields before submission
- [x] **FORM-09**: Form is mobile-friendly with proper touch targets

### Payment

- [ ] **PAY-01**: RazorPay Order API creates a payment order server-side; RazorPay Checkout modal opens on client
- [ ] **PAY-02**: Payment webhook (RazorPay) verifies HMAC-SHA256 signature before processing
- [ ] **PAY-03**: User sees success/failure feedback after payment

### Google Sheets Integration

- [ ] **SHEET-01**: On successful payment, guest details are inserted into Google Sheets
- [ ] **SHEET-02**: Google Sheet row includes all registration fields: Location, Event Date, Event Time, Name, Contact, Email, Aadhar, Bringing Guest, Guest Name, Guest Age, About, Social, Payment Status, Payment ID, Timestamp
- [ ] **SHEET-03**: Duplicate submissions (same email/contact) are handled gracefully

### Email Notifications

- [ ] **NOTF-01**: On successful payment, send a thank-you email via Brevo API
- [ ] **NOTF-02**: Email body: "You'll receive remaining details within 24 hours. Contact [PHONE] for queries" — phone fetched from env var
- [ ] **NOTF-03**: Email uses a template or inline HTML with supper club branding

### Layout & Responsiveness

- [x] **UI-01**: Single-page layout with smooth scrolling between sections
- [x] **UI-02**: Fully responsive — works on mobile and desktop
- [x] **UI-03**: Clean, elegant design fitting a supper club brand

## Milestone v1.1 Requirements — Env-Driven Site Config

**Defined:** 2026-07-13
**Goal:** Externalize hardcoded site content into env vars as a single source of truth, read via one central typed module. Copy falls back to current text; social links hide when unset.

### Config Module & Contract

- [ ] **CFG-01**: A central `lib/site-config.ts` (public, `NEXT_PUBLIC_` only) exposes all browser-facing config via typed accessors; no component reads `process.env` directly
- [ ] **CFG-02**: A separate `lib/site-config.server.ts` guarded with `import "server-only"` exposes server-only copy (email); a client import of it fails the build
- [ ] **CFG-03**: Config helpers treat an empty string (`""`) as unset (not a valid value), reusing the existing zod dependency
- [ ] **CFG-04**: Copy accessors (brand, marketing, email) fall back to the current shipped strings, so an empty `.env` renders the site byte-identically to today
- [ ] **CFG-05**: `.env.example` documents every new var — grouped, annotated required/optional and `NEXT_PUBLIC_` (⚠ redeploy on change) vs server-only, with realistic non-empty examples

### Social Handles

- [ ] **SOC-01**: Instagram link is driven by `NEXT_PUBLIC_INSTAGRAM_URL`; icon hidden when unset
- [ ] **SOC-02**: YouTube link is driven by `NEXT_PUBLIC_YOUTUBE_URL`; icon hidden when unset
- [ ] **SOC-03**: WhatsApp link is driven by env; icon added to footer and shown only when set
- [ ] **SOC-04**: No social icon ever renders a dead `href="#"` / empty link (replaces current placeholders)

### Brand Identity

- [ ] **BRND-01**: Brand name is env-driven and applied everywhere it appears (layout, footer, payment, email)
- [ ] **BRND-02**: Brand tagline is env-driven (footer)
- [ ] **BRND-03**: SEO title and meta description are env-driven in `app/layout.tsx` metadata (server-only)

### Email Copy

- [ ] **ECPY-01**: Confirmation email subject is env-driven (server-only), falling back to current text
- [ ] **ECPY-02**: Confirmation email body lines and signature are env-driven (server-only), falling back to current text

### Marketing Copy (short strings only)

- [ ] **MKTG-01**: Event cities (currently "Kolkata & Bangalore") are env-driven
- [ ] **MKTG-02**: Seat count (currently "10–14") is env-driven
- [ ] **MKTG-03**: Hero heading/badge short strings are env-driven (long-form About prose stays in code)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **ADMN-01**: Admin view to see all registered guests
- **ADMN-02**: Admin can export registrations from the app
- **CFG-06** (deferred): Automated drift test asserting config-module keys ↔ `.env.example` keys match
- **CFG-07** (deferred): Fail-fast boot validation of required vars (e.g. via `@t3-oss/env-nextjs`)
- **MKTG-04** (deferred): Externalize long-form About story prose and per-card body copy

## Out of Scope

| Feature | Reason |
|---------|--------|
| User login/authentication | Form-based registration only — no account system needed |
| Multi-event management | Single-page, single event at a time |
| Payment gateway other than RazorPay | RazorPay Order API is the chosen provider |
| Traditional database | Google Sheets suffices for MVP scale |
| Host-side event creation | Events are curated by admin, not created through the app |
| LinkedIn social handle (v1.1) | Not wanted in footer; Instagram + YouTube + WhatsApp only |
| Live no-redeploy browser config (v1.1) | `NEXT_PUBLIC_` is build-time; runtime-editable content stays in the Google Sheet |
| Event date/time/price/location as env (v1.1) | Already runtime-editable via the Google Sheet — deliberately not moved to env |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GALL-01 | Phase 1 | Complete |
| GALL-02 | Phase 1 | Complete |
| GALL-03 | Phase 1 | Complete |
| GALL-04 | Phase 1 | Complete |
| GALL-05 | Phase 1 | Complete |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| FORM-01 | Phase 2 | Complete |
| FORM-02 | Phase 2 | Complete |
| FORM-03 | Phase 2 | Complete |
| FORM-04 | Phase 2 | Complete |
| FORM-05 | Phase 2 | Complete |
| FORM-06 | Phase 2 | Complete |
| FORM-07 | Phase 2 | Complete |
| FORM-08 | Phase 2 | Complete |
| FORM-09 | Phase 2 | Complete |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| SHEET-01 | Phase 3 | Pending |
| SHEET-02 | Phase 3 | Pending |
| SHEET-03 | Phase 3 | Pending |
| NOTF-01 | Phase 3 | Pending |
| NOTF-02 | Phase 3 | Pending |
| NOTF-03 | Phase 3 | Pending |
| CFG-01 | Phase 4 | Pending |
| CFG-02 | Phase 4 | Pending |
| CFG-03 | Phase 4 | Pending |
| CFG-04 | Phase 4 | Pending |
| CFG-05 | Phase 4 | Pending |
| SOC-01 | Phase 4 | Pending |
| SOC-02 | Phase 4 | Pending |
| SOC-03 | Phase 4 | Pending |
| SOC-04 | Phase 4 | Pending |
| BRND-01 | Phase 4 | Pending |
| BRND-02 | Phase 4 | Pending |
| BRND-03 | Phase 4 | Pending |
| ECPY-01 | Phase 4 | Pending |
| ECPY-02 | Phase 4 | Pending |
| MKTG-01 | Phase 4 | Pending |
| MKTG-02 | Phase 4 | Pending |
| MKTG-03 | Phase 4 | Pending |

**Coverage:**

- v1 requirements: 26 total (mapped to Phases 1–3)
- v1.1 requirements: 17 total (mapped to Phase 4)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-02*
*Last updated: 2026-07-03 — added GALL-05 (dynamic video sourcing from Google Sheet)*
