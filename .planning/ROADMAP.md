# Roadmap: Supper Club

## Phase 1 — Foundation, Layout & Gallery

**Goal:** Single-page responsive shell with photo gallery and video embeds.

**Requirements:**
- UI-01: Single-page layout with smooth scrolling
- UI-02: Fully responsive (mobile + desktop)
- UI-03: Clean, elegant supper club branding
- GALL-01: Photo gallery via Google Drive API
- GALL-02: YouTube/Instagram reel embeds
- GALL-03: Mobile-responsive gallery
- GALL-04: New Drive images appear automatically

**Build order:**
1. Next.js page setup + mobile-first layout
2. Hero/section structure (scroll-based navigation)
3. Google Drive API integration (list image files from folder)
4. Photo gallery component (responsive grid)
5. Video embed section (YouTube + Instagram)

---

## Phase 2 — Registration Form

**Goal:** Functional registration form collecting all guest details.

**Requirements:**
- FORM-01 through FORM-09

**Build order:**
1. Form component with all fields
2. Client-side validation (required fields, email format, phone format)
3. Mobile-friendly UX (touch targets, scroll behavior, keyboard handling)
4. Multi-step or single-step form layout decision
5. Form state management + submission handler

---

## Phase 3 — Payment, Sheets & Email

**Goal:** PhonePe payment, Google Sheets logging, and Brevo confirmation email.

**Requirements:**
- PAY-01 through PAY-03
- SHEET-01 through SHEET-03
- NOTF-01 through NOTF-03

**Build order:**
1. PhonePe QR code display + webhook endpoint
2. Google Sheets API integration (append registration row on success)
3. Brevo email API integration (thank-you email)
4. End-to-end flow: submit form → pay → confirm → sheet → email
5. Error handling + retry logic

---

## Summary

| Phase | Focus | Req Count | Dependencies |
|-------|-------|-----------|--------------|
| 1 | Layout, Gallery & Media | 7 | None |
| 2 | Registration Form | 9 | Phase 1 (layout exists) |
| 3 | Payment, Sheets, Email | 9 | Phase 2 (form data to submit) |
