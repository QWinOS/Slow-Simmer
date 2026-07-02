# Roadmap: Supper Club

## Overview

A single-page, mobile-friendly webapp for a supper club. Guests browse past event photos/videos, fill a registration form, pay via PhonePe Business UPI, and get recorded in Google Sheets with a confirmation email. Built in 3 phases: layout+gallery, then form, then payment+sheets+email.

## Phases

- [ ] **Phase 1: Foundation, Layout & Gallery** - Single-page responsive shell with Google Drive photo gallery and video embeds *(2/4 plans complete)*
- [ ] **Phase 2: Registration Form** - Functional registration form collecting all guest details
- [ ] **Phase 3: Payment, Sheets & Email** - PhonePe payment, Google Sheets logging, and Brevo confirmation email

## Phase Details

### Phase 1: Foundation, Layout & Gallery
**Goal**: Single-page responsive shell with photo gallery and video embeds
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-03, GALL-01, GALL-02, GALL-03, GALL-04
**Success Criteria** (what must be TRUE):
  1. Page renders in a single scrollable layout on mobile and desktop
  2. Past event photos from Google Drive display in a responsive grid
  3. YouTube and Instagram reels embed and play inline
  4. New images added to the Drive folder appear without code changes
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Foundation: theme system, fonts, shadcn components, Drive/video utilities *(complete 2026-07-02)*
- [x] 01-02-PLAN.md — Layout shell: NavBar, static sections (Hero, About, Form, Footer), page.tsx composition *(complete 2026-07-02)*
- [ ] 01-03-PLAN.md — Gallery: Drive API grid with loading/empty/error states + lightbox overlay
- [ ] 01-04-PLAN.md — Video: thumbnail grid with play overlay, inline YouTube/Instagram embeds

### Phase 2: Registration Form
**Goal**: Functional registration form collecting all guest details
**Depends on**: Phase 1
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09
**Success Criteria** (what must be TRUE):
  1. Guest can fill and submit all form fields
  2. Form validates required fields before submission
  3. Form is usable on mobile with proper touch targets
**Plans**: TBD

### Phase 3: Payment, Sheets & Email
**Goal**: PhonePe payment, Google Sheets logging, and Brevo confirmation email
**Depends on**: Phase 2
**Requirements**: PAY-01, PAY-02, PAY-03, SHEET-01, SHEET-02, SHEET-03, NOTF-01, NOTF-02, NOTF-03
**Success Criteria** (what must be TRUE):
  1. Guest sees PhonePe QR after successful form submission
  2. Payment webhook confirms transaction
  3. Guest details appended to Google Sheets on payment success
  4. Guest receives thank-you email via Brevo with contact number from env var
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Layout & Gallery | 2/4 | In Progress | 2026-07-02 |
| 2. Registration Form | 0/0 | Not started | - |
| 3. Payment, Sheets & Email | 0/0 | Not started | - |
