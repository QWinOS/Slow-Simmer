# Pitfalls Research

**Domain:** Supper club / community dining / event hosting platform
**Researched:** 2026-07-02
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: No-Show Epidemic — Treating RSVPs as Commitments

**What goes wrong:**
Guests RSVP "yes" but never show up. No-show rates for free events consistently hit 30–50%, and supper clubs are especially vulnerable because they're social/intimate events where hosts prepare specific amounts of food. A host who preps for 12 but only 7 arrive wastes food, money, and trust. Conversely, hosts sometimes overbook to compensate and end up overwhelmed when everyone does show.

**Why it happens:**
- The "soft yes" culture — social RSVPs carry zero accountability. Guests click "going" to keep options open.
- Free events have no financial stake. Studies show free events have 50%+ higher no-show rates than paid ones.
- No consequences for no-shows. Unlike restaurants that can charge a no-show fee, supper clubs are peer-to-peer, making enforcement socially uncomfortable.
- RSVPs happen days/weeks before the event; life gets in the way, and guests forget to cancel.

**How to avoid:**
- Require a deposit or prepayment model from day one — even a small amount ($5–15) dramatically increases commitment. Research shows deposits reduce no-shows by 60–80%.
- Build a reputation/trust score system tied to attendance history. Guests with low reliability scores get lower priority.
- Implement automated reminder sequences (48h, 24h, 2h before) with a simple cancellation link.
- Make cancellation easy — counterintuitively, friction-free cancellation reduces ghosting because guests actually cancel instead of just not showing.
- Track no-show rates per user and surface it to hosts during RSVP review.

**Warning signs:**
- RSVP count is consistently higher than actual attendance by 20%+ at events
- Hosts complain about wasted food or empty seats after confirming headcount
- Waitlisted guests never convert because the queue moves too slowly (bottleneck: people who RSVP'd "yes" but won't attend don't cancel — they just don't show)

**Phase to address:**
Phase 1 (Event Creation + RSVP core) — must include deposit/confirmation mechanism and reminder automation from the start. Cannot be added later as an afterthought; retrofitting no-show protection is harder than building it in.

---

### Pitfall 2: Location Privacy Disaster — Exposing Hosts' Home Addresses

**What goes wrong:**
Supper clubs are often hosted in private homes. The platform reveals the host's home address to every guest who RSVPs. This creates serious safety, stalking, and harassment risks. One bad guest can ruin the experience and make the host feel unsafe in their own home. If the location is exposed before the event, uninvited people may show up.

**Why it happens:**
- Simple CRUD mindset: "event has an address field, display it." No thought about access control.
- Assuming all events are in public venues (restaurants, community halls) when many supper clubs are intimate home gatherings.
- Treating location like any other event detail rather than sensitive personal data.
- Building for the happy path (trusted guests) and ignoring the adversarial path.

**How to avoid:**
- Implement a **tiered location reveal system**:
  - **Browse/Discovery phase:** Show only neighborhood or general area (e.g., "Williamsburg, Brooklyn") — not the full address.
  - **After RSVP confirmation:** Show full address only to confirmed guests, within a reasonable window before the event (e.g., 24–48 hours before).
  - **After event ends:** Remove location access or archive it.
- Allow hosts to choose their privacy level per event:
  - **Public venue** — show address immediately
  - **Private home** — reveal only after RSVP + host approval
  - **Secret supper club** — invite-only, address revealed only to manually approved guests
- Never show the host's home address on public pages, search results, or to non-RSVPd users.
- Add a "share my location" toggle for guests too — some guests may not want their dietary info or attendance linked to their real name.

**Warning signs:**
- Event listing shows a street address in search results / browse view
- No distinction between "public venue" and "private home" event types
- Location is visible to users who haven't RSVP'd yet
- No mechanism to report safety concerns about a guest to the host

**Phase to address:**
Phase 1 (Event Creation + Discovery) — the location model, access control tiers, and privacy settings must be architected from the first schema decisions. Retrofitting privacy into an existing "event.address" field is painful and risky.

---

### Pitfall 3: Dietary Restriction Liability — Collecting Without Acting

**What goes wrong:**
Guests submit dietary restrictions (allergies, intolerances, preferences) but the platform has no mechanism to ensure the host sees or acts on them. A guest with a peanut allergy attends, assumes their needs were communicated, the host didn't check, and a medical emergency occurs. The platform faces liability for collecting sensitive health data without ensuring it reaches the right person.

**Why it happens:**
- Feature checklist mentality: "We need dietary preference fields on the RSVP form." Built without thinking about the downstream workflow.
- Assuming hosts will manually check dietary restrictions before the event — but hosts are busy cooking and might not.
- Treating dietary info as "nice to have" rather than a safety-critical data handoff.
- No audit trail — if something goes wrong, there's no record of whether the host viewed the information.

**How to avoid:**
- Make dietary restrictions a **structured data field** (not free text) with known allergens as checkboxes plus an "other" field. This prevents guests from writing a novel that gets ignored.
- Require hosts to **acknowledge** dietary restrictions before the event — e.g., a checklist in the host dashboard: "You have 3 guests with dietary restrictions. Mark each as 'Reviewed' or 'Need more info.'"
- Send a consolidated dietary summary to the host at a configurable interval before the event (24h before, with the final guest list).
- For severe allergies, implement a **mandatory acknowledgment flow**: the host cannot mark the event as "ready" without reviewing dietary needs.
- Consider medical liability: include a disclaimer that the platform is a communication tool, not a safety verificator. But don't rely on disclaimers alone — build the workflow.
- GDPR/health-data considerations: allergy information is sensitive health data. Store it encrypted, with access controls, and a retention policy.

**Warning signs:**
- Dietary restrictions are collected only as free-text fields in the RSVP form
- No dashboard view showing hosts a summary of dietary needs per event
- No acknowledgment mechanism — guests submit, but nobody confirms receipt
- No separation between "preference" (vegan) and "medical necessity" (peanut allergy)

**Phase to address:**
Phase 2 (Guest experience + RSVP management) — dietary collection and the host-acknowledgment workflow need to be built together. Don't launch RSVP without the dietary workflow.

---

### Pitfall 4: Waitlist That Never Converts — Broken Backfill Mechanics

**What goes wrong:**
Event fills up, waitlist activates, guests join it. But when a spot opens (someone cancels), the system doesn't automatically promote the next person on the waitlist. Or the notification goes out too late, the waitlisted guest has already made other plans, and the spot goes empty. Waitlist becomes a dead-end feature that frustrates everyone.

**Why it happens:**
- Waitlist is built as a simple "email me if spots open" flag rather than a ranked queue with automatic promotion.
- No real-time notification mechanism — waitlisted guests are notified via email hours later, by which time they've moved on.
- No expiration on the offer — the system sends a notification but doesn't enforce a response window, so spots are held indefinitely.
- Manual promotion requires the host to manage the waitlist themselves, which they won't do while cooking/preparing for the event.
- No distinction between "someone cancelled and a spot opened" vs. "we overbooked and need to reduce" — these require different logic.

**How to avoid:**
- Build a **real-time automatic promotion system**: when someone cancels, the first waitlisted person is automatically offered the spot with a time-limited confirmation window (e.g., 30–60 minutes).
- If the first person declines or doesn't respond within the window, automatically move to the next.
- Send notifications via multiple channels: push notification, email, SMS (SMS has the highest conversion for time-sensitive offers).
- Show waitlist position to the guest so they know where they stand and can decide whether to wait.
- Allow guests to set preferences: "Notify me only if a spot opens within 48 hours of the event" — prevents late-night notifications that get ignored.
- Track waitlist-to-RSVP conversion rate as a metric. If it's below 30%, the waitlist mechanics are broken.

**Warning signs:**
- Waitlisted guests report never being notified even though spots opened
- Hosts are manually managing waitlist conversions via direct messages
- Waitlist count is high but event attendance remains below capacity
- No automatic backfill when a guest cancels

**Phase to address:**
Phase 2 (Guest experience + RSVP management) — waitlist logic is deeply tied to RSVP capacity management and cannot be effectively layered on later.

---

### Pitfall 5: Ghost Events — Abandoned Events Clogging Discovery

**What goes wrong:**
A host creates an event, it appears in search/discovery, but they never finalize it — no menu posted, no confirmation sent. The event lingers in an "unconfirmed" or "draft" state for weeks, confusing guests who see it and wonder if it's happening. Worse: an event that happened last week is still showing as "upcoming" because there's no completion flow.

**Why it happens:**
- Events are created in a single step with no completion pipeline.
- No distinction between "draft," "published," "confirmed," "happening now," and "completed" states.
- No event lifecycle — once created, it just exists forever until manually deleted.
- No automatic cleanup of stale events.
- The browse/discovery page shows everything with a future date, including events that the host has abandoned.

**How to avoid:**
- Design an explicit **event lifecycle** with clear states:
  - `Draft` — not visible to guests
  - `Published` — visible, accepting RSVPs
  - `Confirmed` — host has finalized details (menu, headcount)
  - `Full` — at capacity, waitlist active
  - `In Progress` — event is happening now
  - `Completed` — event has passed
  - `Cancelled` — host cancelled
- Auto-archive events 24 hours after their end time.
- Require minimum event detail threshold before an event becomes visible in search (menu, date/time confirmed, at least one photo or description).
- Implement a stale-event detection job: events that are "Published" but have no RSVPs after 7 days get flagged for review.
- Add "has this event happened?" auto-detection: if the event date has passed without a completion action, prompt the host to mark it complete or cancel.

**Warning signs:**
- Browse page shows events from weeks ago that never happened
- Hosts create events and never return to complete the details
- Users report confusion about whether an event is actually happening
- No way to distinguish between "event is tomorrow and confirmed" vs. "event was created two weeks ago with no updates"

**Phase to address:**
Phase 1 (Event Creation + Discovery) — the event lifecycle states and completion flow must be in the initial data model.

---

### Pitfall 6: Host-Guest Communication Silos — Off-Platform Fragmentation

**What goes wrong:**
The platform has no built-in messaging or communication system. Hosts and guests take communication off-platform (WhatsApp, text, email). Event updates, cancellations, and coordination happen in scattered channels. Guests miss critical updates because they checked the wrong app. Hosts lose track of who's been told what. When something goes wrong, there's no proof of communication.

**Why it happens:**
- Building a messaging system is perceived as "too complex" — deferring it to "later."
- Assuming email is sufficient. It's not — email open rates for event-related messages average 20–30%.
- Not realizing that communication IS the product for a social platform. Supper clubs are about connection; if you can't communicate, you're just a calendar.
- Fear of building a chat system that becomes a moderation nightmare (harassment, spam).

**How to avoid:**
- Build a **lightweight, constrained communication system**, not a full chat app:
  - **Broadcasts (host → all confirmed guests):** Host can send announcements. Track read receipts (at minimum: delivered vs. opened).
  - **Event discussion board:** Simple thread per event where confirmed guests can post. Optional: host can moderate.
  - **Direct host-guest messaging:** For specific inquiries (dietary, timing, etc.). Enable reporting/blocking.
  - **System-generated notifications:** Automated confirmations, reminders, waitlist promotions, cancellation alerts — these are non-negotiable.
- Keep communication in-platform but send push/email summaries so guests don't need to check constantly.
- Never expose personal contact info (phone, email) automatically — let host choose if/when to share.
- Moderation: start with simple tools (report user, host can remove guest from event). Full moderation can come later, but a report mechanism must exist.

**Warning signs:**
- Hosts' RSVP confirmation messages include "text me at [phone number]"
- Guests ask questions about events in public social media comments because the platform has no Q&A
- Event cancellation communication relies on hosts manually emailing each guest
- No record of whether guests received important updates

**Phase to address:**
Phase 2 (Guest experience + RSVP management) — at minimum, system notifications (confirmations, reminders) must be in Phase 1. Two-way communication can be Phase 2 but must be planned for in the data model.

---

### Pitfall 7: Capacity Concurrency Failures — Overlapping Events at the Same Venue/Host

**What goes wrong:**
A host creates two events at the same time (intentionally or accidentally). The platform allows it because there's no concurrency check. Guests RSVP to both, expecting both to happen. The host can't be in two kitchens at once. Or: a host's venue space has a real capacity of 20 but two events are listed with caps of 15 each, totaling 30.

**Why it happens:**
- No validation on event creation that checks for time overlap per host.
- "Event" is treated as independent — no relationship between events and host availability.
- Venue capacity is stored as a property of the event rather than the venue/location.
- No constraint that `sum(event capacities) <= venue capacity` for overlapping time windows.

**How to avoid:**
- Implement a **host availability schedule**: hosts define when they're available to host. Events are created within availability slots.
- Block overlapping events for the same host: if a host has an event at 7 PM Saturday, they cannot create another event that overlaps (accounting for setup and cleanup buffer, e.g., 2 hours before/after).
- If the venue is a specific location (rather than "my home"), tie events to a venue with a hard capacity cap. Enforce `sum(RSVPs for overlapping events) <= venueCapacity`.
- For recurring events (e.g., "every Saturday"), validate all instances don't conflict.
- Show a calendar view to hosts during event creation so they can see existing commitments.

**Warning signs:**
- A host has two events scheduled with overlapping times
- Platform allows two events at the same venue at the same time
- Guests receive conflicting information about which event is happening when
- Hosts complain about double-booking themselves

**Phase to address:**
Phase 1 (Event Creation) — concurrency validation must be in the event creation flow. It's a data integrity constraint, not a feature addition.

---

### Pitfall 8: One-Size-Fits-All Event Types — Ignoring Different Formats

**What goes wrong:**
The platform treats all events as the same type: a host, a menu, a date, a guest list. But supper clubs come in many formats:
- Intimate dinners (4-6 people, private home)
- Potlucks (everyone brings a dish)
- Cooking classes (host teaches)
- Pop-up restaurants (host charges a fee)
- Tasting menus (fixed menu, multiple seatings)
- Community feasts (large, shared tables)

Building a rigid event model excludes valid use cases and forces hosts into a template that doesn't fit their event.

**Why it happens:**
- Simplifying the data model to get to MVP faster.
- Not researching the variety of real-world supper club formats.
- Assuming all events follow the "restaurant reservation" pattern.
- Not talking to actual supper club hosts before building.

**How to avoid:**
- Start with a **flexible event model** that accommodates common variations:
  - `capacityType`: "per-person" (standard) vs. "per-group" (potluck, where each guest contributes)
  - `pricingType`: "free", "suggested donation", "pay-what-you-can", "fixed price" (storing as metadata, not processing payments initially)
  - `format`: "dinner", "brunch", "potluck", "class", "feast"
  - `seatings`: single vs. multiple (for timed menus)
- Keep it flexible but not abstract — define these as enums with known values. Avoid a generic "attributes" JSON blob.
- Plan for future payment processing: design the pricing model so it's clean to extend when payment integration arrives.
- Let hosts tag their events with multiple attributes (dietary focus, cuisine type, vibe).

**Warning signs:**
- Hosts ask "can I set this event format?" and the answer is no
- Events are being created outside the platform because it doesn't support the host's format
- The form forces hosts into fields that don't apply (e.g., "menu price" for a potluck)
- Support requests are mostly about "my event doesn't fit the template"

**Phase to address:**
Phase 1 (Event Creation) — design the schema for flexibility early. Adding new event types later is easy; changing the core schema is hard.

---

### Pitfall 9: RSVP Over-Counting — Plus-One and Group Mismanagement

**What goes wrong:**
Guest RSVPs say "I'm bringing 2 guests" but the system counts it as 3 RSVPs total, or conversely counts it as 1 RSVP (the primary guest) and ignores the plus-ones. The capacity calculation is wrong in both directions. Small errors compound: if 5 guests all bring +1s that aren't counted, the event goes from 10 to 15.

**Why it happens:**
- Simple RSVP model: `RSVP { user, event, status }` — no concept of group or plus-one.
- Treating "guest count" as a note in a text field rather than a structured integer.
- Not validating that `RSVP guest count + existing RSVPs <= event capacity`.
- No distinction between "guest" and "plus-one" in the data model — plus-ones are invisible users with no profile, no dietary info, and no way to contact them.

**How to avoid:**
- Model RSVPs with an explicit `guestCount` integer field and a `plusOnes` array (for named +1s with their own preferences).
- Validate capacity at RSVP time: `sum(guestCount for all accepted RSVPs) <= event.capacity`.
- Allow hosts to set per-event plus-one policy: "no plus-ones," "max 1 per guest," "unlimited."
- For plus-ones, require at minimum a name so the host knows who's coming. Optionally collect dietary restrictions per plus-one.
- Show the "true headcount" (sum of all guests including plus-ones) prominently in the host dashboard, not just the number of RSVP responses.

**Warning signs:**
- Hosts report "I had 12 RSVPs but 18 people showed up"
- The RSVP form has no "+1" option; guests write "+1" in a comment field
- Plus-ones have no way to specify dietary restrictions
- Capacity is checked against RSVP count, not headcount

**Phase to address:**
Phase 1 (Event Creation + RSVP core) — the RSVP data model must include guest count and plus-one support from the start. Migrating from single-guest to multi-guest RSVPs is a painful schema migration.

---

### Pitfall 10: Trust & Safety Vacuum — No Guardrails for a Peer-to-Peer Dining Platform

**What goes wrong:**
A guest behaves inappropriately (harassment, no-show, theft), a host cancels last minute leaving guests stranded, or someone misrepresents their event. Without a trust & safety layer, there's no recourse, no reporting mechanism, and no ability to protect the community. Bad actors erode trust and the platform dies.

**Why it happens:**
- Assuming everyone is well-intentioned (the "community will self-police" fallacy).
- Building for the transaction (RSVP, attendance) without building the relationship layer.
- Reluctance to implement "negative" features like reporting, blocking, and banning.
- Fear that moderation is too complex or requires a full-time team.
- Deferring safety to "v2" — but one incident can kill a community.

**How to avoid:**
- Build a **reputation system**: after each event, both host and guests can rate/review each other (privately at first, optionally public). Focus on reliability metrics: "on time," "courteous," "followed dietary needs."
- **Reporting system** from day one: report a user for harassment, spam, no-show, misrepresentation. Even if it's just a notification to you (the platform operator) at first, the button must exist.
- **Two-sided verification**: phone number and/or social login for all users. Verified badge for users who complete a more thorough check.
- **Host insurance / cancellation policy**: if a host cancels within 24 hours of the event, what happens? The platform needs a policy (even if "we'll notify guests and help coordinate" — not financial yet).
- **Block list**: hosts and guests can block each other. Blocked users cannot see each other's events or RSVP.
- **Shadow mode** for moderation: new users' events or RSVPs may not be visible to others until approved, for the first few events.
- **Incident response plan**: a documented (even if simple) plan for what happens when someone reports harassment or a safety issue.

**Warning signs:**
- No way to report a problematic user from the UI
- Hosts vet guests manually via external social media because the platform doesn't provide trust information
- No consequence for serial no-shows or last-minute cancellations
- Users express discomfort about attending events with strangers
- First bad incident has no clear response protocol

**Phase to address:**
Phase 1 (Foundation) — basic trust (verification) and safety (reporting) must be in Phase 1. Reputation system can be Phase 3. Do not launch Phase 1 without a report button.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Free-text dietary field instead of structured allergen schema | Faster form development | Impossible to summarize, analyze, or alert on allergies. Liability risk. | Never — structured dietary data is a safety requirement |
| Event address stored as plain string with no privacy tiers | Simple data model | Exposing host's home address is a privacy violation. Painful migration later. | Never — privacy is non-negotiable |
| RSVP as simple yes/no with no guest count | Fast MVP delivery | System undercounts headcount. Overcapacity events. Unhappy hosts. | Only for first internal prototype. Must fix before any real event. |
| No event lifecycle (just a "created" timestamp) | No state machine to build | Ghost events, confusion about event status, no completion flow. | Never — state is cheap to design upfront, expensive to retrofit |
| Guest messages sent via email only | No chat system to build | Low open rates, fragmented communication, off-platform migration. | Only for Phase 1 system notifications. Phase 2 must add in-platform messaging. |
| Single event type model with no format flexibility | Simpler schema | Hosts can't express their event format. Workaround: free-text description. | Acceptable in Phase 1 if schema supports extensibility (enums, not free-form). |
| Capacity validation client-side only | Faster initial UX | Race conditions when two guests RSVP simultaneously. Overcapacity events. | Never — always validate server-side with proper locking or optimistic concurrency. |
| No email/SMS infrastructure, "we'll handle it manually" | Zero infrastructure cost | Hosts manually reach out. No automated reminders. Higher no-show rates. Fragmented communication. | Only for the most basic prototype. Must add before any real event with real guests. |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Calendar sync (Google Calendar, iCal, Outlook) | Embedding full address in calendar invite description, exposing it to anyone who can view the guest's calendar | Use location tiers: include only neighborhood for private events, full address for public venues. Add event-specific notes without sensitive data. |
| SMS notifications (Twilio, etc.) | Sending all notifications via SMS without opt-in, incurring costs and annoying users | Let users choose notification channels per type (reminder = SMS + email, general = email only). Implement opt-in per channel. |
| Map/geocoding (Google Maps, Mapbox) | Showing exact pin location on a map for private home events | Show approximate area (city, neighborhood) only. Never show exact coordinates for home events. |
| Payment processing (Stripe, etc. — future) | Building payment integration tightly coupled to a single provider | Abstract payment behind an interface from day one. Even if you only use Stripe, design so you can swap later. |
| Email delivery (Resend, SendGrid, etc.) | Relying on transactional email for all communication (reminders, confirmations, conversations) | Email for reminders/confirmations only. Real-time communication needs push notifications or in-app messaging. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| N+1 queries on RSVP list: loading each guest's profile individually | Dashboard load time increases linearly with guest count | Eager-load guest profiles with RSVPs. Use `include` or `join` instead of separate queries per guest. | 50+ RSVPs per event |
| Full table scan for event discovery (no geo-indexed search) | Browse/search page gets slower as event count grows | Use PostGIS or similar for geospatial queries. Add pagination and filters. | 1,000+ events in the database |
| Naive capacity check (SELECT count + compare in app code) | Two users RSVP simultaneously both pass validation; event overfills | Use database-level constraints or atomic operations (e.g., `UPDATE ... SET count = count + 1 WHERE count < capacity AND returning 1`). | First concurrent RSVP race condition |
| Loading all events into memory for the calendar view | Calendar page load time grows with total events | Limit query to date range + user-relevant events. Implement cursor-based pagination instead of offset. | 500+ active events |
| No caching on event detail pages | High database load when event is promoted on social media | Implement HTTP caching (CDN) for public event pages, or ISR (Incremental Static Regeneration) in Next.js. | Viral event gets thousands of views in minutes |
| Polling for real-time updates (guest list changes) | Excessive API calls, battery drain on mobile | Use WebSockets or Server-Sent Events for live updates to RSVP status, waitlist position changes, etc. | 50+ concurrent users watching an event |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing host's home address to unauthenticated users / search engines | Stalking, harassment, unwanted visitors. Host's home address becomes public. | Tiered location reveal. Never serve full address in HTML that search engines can index. Use `noindex` on event pages until RSVP phase. |
| Collecting dietary restrictions as sensitive health data without encryption | GDPR/HIPAA liability if breached. Guest learns about another guest's medical conditions via data leak. | Store dietary/health data encrypted at rest. Implement strict access control (only the host for that event can view). Auto-delete after event retention period. |
| RSVP verification lacking (anyone can RSVP for anyone else) | Someone RSVPs maliciously as another user, filling the event with fake attendees | Require authentication for RSVP. Validate user identity. Consider email verification for new users before they can RSVP. |
| No rate limiting on RSVP endpoints | Bot can RSVP thousands of times, filling event capacity instantly | Rate-limit per user per event. Add CAPTCHA for rapid RSVP patterns. |
| User-to-user messaging without abuse reporting | Harassment happens in-platform with no recourse | Implement report/block from day one. Scan for phone numbers/email addresses to prevent off-platform contact harvesting. |
| No host verification before publishing events | Anyone can create a "supper club" event that's actually a scam or dangerous meetup | Require phone verification + at least one public event before a host can create private/home events. For public venues, less verification needed. |
| Guest list visible to all other guests | Privacy-conscious guests feel exposed. Makes it easy for unwanted people to know when someone will be away from home. | Only show guest names if the host chooses to. Default to "guest count only" (e.g., "12 guests attending"). |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Overwhelming RSVP form (too many fields) | Users abandon the RSVP mid-flow. Critical data (dietary restrictions) isn't collected. | Multi-step form: Step 1: yes/no + guest count. Step 2 (conditional): dietary restrictions, questions, notes. Step 3: confirmation. |
| No mobile-optimized event creation | Hosts create events on phones. A clunky mobile form means fewer events. | Build event creation mobile-first. Use native date pickers, inline validation, and save-as-draft. |
| Host dashboard shows raw data, not actionable info | Hosts have to manually count, calculate, and cross-reference guest lists | Surface: "5 guests confirmed (including 2 plus-ones), 3 pending, 1 dietary restriction unread." Single source of truth, not a spreadsheet. |
| Cancellation requires contacting the host (no self-service) | Guests feel awkward canceling. They don't cancel, they just no-show. | Allow self-service cancellation up to a host-defined deadline. Send automatic notification to host. |
| Event discovery is a chronological list with no filters | Guests scrolling through irrelevant events (wrong date, wrong area, wrong cuisine) | Filter by: date range, location (distance), cuisine type, dietary focus, price range, format. Sort by date, popularity, or "for you." |
| No "save for later" / bookmarking | Guest sees an interesting event but isn't ready to RSVP. They lose it and can't find it again. | Save/bookmark events. Notify user when the event is close to filling up or the RSVP deadline approaches. |
| Host sets a capacity but doesn't understand how plus-ones count | Host thinks capacity is 10 = 10 people, but 5 guests with +1s = 10. Host is confused about the math. | Clearly separate "spots remaining" from "people confirmed." Show both. Example: "Spots: 4 of 10 filled (7 people: 5 guests + 2 plus-ones)." |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **RSVP system:** Looks done when a user can click "going." Not done until it handles: guest count, plus-ones, dietary collection, cancellation flow, waitlist backfill, and automated reminders.
- [ ] **Event creation form:** Looks done when a host can fill in fields and save. Not done until it validates: no overlapping events, capacity includes plus-ones, location privacy tier is chosen, and event lifecycle state transitions are clear.
- [ ] **Guest list display:** Looks done when the host sees names. Not done until it shows: dietary summary, true headcount (not just RSVP count), contact info (controlled), and RSVP status per guest.
- [ ] **Event discovery:** Looks done when events display in a list. Not done until: stale/ghost events are filtered out, location is approximate (not exact for private events), capacity status is clear, and filters work.
- [ ] **Location field:** Looks done when it stores an address. Not done until: privacy tiers exist, address is not indexed by search engines, map pins are approximate for home events, and the host can choose when to reveal it.
- [ ] **Waitlist:** Looks done when guests can join a list. Not done until: automatic promotion on cancellation, time-limited offer window, multi-channel notification, and fallback to next-in-line on decline.
- [ ] **User profile:** Looks done when it has name and bio. Not done until: dietary preferences/preferences (for hosts), trust/reputation signals, verification status, and block list.
- [ ] **Mobile responsiveness:** Looks done when pages render on mobile. Not done until: RSVP form works on mobile (no horizontal scroll, proper input sizing), event creation flows work on mobile, notifications work as expected.
- [ ] **Event completion:** Looks done when the event end date passes. Not done until: host is prompted to mark complete, guests can leave feedback, and the event is automatically archived after 24 hours.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Host address exposed publicly | MEDIUM — the address is already out there | 1. Immediately remove the address from public pages. 2. Contact affected host, apologize. 3. Implement the privacy tier system in the next deploy. 4. Add a site-wide notice that addresses have been secured. |
| No-show epidemic (50%+ rate) | MEDIUM — lost trust, wasted food | 1. Implement deposit/prepayment for future events. 2. Add automated reminder sequence (48h, 24h, 2h). 3. Enable easy cancellation with one tap. 4. Publicize the new reliability measures to restore host trust. |
| Overcapacity event (more guests confirmed than capacity) | HIGH — angry guests, safety issue | 1. Immediately notify host. 2. Contact overbooked guests, offer priority for next event. 3. Fix the RSVP validation bug (likely race condition or plus-one accounting). 4. Add database-level capacity constraint. |
| Harassment/bad actor incident | HIGH — community trust erosion | 1. Ban the offending user immediately. 2. Support the affected user, offer to help them report to authorities if needed. 3. Conduct a trust & safety audit. 4. Implement reporting and blocking if not already in place. 5. Communicate transparently with the community about what happened and what changed. |
| Off-platform communication fragmentation | LOW (per-event) to HIGH (systemic) | 1. Build in-platform messaging/notifications. 2. Encourage hosts to use platform tools (show them the convenience). 3. Add platform-generated confirmation numbers so guests can verify events are real. |
| Database capacity race condition on RSVP | MEDIUM — one-time overfill | 1. Refund/compensate overbooked guests. 2. Migrate to atomic capacity checks (optimistic locking or DB constraint). 3. Add monitoring for capacity edge cases. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| No-show epidemic (P1) | Phase 1: Deposit/commitment mechanism + automated reminders | No-show rate < 20% after implementation. Confirm guests receive reminder sequence. |
| Location privacy (P2) | Phase 1: Tiered location reveal model | Home addresses never visible publicly. Only confirmed guests see full address 24h before event. |
| Dietary restriction liability (P3) | Phase 2: Structured dietary data + host acknowledgment flow | Host must acknowledge dietary restrictions before event. Allergy data is encrypted and access-controlled. |
| Waitlist never converts (P4) | Phase 2: Automatic promotion + time-limited offers | Waitlist conversion rate > 40%. Offers expire after configurable window and auto-promote next. |
| Ghost events (P5) | Phase 1: Event lifecycle states + stale event detection | No "published" events in browse that are older than 7 days with zero RSVPs. All events complete lifecycle. |
| Host-guest communication silos (P6) | Phase 2: In-platform notifications + broadcasts | Host can send announcements to confirmed guests. Cancellation notices reach all affected guests within minutes. |
| Capacity concurrency failures (P7) | Phase 1: Overlapping event validation per host | Host cannot create overlapping events. Validation enforced at database level. |
| One-size-fits-all event types (P8) | Phase 1: Flexible event model with format enums | Different event types (dinner, potluck, class) can be created without workaround. |
| RSVP over-counting (P9) | Phase 1: Guest count + plus-one model in RSVP schema | True headcount (primary + plus-ones) is always used for capacity and display. |
| Trust & safety vacuum (P10) | Phase 1: Reporting + verification. Phase 3: Reputation system | Report button exists from launch. Serial no-shows have consequences. Trust scores visible. |

## Sources

- **No-show research:** Glue Up (2025) — no-show rates for free events; RestaurantBookings (2026) — deposit effectiveness; UpSalt (2025) — no-show prevention strategies; Checkless (2026) — restaurant no-show industry statistics, 60–80% deposit reduction
- **Privacy concerns:** InEvent (2025) — false confidence from RSVPs; social etiquette of location sharing (NPR, 2025); Supper Club App privacy policy patterns
- **Dietary management:** DietaryFlow platform patterns; BizBash (2023) — large-scale dietary restriction handling; FDA food allergy statistics; Checkless (2026) — 32M Americans with food allergies
- **Waitlist mechanics:** Gatsby Events — capacity & waitlist triggers; EventON (2026) — auto-notification and promotion; InEvent — manual vs automated waitlist management
- **Concurrent events / capacity:** Zoom concurrency limits documentation; Grenadine event management — double-booked room/speaker detection; general event scheduling best practices
- **RSVP management:** Sweap (2024) — guest list management problems; Guestsnhost (2025) — top RSVP mistakes; RSVPify (2026) — comprehensive event management features
- **Trust & safety:** Startup autopsy patterns; Sched (2025) — event app issues including privacy and data migration; general peer-to-peer platform safety literature
- **General startup pitfalls:** CB Insights startup failure dataset; 14 Startup Postmortems (Hoover, 2014); Beverly Hills Supper Club fire lessons on capacity/safety (1977, still relevant for event safety design)

---
*Pitfalls research for: Supper Club Platform*
*Researched: 2026-07-02*
