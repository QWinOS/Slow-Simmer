# Roadmap: Slow Simmer

## Overview

A single-page, mobile-friendly webapp for Slow Simmer. Guests browse past event photos/videos, fill a registration form, pay via RazorPay, and get recorded in Google Sheets with a confirmation email. Built in 3 phases: layout+gallery, then form, then payment+sheets+email.

## Phases

- [x] **Phase 1: Foundation, Layout & Gallery** - Single-page responsive shell with Google Drive photo gallery and video embeds *(reopened: theme gaps + GALL-05 dynamic video)* (completed 2026-07-02)
- [x] **Phase 2: Registration Form** - Functional registration form collecting all guest details (completed 2026-07-04)
- [x] **Phase 3: Payment, Sheets & Email** - RazorPay payment, Google Sheets logging, and Brevo confirmation email (completed 2026-07-12)

### Milestone v1.1 — Env-Driven Site Config

- [ ] **Phase 4: Env-Driven Site Config** - Central typed config module; social handles, brand identity, email copy, and short marketing strings driven from `.env` as a single source of truth

## Phase Details

### Phase 1: Foundation, Layout & Gallery

**Goal**: Single-page responsive shell with photo gallery and video embeds
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03, GALL-01, GALL-02, GALL-03, GALL-04, GALL-05
**Success Criteria** (what must be TRUE):

  1. Page renders in a single scrollable layout on mobile and desktop
  2. Past event photos from Google Drive display in a responsive grid
  3. YouTube and Instagram reels embed and play inline
  4. New images added to the Drive folder appear without code changes
  5. New videos added to the source Google Sheet appear without code changes

**Plans**: 6/6 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Foundation: theme system, fonts, shadcn components, Drive/video utilities *(complete 2026-07-02)*
- [x] 01-05-PLAN.md — Gap closure (UI-03): wire Karla body + Playfair Display SC headings, apply warm red/gold palette tokens
- [x] 01-06-PLAN.md — Gap closure (GALL-05): source videos dynamically at runtime from a Google Sheet (fetchVideoLinks), replace hardcoded VIDEOS constant

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Layout shell: NavBar, static sections (Hero, About, Form, Footer), page.tsx composition *(complete 2026-07-02)*

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Gallery: Drive API grid with loading/empty/error states + lightbox overlay *(complete 2026-07-02)*
- [x] 01-04-PLAN.md — Video: thumbnail grid with play overlay, inline YouTube/Instagram embeds *(complete 2026-07-02)*

**Cross-cutting constraints:**

- Page loads with Playfair Display SC headings and Karla body text applied globally
- Warm red/gold color palette (#DC2626/#F87171/#A16207) renders on page

### Phase 2: Registration Form

**Goal**: Functional registration form collecting all guest details
**Depends on**: Phase 1
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09
**Success Criteria** (what must be TRUE):

  1. Guest can fill and submit all form fields
  2. Form validates required fields before submission
  3. Form is usable on mobile with proper touch targets

**Plans**: 5/5 plans complete

Plans:
**Wave 1** *(parallel)*

- [x] 02-01-PLAN.md — Foundation: npm packages, shadcn components, vitest config, test setup *(complete 2026-07-03)*
- [x] 02-02-PLAN.md — Provider + Placeholder: RegistrationProvider context, PaymentPlaceholder stub *(complete 2026-07-03)*

**Wave 2** *(blocked on 02-01)*

- [x] 02-03-PLAN.md — Validation: Zod schema, unit tests, sonner Toaster in layout *(complete 2026-07-03)*

**Wave 3** *(blocked on 02-02, 02-03)*

- [x] 02-04-PLAN.md — RegistrationForm component + page.tsx integration *(complete 2026-07-04)*

**Wave 4** *(blocked on 02-04)*

- [x] 02-05-PLAN.md — Integration tests for RegistrationForm *(complete 2026-07-04)*

### Phase 3: Payment, Sheets & Email

**Goal**: RazorPay payment, Google Sheets logging, and Brevo confirmation email
**Depends on**: Phase 2
**Requirements**: PAY-01, PAY-02, PAY-03, SHEET-01, SHEET-02, SHEET-03, NOTF-01, NOTF-02, NOTF-03
**Success Criteria** (what must be TRUE):

  1. Guest sees summary card with event details after form submission
  2. RazorPay checkout modal opens on "Pay" click and processes payment
  3. Payment webhook confirms transaction — signature verified before any write
  4. Guest details appended to Google Sheets (15-column Registrations tab) on payment success
  5. Duplicate webhook callbacks are idempotent (checked via Payment ID)
  6. Guest receives branded thank-you email via Brevo with contact number from env var
  7. On payment failure, guest sees failure card with link back to form

**Plans**: 4/4 plans complete

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Foundation: razorpay package, env vars, lib/razorpay.ts, lib/sheets-write.ts, lib/brevo.ts

**Wave 2** *(blocked on 03-01)*

- [x] 03-02-PLAN.md — Server routes: orders/create, orders/verify, webhooks/razorpay

**Wave 3** *(blocked on 03-02)*

- [x] 03-03-PLAN.md — PaymentSection component + page.tsx integration

**Wave 4** *(blocked on 03-03)*

- [x] 03-04-PLAN.md — Tests: razorpay, sheets, brevo, PaymentSection

### Phase 4: Env-Driven Site Config

**Goal**: Externalize hardcoded site content into `.env` as a single source of truth, read through one central typed config module — a behavior-neutral refactor (empty `.env` renders identically to today).
**Depends on**: Phase 3 (existing app shipped)
**Requirements**: CFG-01, CFG-02, CFG-03, CFG-04, CFG-05, SOC-01, SOC-02, SOC-03, SOC-04, BRND-01, BRND-02, BRND-03, ECPY-01, ECPY-02, MKTG-01, MKTG-02, MKTG-03
**Success Criteria** (what must be TRUE):

  1. With an empty `.env` (no v1.1 vars set), the site renders byte-identically to the current production site — every copy value falls back to its current hardcoded string
  2. Setting a social URL in `.env` makes that icon appear/link correctly; leaving it unset hides the icon entirely (no `href="#"` dead links); WhatsApp is a newly added icon
  3. Changing the brand name in `.env` updates every place it appears (page title, footer, payment UI, confirmation email) from that one value
  4. SEO title/description and confirmation email copy are driven by server-only env (never shipped in the client bundle); a client import of the server config module fails the build
  5. No component reads `process.env` directly — all reads go through `lib/site-config.ts` (public) or `lib/site-config.server.ts` (server-only), and `.env.example` documents every new var with required/optional + `NEXT_PUBLIC_` (⚠redeploy) annotations

**Suggested build order** (plan-level; each step a shippable, behavior-neutral commit):

- **4-01** — Scaffold config modules: `lib/site-config.ts` (public) + `lib/site-config.server.ts` (`import "server-only"`), add `server-only` dep, empty-string-as-missing helpers backed by existing zod, required/optional contract, seed `.env.example` (CFG-01…05)
- **4-02** — Social handles: wire Footer to config, conditional-hide when unset, add WhatsApp icon (SOC-01…04)
- **4-03** — Brand identity + SEO: name + tagline + `app/layout.tsx` metadata via config (BRND-01…03)
- **4-04** — Email copy: `lib/brevo.ts` subject/body/signature via server config module — exercises the `server-only` fence (ECPY-01, ECPY-02)
- **4-05** — Short marketing strings: cities, seat count, hero heading/badge; close out `.env.example` as canonical contract (MKTG-01…03)

**Cross-cutting constraints:**

- Empty string (`""`) is treated as unset everywhere — the v1.0 email incident was a present-but-empty env var
- Each `NEXT_PUBLIC_` var referenced as a single static literal (no computed keys / destructuring — those break browser inlining)
- No secret ever gets a `NEXT_PUBLIC_` prefix; secrets stay in the `server-only` module
- Event date/time/price/location stay in the Google Sheet (out of scope — runtime-editable by design)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Layout & Gallery | 6/6 | Complete   | 2026-07-02 |
| 2. Registration Form | 5/5 | Complete | 2026-07-04 |
| 3. Payment, Sheets & Email | 4/4 | Complete   | 2026-07-12 |
| 4. Env-Driven Site Config | 0/5 | Planning | — |
