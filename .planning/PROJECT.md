# Supper Club

## What This Is

A platform for organizing and participating in supper club events — intimate dining experiences where hosts create meals and guests join. Members can host dinners, browse upcoming events, RSVP, and build community around shared meals.

## Core Value

Hosts can create supper club events and guests can discover and join them.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Host can create a supper club event with date, time, location, menu, and capacity
- [ ] Guest can browse and discover upcoming supper club events
- [ ] Guest can RSVP to an event (with guest count)
- [ ] Host can manage RSVPs and communicate with guests
- [ ] User can create a profile with bio and preferences
- [ ] User can view event details including menu, location, and host info

### Out of Scope

- Payment processing / ticket sales — deferred until event management is validated
- Review/rating system — defer to v2
- Mobile app — web-first, mobile later

## Context

Next.js 16 (App Router) project with React 19, TypeScript, and TailwindCSS v4. New scaffold from create-next-app — no business logic yet.

## Constraints

- **Tech stack**: Next.js 16, React 19, TypeScript, TailwindCSS v4 — already set up
- **Timeline**: TBD
- **Budget**: TBD

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Chosen by scaffold, good for SSR/SEO for event discovery | — Pending |

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
