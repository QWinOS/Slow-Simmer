# Requirements: Slow Simmer

**Defined:** 2026-07-02
**Core Value:** Guests can register for a Slow Simmer event, pay via GPay UPI, and have their registration automatically recorded in Google Sheets.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Gallery & Media

- [x] **GALL-01**: Photo gallery displays past event images from Google Drive via Drive API
- [x] **GALL-04**: New images added to the Drive folder appear automatically (no code change)
- [ ] **GALL-02**: Video section embeds YouTube videos and Instagram reels
- [x] **GALL-03**: Gallery is mobile-responsive (swipeable / grid adapts to mobile)
- [ ] **GALL-05**: Videos are sourced dynamically at runtime from a Google Sheet of YouTube + Instagram links; new rows appear on the site with no code change or redeploy

### Registration Form

- [ ] **FORM-01**: Guest can enter full name
- [ ] **FORM-02**: Guest can enter contact number
- [ ] **FORM-03**: Guest can enter email address
- [ ] **FORM-04**: Guest can indicate if bringing someone + provide their name & age
- [ ] **FORM-05**: Guest can share 1-2 lines about themselves
- [ ] **FORM-06**: Guest can share Instagram or LinkedIn profile
- [ ] **FORM-07**: Guest can enter Aadhar number
- [ ] **FORM-08**: Form validates required fields before submission
- [ ] **FORM-09**: Form is mobile-friendly with proper touch targets

### Payment

- [ ] **PAY-01**: PhonePe Business UPI payment QR code is displayed after form submission
- [ ] **PAY-02**: Payment confirmation is verified (webhook or polling)
- [ ] **PAY-03**: User sees success/failure feedback after payment

### Google Sheets Integration

- [ ] **SHEET-01**: On successful payment, guest details are inserted into Google Sheets
- [ ] **SHEET-02**: Google Sheet columns include: name, contact, email, guest name & age, about, social links, aadhar, payment status, timestamp
- [ ] **SHEET-03**: Duplicate submissions (same email/contact) are handled gracefully

### Email Notifications

- [ ] **NOTF-01**: On successful payment, send a thank-you email via Brevo API
- [ ] **NOTF-02**: Email body: "You'll receive remaining details within 24 hours. Contact [PHONE] for queries" — phone fetched from env var
- [ ] **NOTF-03**: Email uses a template or inline HTML with supper club branding

### Layout & Responsiveness

- [x] **UI-01**: Single-page layout with smooth scrolling between sections
- [x] **UI-02**: Fully responsive — works on mobile and desktop
- [x] **UI-03**: Clean, elegant design fitting a supper club brand

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

- **ADMN-01**: Admin view to see all registered guests
- **ADMN-02**: Admin can export registrations from the app

## Out of Scope

| Feature | Reason |
|---------|--------|
| User login/authentication | Form-based registration only — no account system needed |
| Multi-event management | Single-page, single event at a time |
| Payment gateway other than PhonePe | PhonePe Business is the established setup |
| Traditional database | Google Sheets suffices for MVP scale |
| Host-side event creation | Events are curated by admin, not created through the app |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GALL-01 | Phase 1 | Complete |
| GALL-02 | Phase 1 | Pending |
| GALL-03 | Phase 1 | Complete |
| GALL-04 | Phase 1 | Complete |
| GALL-05 | Phase 1 | Pending |
| UI-01 | Phase 1 | Complete |
| UI-02 | Phase 1 | Complete |
| UI-03 | Phase 1 | Complete |
| FORM-01 | Phase 2 | Pending |
| FORM-02 | Phase 2 | Pending |
| FORM-03 | Phase 2 | Pending |
| FORM-04 | Phase 2 | Pending |
| FORM-05 | Phase 2 | Pending |
| FORM-06 | Phase 2 | Pending |
| FORM-07 | Phase 2 | Pending |
| FORM-08 | Phase 2 | Pending |
| FORM-09 | Phase 2 | Pending |
| PAY-01 | Phase 3 | Pending |
| PAY-02 | Phase 3 | Pending |
| PAY-03 | Phase 3 | Pending |
| SHEET-01 | Phase 3 | Pending |
| SHEET-02 | Phase 3 | Pending |
| SHEET-03 | Phase 3 | Pending |
| NOTF-01 | Phase 3 | Pending |
| NOTF-02 | Phase 3 | Pending |
| NOTF-03 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-02*
*Last updated: 2026-07-03 — added GALL-05 (dynamic video sourcing from Google Sheet)*
