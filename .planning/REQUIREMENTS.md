# Requirements: Slow Simmer

**Defined:** 2026-07-14
**Core Value:** Guests can register for a Slow Simmer event, pay seamlessly via GPay UPI, and have their registration automatically recorded.

## v1 Requirements

### T&C Page

- [ ] **TC-01**: Guest can view the full Terms & Conditions at a dedicated `/terms` route
- [ ] **TC-02**: T&C page follows brand styling (typography, palette, layout consistency with the main page)

### Registration Form

- [ ] **TC-03**: Registration form displays a visible link to the T&C page
- [ ] **TC-04**: Guest must check "I agree to the Terms & Conditions" before submitting
- [ ] **TC-05**: Form submission is blocked if the T&C checkbox is unchecked

## v2 Requirements

### Env-Driven Site Config

- **CFG-01**: Social media handles driven by env (deferred from v1.1)
- **CFG-02**: Brand identity driven by env (deferred from v1.1)
- **CFG-03**: Email copy driven by env (deferred from v1.1)
- **CFG-04**: Marketing copy driven by env (deferred from v1.1)
- **CFG-05**: Central typed site-config module (deferred from v1.1)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Env-driven site config | Deferred — skipping v1.1, may revisit in future milestone |
| Editable T&C via admin panel | Static page is sufficient; content changes require a deploy |
| T&C versioning or history | Not needed for current scale |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TC-01 | Phase 5 | Pending |
| TC-02 | Phase 5 | Pending |
| TC-03 | Phase 5 | Pending |
| TC-04 | Phase 5 | Pending |
| TC-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-14*
*Last updated: 2026-07-14 after initial definition*
