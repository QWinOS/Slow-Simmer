# Phase 2: Registration Form - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-04
**Phase:** 2-Registration Form
**Areas discussed:** Form layout and field grouping, Conditional guest fields UX, Validation strategy, Aadhar input and privacy, Form-to-payment handoff, Submission UX and feedback

---

## Form Layout and Field Grouping

| Option | Description | Selected |
|--------|-------------|----------|
| Visual sections | Fields grouped into labeled cards (Personal Info, Guest Info, Social Profile) | ✓ |
| Flat form | All fields in a single continuous list | |
| Single column | One field per row, consistent with max-w-lg layout | ✓ |
| Two columns on desktop | Side-by-side on desktop, single on mobile | |
| Card title style | Small heading inside the card, gold accent | ✓ |
| Stepped wizard style | Step 1, Step 2, Step 3 indicators | |
| Aadhar in dedicated section | Separate card for Aadhar | |
| Aadhar in Personal Info | Part of Personal Info section alongside name/contact/email | ✓ |
| One outer card | Single card container with dividers between sections | ✓ |
| One card per section | Each field group in its own card | |
| Full-width button | Button spans the full card width | ✓ |
| Centered button | Button centered but not full-width | |

**User's choice:** Visual sections, single column, card title style, Aadhar in Personal Info, one outer card, full-width button
**Notes:** User requested ui-ux-pro-max skill for form design guidance. Applied form UX best practices (visible labels, required indicators, on-blur validation, aria-live errors, touch targets >= 44px).

---

## Conditional Guest Fields UX

| Option | Description | Selected |
|--------|-------------|----------|
| Checkbox toggle | "Bringing a guest?" checkbox reveals name + age with animation | ✓ |
| Always visible | Guest fields always visible but marked optional | |
| Yes/No radios | "Coming solo" / "Bringing someone" radio buttons | |
| Guest name and age | Both fields displayed when checkbox checked | ✓ |
| Guest name only | Just guest name | |
| Guest fields required | Name and age mandatory when checkbox is checked | ✓ |
| Guest fields optional | Guest fields not mandatory even if checkbox checked | |

**User's choice:** Checkbox toggle, name and age, required when checked
**Notes:** None

---

## Validation Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| On blur | Validate each field when user moves to next field | ✓ |
| On submit only | Validate everything on submit click | |
| Name, contact, email, aadhar required | 4 mandatory fields, rest optional | ✓ |
| All required except social links | Everything mandatory except Instagram/LinkedIn | |
| Inline + summary at top | Error below field AND summary banner at form top | ✓ |
| Inline below field only | Error text below each field only | |
| Strict 10-digit Indian mobile | Validate as `/^[6-9]\d{9}$/` | ✓ |
| Lenient any digits | Accept any numeric input >= 10 digits | |

**User's choice:** On-blur validation, 4 required fields, inline + summary errors, strict Indian mobile format
**Notes:** None

---

## Aadhar Input and Privacy

| Option | Description | Selected |
|--------|-------------|----------|
| Masked with toggle | Dots with eye toggle to reveal | ✓ |
| Plain visible input | Digits visible as typed | |
| Auto-format with spaces | Space after every 4 digits (XXXX XXXX XXXX) | ✓ |
| Plain 12-digit input | Consecutive digits without formatting | |
| Privacy note | Small text below field about usage | ✓ |
| No note | No additional text | |

**User's choice:** Masked with toggle, auto-format with spaces, privacy note
**Notes:** Privacy note text: "Your Aadhar is used only for event check-in"

---

## Form-to-Payment Handoff

| Option | Description | Selected |
|--------|-------------|----------|
| React context | Form data stored in context provider, Phase 3 reads it | ✓ |
| Zustand store | Lightweight state management library | |
| URL params | Encode form data in URL query params | |
| Only after payment (Phase 3) | Google Sheets write happens after payment confirmation | ✓ |
| Store pending on submit | Write pending registration, update status on payment | |

**User's choice:** React context, Google Sheets write only after payment
**Notes:** This defines the integration contract between Phase 2 and Phase 3.

---

## Submission UX and Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Scroll to payment section | After validation, scroll to inline payment section | ✓ |
| Navigate to payment step | Transition to a payment page/step | |
| Spinner on button | Button shows spinner and disables during async validation | ✓ |
| No loading state | Button just submits | |
| Success toast then scroll | Brief checkmark toast then auto-scroll | ✓ |
| Success message inline | Success message replaces form or appears above it | |

**User's choice:** Scroll to payment section, spinner on button, success toast then scroll
**Notes:** None

---

## Agent's Discretion

No areas delegated to agent discretion — all decisions made by user.

## Deferred Ideas

None — discussion stayed within phase scope.
