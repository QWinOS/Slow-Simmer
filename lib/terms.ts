/**
 * Typed Terms & Conditions data — single source of truth for the T&C page and
 * checkbox label on the registration form.
 *
 * Content is the verbatim copy from the 05-RESEARCH.md copywriting contract.
 * No env-driven values here (the "Last updated" date is a static string per D-06).
 */

export interface TermClause {
  id: string
  title: string
  content: string
}

/** Static display date shown on the T&C page — not env-driven per D-06. */
export const lastUpdated = "July 14, 2026"

export const termsClauses: TermClause[] = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "Welcome to Slow Simmer. By registering for an event, you agree to these Terms & Conditions. Please read them carefully before completing your registration.",
  },
  {
    id: "membership-eligibility",
    title: "2. Membership & Eligibility",
    content:
      "Registration is open to individuals aged 18 and above. Slow Simmer reserves the right to refuse or cancel any registration at its sole discretion. Each registration is for a specific event and does not constitute ongoing membership.",
  },
  {
    id: "event-participation",
    title: "3. Event Participation",
    content:
      "All events are held at private venues disclosed to confirmed guests. Seats are limited and allocated on a first-come, first-served basis. Slow Simmer may update event details (date, time, venue) with reasonable notice.",
  },
  {
    id: "code-of-conduct",
    title: "4. Code of Conduct",
    content:
      "Guests are expected to treat fellow diners, hosts, and staff with respect. Slow Simmer reserves the right to deny entry or ask any guest to leave without refund for behaviour deemed inappropriate, disruptive, or unsafe.",
  },
  {
    id: "payment-refunds",
    title: "5. Payment & Refunds",
    content:
      "Full payment is required at the time of registration to confirm your seat. Refunds are available up to 48 hours before the event. Within 48 hours, payments are non-refundable unless the event is cancelled by Slow Simmer. In case of cancellation by Slow Simmer, a full refund will be issued.",
  },
  {
    id: "liability",
    title: "6. Liability Disclaimer",
    content:
      "Slow Simmer acts as an organiser and is not liable for any loss, damage, injury, or illness arising from attendance at an event. Guests attend at their own risk. Dietary requirements shared during registration are communicated to the venue but cannot be guaranteed.",
  },
  {
    id: "privacy",
    title: "7. Privacy",
    content:
      "The information you provide during registration (name, contact, Aadhar, preferences) is used solely for event coordination, check-in, and communication. Your data is never shared with third parties except as required for event operations (e.g., venue for dietary requirements). Aadhar numbers are used only for in-person verification at check-in.",
  },
  {
    id: "contact-modification",
    title: "8. Contact & Modifications",
    content:
      "These Terms & Conditions may be updated at any time. Changes will be reflected on this page with an updated date. For questions or concerns, reach out to us via Instagram or the contact details provided on our website.",
  },
]
