# Feature Research

**Domain:** Supper club / community dining platform
**Researched:** 2026-07-02
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| User registration & profiles | Every platform requires identity — guests need to know who they're eating with, hosts need credibility | LOW | Standard auth (email + OAuth); profile fields: bio, photo, food preferences. Hosts get extra fields (cuisine style, experience). |
| Event creation (host) | Core job-to-be-done — host must set date, time, location, menu, capacity, and price | MEDIUM | The central workflow. Must support: description, menu, photos, dietary notes, guest limit. |
| Event browsing & discovery (guest) | Guests must be able to find events by date, location, cuisine type | MEDIUM | Search/filter by date, city/neighborhood, cuisine. Card-style results with date, host name, price, capacity remaining. |
| RSVP / booking | Guests must be able to claim a seat — the core transaction of the platform | MEDIUM | Single-click RSVP, guest count selection (+1, etc.), confirmation email. Request-to-book pattern (host approves) OR instant book. |
| Event detail page | Single source of truth for what the event is: menu, host, location, date/time | LOW | Structured layout: hero image, menu, host card, location map, RSVP button. |
| Host dashboard | Host needs visibility into who's coming — guest list, headcount, dietary notes | MEDIUM | List of confirmed guests, waitlisted guests, total count. Basic guest info (name, dietary restrictions). |
| Host-guest messaging | Host needs to communicate event details, guests need to ask questions | MEDIUM | In-platform messaging, not personal contact info sharing. Host can send broadcast to all confirmed guests. |
| Location display | Guests need to know where the event happens | LOW | Address display, optional map embed. Privacy: host can choose to reveal only after RSVP confirmation. |
| Capacity management | Events have limited seats — must enforce max guests, show availability | LOW | Track RSVPs against capacity. Show seats remaining. Auto-close RSVP when full. |
| Notifications & reminders | Reduce no-shows — email reminders before event | LOW | RSVP confirmation email, reminder 24-48h before event. |
| Cancellation / waitlist | Plans change — guests need to cancel, waitlisted guests need a path in | MEDIUM | Guest can cancel RSVP by deadline. Waitlist auto-promotes when spot opens. Host can over-ride. |

### Differentiators (Competitive Advantage)

Features that set the product apart from generic event platforms (Eventbrite, Partiful) and dedicated competitors (EatWith).

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dietary preference & allergy tracking** | Supper clubs are intimate dining — hosts cook for guests with specific needs. Not just "vegetarian" but detailed allergy/restriction capture. | MEDIUM | Structured field per guest (tag-based: vegan, gluten-free, nut allergy). Host sees aggregated dietary map. Differentiator vs Eventbrite where dietary is a free-text afterthought. |
| **Menu display with course breakdown** | The menu is the star of a supper club. Multi-course display with descriptions, wine pairings. | LOW | Structured course list (starter, main, dessert). Optional pairing notes. Photos per course. |
| **Event series / recurring events** | Supper clubs often run weekly/monthly — hosts need to clone events, not recreate from scratch | MEDIUM | Template from previous event. Set recurrence pattern (every 2nd Saturday). Guest list carries over with re-confirmation. |
| **Host application & curation pipeline** | Trust is critical for home dining — a vetted host program signals quality and safety | MEDIUM | Application form, review queue, approval/rejection. Badge on host profile ("Verified Host"). Re-application for rejected hosts. |
| **Group coordination (potluck / BYO)** | Many supper clubs are collaborative — guests bring dishes or drinks | MEDIUM | Potluck mode: host assigns courses, guests claim what they bring. BYO tracking. Shared menu builder. |
| **Theme & cuisine tagging** | Supper clubs are organized around themes (Italian night, Taco Tuesday, Wine & Cheese) | LOW | Tag taxonomy for browse/filter. Featured collections (e.g., "Summer Grills"). |
| **Guest profile for food identity** | "I'm a foodie" is core identity for this audience — let them express it | LOW | Favourite cuisine, cooking skill level, dietary identity. Food photos in profile. |
| **Event photo gallery (post-event)** | Social proof and memory-keeping — guests and hosts share photos after the dinner | MEDIUM | Shared event album. Host controls upload permissions. Shows on event page after. |
| **Host calendar & availability management** | Hosts have limited availability — let them set open dates and guests request | MEDIUM | Calendar view. Block dates. Auto-suggest available slots. Guest requests specific date. |
| **Guest contribution / split payment** | Some clubs do cost-splitting for ingredients, not ticket sales — simpler than full payments | MEDIUM | Per-guest ingredient fee. Host sets ingredient cost. Guest pays share. Differentiator vs. free-float systems. |
| **Emergency host replacement / co-host** | If host cancels, co-host can step in. Prevents last-minute event collapse. | HIGH | Co-host designation at event creation. Co-host gets dashboard access. If host cancels, co-host can keep event live or cancel. |
| **Referral system** | Supper clubs grow by word-of-mouth. Referral credits incentivize invites. | MEDIUM | Unique referral link. Credits applied toward future events. Track referrals in dashboard. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for an early-stage platform.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Full payment processing / ticket sales** | Monetization, perceived legitimacy | Adds PCI compliance, fraud risk, refund disputes, payment processor integration complexity. EatWith learned this the hard way — they delayed payments. | Start free. Validate demand first. Add payment in v1.x only if needed. Use simple per-seat fee model later. |
| **Rating & review system** | Trust signals, quality control | Encourages review gaming, retaliatory ratings, false reviews. Requires moderation infrastructure. EatWith and Airbnb both struggle with this. | Host verification pipeline + event photo gallery serve as trust signals. Add reviews in v2 with careful design. |
| **Native mobile app** | "Every platform needs an app" | 2x development cost (iOS + Android), App Store friction, update cycles. Half of supper club traffic is mobile web anyway. | Mobile-responsive PWA. Native app only after product-market fit and dedicated mobile team. |
| **Real-time chat / WebSocket** | Instant messaging feels modern | Over-engineering for early stage. Adds complexity (state management, offline, typing indicators). Event communication is not urgent. | In-platform async messaging is sufficient. Host broadcasts via email/notification. Real-time chat = v3+ scope. |
| **Open marketplace / anyone can host** | Rapid supply growth | Trust disaster — safety concerns, quality inconsistency, liability. EatWith requires application + kitchen inspection. Grubwithus failed partly from quality control issues. | Curated host application pipeline. Hosts approved manually. Scaled supply only after trust infrastructure is solid. |
| **Virtual / online events** | "Reach people who can't attend in person" | Undermines the core value prop (in-person dining). Adds video infra complexity. Dilutes brand. | Stay focused on IRL supper clubs. Online cooking classes can be a v3+ vertical but not MVP. |
| **Seating chart / table assignments** | "Guests need assigned seats" | Over-engineered for small events (6-12 people). Seating is naturally managed by the host in an intimate setting. | Host can assign guests to tables manually if needed, but no algorithmic seating needed. |
| **Complex ticketing tiers (Early bird, VIP, etc.)** | Revenue optimization | Introduces pricing complexity, fairness complaints, need for promo code infrastructure. | Single price point per event in MVP. Tiered pricing only after demand data exists. |
| **Instagram/Facebook event sync** | Cross-platform posting | API dependency, OAuth scope creep, content duplication. Each platform has different event data models. | Manual share link (copy event URL) is sufficient until integration ROI is clear. |

## Feature Dependencies

```
User registration & profiles
    └──requires──> Authentication system

Event creation (host)
    └──requires──> User registration & profiles
    └──enhances──> Host dashboard

RSVP / booking
    └──requires──> Event creation (host)
    └──requires──> User registration & profiles
    └──requires──> Capacity management

Host-guest messaging
    └──requires──> RSVP / booking
    └──requires──> User registration & profiles

Notifications & reminders
    └──requires──> RSVP / booking

Event browsing & discovery
    └──requires──> Event creation (host)

Dietary preference tracking
    └──requires──> RSVP / booking
    └──enhances──> Host dashboard (aggregated view)

Event series / recurring
    └──requires──> Event creation (host)

Group coordination (potluck)
    └──requires──> RSVP / booking
    └──enhances──> Event creation (host) — potluck mode option

Host application pipeline
    └──requires──> User registration & profiles
    └──enhances──> Event creation (host) — only approved hosts can create

Emergency host replacement
    └──requires──> Host dashboard
    └──requires──> Event creation (host)

Referral system
    └──requires──> User registration & profiles

Payment / split cost           [DEFERRED]
    └──requires──> RSVP / booking
    └──requires──> User registration & profiles

Review system                  [DEFERRED]
    └──requires──> RSVP / booking (only past attendees can review)
    └──requires──> User registration & profiles
```

### Dependency Notes

- **Event creation is the critical path dependency** — nearly every feature depends on events existing in the system. Build this first and get it right.
- **User registration gates everything except event browsing** — anonymous users can browse, but RSVP requires identity. Guest view of events should work without auth to maximize discovery.
- **Dietary preferences enhance RSVP but don't block it** — can be added after basic RSVP is working.
- **Host application pipeline should precede public launch** — without curation, event quality and trust suffer. This is where platforms like Grubwithus failed.
- **Payment and reviews are cleanly deferrable** — they have no downstream dependencies that block other features. They enhance but don't enable.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] **User registration & profiles** — identity is fundamental. Hosts and guests need profiles.
- [x] **Event creation (host)** — the core value proposition. Host sets menu, date, time, location, capacity.
- [x] **Event browsing & discovery** — guests must be able to find events. Search/filter by date, location.
- [x] **Event detail page** — menu, host, location, RSVP button. Single source of truth.
- [x] **RSVP / booking** — claim a seat. Guest count, confirmation.
- [x] **Capacity management** — enforce limits, show availability, waitlist.
- [x] **Host dashboard with guest list** — host sees who's coming, dietary notes.
- [x] **Basic host-guest messaging** — host can communicate event details.
- [x] **Email notifications (confirmation + reminder)** — reduce no-shows.
- [x] **Location display** — how to find the event.

### Add After Validation (v1.x)

Features to add once core is working and users are engaging.

- [ ] **Dietary preference & allergy tracking** — triggered when hosts report needing dietary info from guests.
- [ ] **Contact ingredient cost / split contribution** — triggered when hosts ask for payment tooling.
- [ ] **Event series / recurring events** — triggered when hosts create duplicate events.
- [ ] **Theme & cuisine tagging** — triggered when browsing becomes hard without taxonomy.
- [ ] **Host application & verification pipeline** — triggered before expanding beyond initial host group.
- [ ] **Referral system** — triggered when growth plateaus and organic word-of-mouth needs a boost.
- [ ] **Event photo gallery (post-event)** — triggered when guests share photos on social media organically.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Payment processing / ticket sales** — requires payment infra, PCI compliance, refund policies. Validate demand for free events first. Only build if hosts consistently ask for paid events.
- [ ] **Review & rating system** — needs moderation infrastructure, anti-gaming measures. Dangerous to launch poorly. Add only after trust baseline is established via host verification.
- [ ] **Group coordination / potluck mode** — specific use case, adds significant UI complexity. Build when potluck hosts become a meaningful segment.
- [ ] **Emergency host replacement / co-host** — complex permission model, edge cases. Build when cancellation rates become a problem.
- [ ] **Native mobile app** — 2x+ development cost. Reactive PWA is sufficient. Only after web product-market fit.
- [ ] **Real-time chat** — async messaging satisfies v1 needs. Real-time adds WebSocket infra complexity.
- [ ] **Open marketplace / auto-approve hosts** — trust and safety risk. Maintain curated pipeline indefinitely or until dedicated trust & safety team exists.
- [ ] **Seating chart / table assignments** — over-engineering for intimate events. Host does this naturally.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User registration & profiles | HIGH | LOW | P1 |
| Event creation (host) | HIGH | MEDIUM | P1 |
| Event browsing & discovery | HIGH | MEDIUM | P1 |
| Event detail page | HIGH | LOW | P1 |
| RSVP / booking | HIGH | MEDIUM | P1 |
| Capacity management | HIGH | LOW | P1 |
| Host dashboard with guest list | HIGH | MEDIUM | P1 |
| Basic host-guest messaging | MEDIUM | MEDIUM | P1 |
| Email notifications | MEDIUM | LOW | P1 |
| Location display | HIGH | LOW | P1 |
| Dietary preference tracking | MEDIUM | MEDIUM | P2 |
| Event series / recurring | MEDIUM | MEDIUM | P2 |
| Theme & cuisine tagging | LOW | LOW | P2 |
| Host application & verification | HIGH | MEDIUM | P2 |
| Referral system | MEDIUM | MEDIUM | P2 |
| Event photo gallery | LOW | MEDIUM | P2 |
| Group coordination / potluck | MEDIUM | HIGH | P3 |
| Payment processing / tickets | HIGH | HIGH | P3 |
| Review & rating system | MEDIUM | HIGH | P3 |
| Co-host / emergency replacement | LOW | HIGH | P3 |
| Native mobile app | MEDIUM | VERY HIGH | P3 |
| Real-time chat | LOW | HIGH | P3 |
| Open marketplace (auto-approve) | MEDIUM | HIGH | P3 |
| Seating charts | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add after validation
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | EatWith | Grubwithus (defunct) | SupperClub App (defunct) | Our Approach |
|---------|---------|---------------------|-------------------------|--------------|
| Event creation | Host sets menu, date, capacity, price, photos | Restaurant-selected prix fixe meals | Create/join groups, schedule | Same core model. Free only (no ticket pricing in v1). |
| Guest discovery | Browse by city, date, cuisine type, date picker | Browse by city, view profiles of attendees | Group-based discovery | Browse by location + date + event type. Anonymous browsing allowed. |
| RSVP / booking | Request-to-book with host approval | Pay-to-book (tickets sold) | RSVP within group | Request-to-book via host approval. Simpler than full payment flow. |
| Host tooling | Dashboard, calendar widget, SMS/email confirmations, guest list download, messaging | Profile management, seating | Group management, recipe sharing | Dashboard with guest list, messaging, dietary aggregation. No payment tools in v1. |
| Host vetting | Application → approval → kitchen inspection (some markets). Selective process. | Restaurant-partner focused (venue quality control) | No explicit vetting | Manual host application + approval pipeline. Verified Host badge. Expanded cautiously. |
| Monetization | 20-30% service fee on guest price | Percentage from restaurants | Not monetized (defunct before revenue) | Free in v1. Explore per-event fee or subscription after validation. |
| Dietary tracking | Host manually manages via messaging | Not offered | Not offered | Structured dietary intake at RSVP time. Aggregated view for host. |
| Insurance | $2M liability coverage for hosts | Not offered | Not offered | Deferred. Review liability needs at scale. |
| Reviews | 5-star + text reviews | Profile ratings | Not offered | Deferred to v2. Will need careful moderation design. |
| Recurring events | Create each event individually | Not applicable | Group-based recurring schedule | Clone event pattern. Recurrence template. Guest re-confirmation. |
| Mobile app | Native iOS + Android | iPhone app | Defunct iOS app | Responsive web-first. PWA. Native only after PMF. |

## Sources

- **EatWith** — eatwith.com (help center, become-host page, how-it-works). Market leader in social dining with 5,000+ hosts across 130+ countries. Features studied: host application flow, booking workflow, guest management tools, marketing support, pricing model.
- **Gusta** — Food+Tech Connect interview (2011). Former Airbnb employees' supper club discovery platform. Features studied: browse/book flow, subscription system for events, host tools, multi-currency, 10% fee model.
- **Grubwithus** — Y Combinator W11 company ($7.7M raised). Social dining at restaurants. Features studied: group dining model, profile browsing, early-bird pricing, "create your own meal" feature. Noted: quality control challenges contributed to failure.
- **SupperClub App** — supperclubapp.com, CBInsights profile. Features studied: group creation, recipe sharing, schedule management, food event organization.
- **PDX Supper Club** — pdxsupperclub.com (active, Discord-based). Real-world operational model: subscription ($9.99/mo), dinner credits, cancellation fees, calendar invites.
- **supperclub iOS app** — App Store (Yeung, Sharp & Oliver). Tables of 6 at restaurants, curated venues, user verification, guest lists, free membership.
- **RSVPify** — rsvpify.com. General event platform used by supper clubs. Features studied: guest list, menu/dietary options, seating charts, QR check-in, email communications.
- **Dataintelo Market Report 2026** — $2.8B supper club membership platform market, growing at 9.8% CAGR. Key driver: experiential dining, social connectivity demand, culinary tourism.
- **Digitech Bytes (June 2026)** — Identified market gap: RSVP-and-payment co-host tool specifically for supper club hosts. Validates demand for purpose-built tooling.

---
*Feature research for: Supper Club platform*
*Researched: 2026-07-02*
