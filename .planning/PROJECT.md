# Slow Simmer

## What This Is

A single-page, mobile-friendly webapp for Slow Simmer. Guests can browse past event photos/videos, fill out a registration form with their details (name, contact, social links, guest info), pay via GPay UPI, and have their details recorded in Google Sheets upon successful payment.

## Core Value

Guests can register for a Slow Simmer event, pay seamlessly via GPay UPI, and have their registration automatically recorded.

## Current Milestone: v1.2 Terms & Conditions

**Goal:** Add a dedicated Terms & Conditions page and require guests to explicitly agree before submitting registration.

**Target features:**
- New `/terms` route displaying full T&C text
- Registration form requires "I agree to the Terms & Conditions" checkbox with link to `/terms`
- Zod schema updated to validate checkbox acceptance
- Styled to match existing brand

## Requirements

### Validated

_Shipped in v1.0 (Phases 1–3):_

- [x] Photo gallery of past events (images from Google Drive via Drive API)
- [x] Video section with YouTube/Instagram reel embeds (sourced dynamically from a Google Sheet)
- [x] Registration form with: name, contact no, email, guest name & age, about, Instagram/LinkedIn, Aadhar no
- [x] Razorpay UPI payment integration (Order API + Checkout + webhook signature verification)
- [x] Google Sheets auto-insert of registration details upon successful payment confirmation
- [x] Brevo email notification to guest on successful payment (contact number from env var)
- [x] Mobile-responsive single-page layout

### Active

- [ ] Guest can view full Terms & Conditions at `/terms` route
- [ ] Registration form displays link to T&C page
- [ ] Guest must check "I agree to the Terms & Conditions" before submitting
- [ ] Form submission is blocked if checkbox is unchecked

### Out of Scope

- Multi-event management (single-page, single event at a time)
- User login/authentication system (form-based registration only)
- Payment processing beyond Razorpay UPI
- Host can create events through the app (events are curated by admin)
- Live-editable (no-redeploy) browser config — `NEXT_PUBLIC_` env vars are build-time; runtime-editable content stays in the Google Sheet

## Context

Next.js 16 (App Router) project with React 19, TypeScript, and TailwindCSS v4. Bootstrapped with create-next-app. Will use Google Drive API for photo gallery, Google Sheets API for data storage, PhonePe Business for payments, and Brevo for email notifications.

## Constraints

- **Tech stack**: Next.js 16, React 19, TypeScript, TailwindCSS v4 — already set up
- **Payment**: Razorpay UPI (Order API + Checkout modal + webhook HMAC verification)
- **Storage**: Google Drive API for images; YouTube/Instagram embeds for video
- **Data**: Google Sheets as the database (no traditional DB needed for MVP)
- **Cost**: Zero additional spend beyond what's free

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page app | Simple, focused use case — one event at a time | — Pending |
| Google Sheets as DB | Free, easy to view/manage registrations, no backend infra | — Pending |
| Razorpay UPI (was PhonePe) | Simpler Order+Checkout+webhook flow; UPI-only checkout | ✓ Shipped v1.0 |
| Google Drive API for images | Free, no CDN needed for 10 casual photos, user prefers unified Google setup | ✓ Shipped v1.0 |
| Brevo email notifications | Free tier (300 emails/day), transactional email for payment confirmations | ✓ Shipped v1.0 |
| Env-driven site config (v1.1) | Single `.env` source of truth for social/brand/copy via a central typed module | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-14 — started milestone v1.2 Terms & Conditions*
