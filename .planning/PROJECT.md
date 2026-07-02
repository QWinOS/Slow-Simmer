# Supper Club

## What This Is

A single-page, mobile-friendly webapp for a supper club. Guests can browse past event photos/videos, fill out a registration form with their details (name, contact, social links, guest info), pay via PhonePe Business UPI, and have their details recorded in Google Sheets upon successful payment.

## Core Value

Guests can register for a supper club event, pay seamlessly via PhonePe, and have their registration automatically recorded.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Photo gallery of past events (images from Google Drive via Drive API)
- [ ] Video section with YouTube/Instagram reel embeds for past event videos
- [ ] Registration form with: name, contact no, email, guest name & age (if bringing someone), 1-2 lines about yourself, Instagram/LinkedIn, Aadhar no
- [ ] PhonePe Business UPI payment integration (QR code + webhook verification)
- [ ] Google Sheets auto-insert of registration details upon successful payment confirmation
- [ ] Brevo email notification to guest on successful payment (thank-you note, contact number from env var)
- [ ] Mobile-responsive single-page layout

### Out of Scope

- Multi-event management (single-page, single event at a time)
- User login/authentication system (form-based registration only)
- Payment processing beyond PhonePe Business UPI
- Host can create events through the app (events are curated by admin)

## Context

Next.js 16 (App Router) project with React 19, TypeScript, and TailwindCSS v4. Bootstrapped with create-next-app. Will use Google Drive API for photo gallery, Google Sheets API for data storage, PhonePe Business for payments, and Brevo for email notifications.

## Constraints

- **Tech stack**: Next.js 16, React 19, TypeScript, TailwindCSS v4 — already set up
- **Payment**: PhonePe Business UPI only (QR code / payment link + webhook/polling for confirmation)
- **Storage**: Google Drive API for images; YouTube/Instagram embeds for video
- **Data**: Google Sheets as the database (no traditional DB needed for MVP)
- **Cost**: Zero additional spend beyond what's free

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single-page app | Simple, focused use case — one event at a time | — Pending |
| Google Sheets as DB | Free, easy to view/manage registrations, no backend infra | — Pending |
| PhonePe Business UPI | User's existing payment setup, no payment gateway integration needed | — Pending |
| Google Drive API for images | Free, no CDN needed for 10 casual photos, user prefers unified Google setup | — Pending |
| Brevo email notifications | Free tier (300 emails/day), transactional email for payment confirmations | — Pending |

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
*Last updated: 2026-07-02 after initialization*
