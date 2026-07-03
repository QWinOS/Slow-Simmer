# Architecture Research

**Domain:** Community dining / supper club event hosting platform
**Researched:** 2026-07-02
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                            │
│  (Next.js App Router — React Server Components)                   │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Public  │  │  Host    │  │  Guest   │  │  Auth    │         │
│  │  Pages   │  │ Dashboard│  │ Dashboard│  │  (Login) │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │              │             │             │                │
├───────┴──────────────┴─────────────┴─────────────┴────────────────┤
│                      APPLICATION LAYER                              │
│  (Server Actions / Route Handlers / Services)                      │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Event   │  │  RSVP    │  │  Profile │  │  Notification    │ │
│  │  Service │  │  Service │  │  Service │  │  Service         │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬──────────┘ │
│       │              │             │                 │            │
├───────┴──────────────┴─────────────┴─────────────────┴────────────┤
│                       DATA LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │         Prisma ORM + PostgreSQL (Supabase / Neon)           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │              File Storage (Uploadthing / R2)                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Auth System | User registration, login, session management, role-based access | NextAuth.js v5 with credentials + OAuth (Google), JWT sessions |
| Public Pages | Event discovery, browsing, search, landing page | Server Components with RSC data fetching, ISR for public event list |
| Host Dashboard | Event CRUD, guest list view, RSVP management, event editing | Server Components + Server Actions (mutations), client components for interactive parts |
| Guest Dashboard | RSVP management, upcoming events, profile editing | Server Components + Server Actions |
| Event Service | Event creation, validation, capacity checks, scheduling | Server Actions with Prisma transactions |
| RSVP Service | RSVP create/update/cancel, capacity enforcement, waitlist | Server Actions with DB transaction (atomic capacity check) |
| Profile Service | User profile CRUD, preferences, dietary restrictions | Server Actions |
| Notification Service | Email reminders, in-app notifications | Background job via Vercel Cron / Bull with Redis (if needed) |
| File Upload | Event images, host profile photos | Uploadthing / direct S3-compatible upload with presigned URLs |

## Recommended Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (no auth required)
│   │   ├── page.tsx        # Landing page / event discovery
│   │   ├── events/         # Event browsing and search
│   │   │   ├── page.tsx    # Event list (server component, search params)
│   │   │   └── [id]/       # Event detail page
│   │   │       └── page.tsx
│   │   └── auth/           # Auth pages (login, register)
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   ├── (authenticated)/    # Authenticated routes layout
│   │   ├── layout.tsx      # Auth check wrapper
│   │   ├── dashboard/      # User dashboard
│   │   │   └── page.tsx
│   │   └── profile/        # Profile editing
│   │       └── page.tsx
│   ├── host/               # Host-specific routes
│   │   ├── layout.tsx      # Host role gate
│   │   ├── events/         # Host's event management
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/       # Manage specific event
│   │   │       ├── page.tsx          # Event detail + guest list
│   │   │       └── edit/page.tsx
│   │   └── dashboard/page.tsx
│   └── api/                # API routes (if needed beyond Server Actions)
│       └── [[...route]]/route.ts  # Optional tRPC/hono handler
│
├── components/             # Shared UI components
│   ├── ui/                 # Base UI primitives (Button, Card, Modal, etc.)
│   ├── events/             # Event-specific components
│   │   ├── EventCard.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventDetail.tsx
│   │   └── RSVPButton.tsx
│   ├── profile/            # Profile components
│   └── layout/             # Layout components (Nav, Footer)
│
├── lib/                    # Business logic and shared utilities
│   ├── db/                 # Database layer
│   │   ├── prisma.ts       # Prisma client singleton
│   │   └── schema.prisma   # Prisma schema (or in /prisma/)
│   ├── auth/               # Auth configuration
│   │   ├── auth.ts         # NextAuth config
│   │   └── roles.ts        # Role definitions and guards
│   ├── services/           # Domain services
│   │   ├── event-service.ts      # Event CRUD + validation
│   │   ├── rsvp-service.ts       # RSVP logic + capacity
│   │   ├── profile-service.ts    # User profiles
│   │   ├── notification-service.ts # Notification dispatch
│   │   └── search-service.ts     # Event search/filter logic
│   ├── validations/        # Zod schemas for input validation
│   │   ├── event.ts
│   │   ├── rsvp.ts
│   │   └── profile.ts
│   └── utils/              # Shared helpers
│       ├── dates.ts
│       └── formatters.ts
│
├── types/                  # TypeScript type definitions
│   ├── index.ts
│   └── prisma.ts           # Prisma-generated types (re-exported)
│
├── config/                 # Configuration
│   ├── site.ts             # Site-wide config
│   └── constants.ts        # App constants
│
├── hooks/                  # Client-side hooks
│   └── use-debounce.ts     # Search debouncing
│
└── styles/                 # Global styles
    └── globals.css         # TailwindCSS v4 entry
```

### Structure Rationale

- **`app/` with route groups:** Group routing by auth status (`(public)`, `(authenticated)`) keeps the route tree clean and makes middleware rules obvious. Host-only routes live in a separate `host/` segment for clear role boundaries.
- **`lib/services/`:** Domain services encapsulate all business logic in pure functions. Server Actions call services, not the database directly. This makes logic testable independently of the framework.
- **`lib/validations/`:** Zod schemas live separate from services so they can be shared between Server Actions and client-side forms (progressive enhancement).
- **`components/events/` and `components/profile/`:** Feature-colocated components split from generic UI primitives. Primitives can be extracted to an external library later (e.g., shadcn/ui).

## Architectural Patterns

### Pattern 1: RSC-First Data Fetching with Server Actions

**What:** Event data and page content are fetched in Server Components. Mutations (RSVP, create event) are handled via Server Actions — HTML form actions that POST to the server without a separate API layer.

**When to use:** For all page-level data fetching and mutations in the supper club app. This is the recommended Next.js App Router pattern.

**Trade-offs:**
- (+) No client-state library needed for most data — RSC handles freshness
- (+) Server Actions work without JavaScript (progressive enhancement)
- (+) No manual API route boilerplate for internal operations
- (-) Server Actions post to the same origin — not designed for third-party API consumption
- (-) Need `"use server"` directives carefully scoped to avoid bundling server code on the client

**Example:**
```typescript
// app/(public)/events/[id]/page.tsx — Server Component
import { getEventById } from "@/lib/services/event-service";
import { notFound } from "next/navigation";
import { EventDetail } from "@/components/events/EventDetail";
import { RSVPForm } from "@/components/events/RSVPForm";

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) notFound();
  return (
    <div>
      <EventDetail event={event} />
      {/* RSVPForm will use a Server Action for the mutation */}
      <RSVPForm eventId={event.id} capacity={event.capacity}
        currentRsvps={event._count.rsvps} />
    </div>
  );
}
```

```typescript
// components/events/RSVPForm.tsx — Client Component with Server Action
"use client";
import { rsvpForEvent } from "@/lib/services/rsvp-service";

export function RSVPForm({ eventId, capacity, currentRsvps }: Props) {
  const isFull = currentRsvps >= capacity;
  return (
    <form action={rsvpForEvent.bind(null, eventId)}>
      <input type="number" name="guestCount" min={1} max={5} defaultValue={1} />
      <button type="submit" disabled={isFull}>
        {isFull ? "Event Full" : "RSVP"}
      </button>
    </form>
  );
}
```

```typescript
// lib/services/rsvp-service.ts — Server Action
"use server";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const rsvpSchema = z.object({
  guestCount: z.number().int().min(1).max(5),
});

export async function rsvpForEvent(eventId: string, formData: FormData) {
  const session = await auth(); // NextAuth session
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = rsvpSchema.parse({
    guestCount: Number(formData.get("guestCount")),
  });

  // Transaction: check capacity atomically
  await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUniqueOrThrow({
      where: { id: eventId },
      select: { capacity: true },
    });
    const currentRsvps = await tx.rSVP.count({
      where: { eventId, status: "GOING" },
    });
    if (currentRsvps + data.guestCount > event.capacity) {
      throw new Error("Event is full");
    }
    await tx.rSVP.create({
      data: {
        userId: session.user.id,
        eventId,
        guestCount: data.guestCount,
        status: "GOING",
      },
    });
  });

  revalidatePath(`/events/${eventId}`);
}
```

### Pattern 2: Repository-Service Boundary

**What:** Domain services never call Prisma directly. A thin repository layer wraps Prisma queries, and services orchestrate repositories + validation + auth checks. For an MVP this can be simplified — services call Prisma directly — but the logical separation (query logic vs. business logic) should be maintained.

**When to use:** As soon as there are 3+ services that need to share query logic. Start with services calling Prisma directly; extract a repository when a query appears in multiple services.

**Trade-offs:**
- (+) Clear separation: services own business rules, repositories own data access
- (+) Testing: services can be tested with mock repositories
- (-) Extra indirection for simple CRUD — over-engineering if applied too early

### Pattern 3: Atomic Capacity Enforcement

**What:** RSVP creation must atomically check and decrement available capacity to prevent overbooking. Use a Prisma `$transaction` to check and write in a single operation.

**When to use:** Every mutation that modifies a count-based resource (RSVP count, ticket sales, seat reservations).

**Trade-offs:**
- (+) Prevents race conditions on concurrent RSVPs
- (-) Slightly higher latency per RSVP (transaction overhead)
- (-) Can become a bottleneck at very high concurrency — premature optimization concern for this scale

```typescript
// The canonical pattern — see the RSVP Server Action above for full example
await prisma.$transaction(async (tx) => {
  const event = await tx.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { capacity: true, _count: { select: { rsvps: true } } },
  });
  if (event._count.rsvps >= event.capacity) throw new Error("Full");
  await tx.rSVP.create({ data: { userId, eventId, status: "GOING" } });
});
```

## Data Flow

### Request Flow

```
[BROWSE EVENTS]
  Guest visits /events
      ↓
  Server Component `EventListPage`
      ↓
  Calls `getEvents(searchParams)` service
      ↓
  Prisma query to PostgreSQL (filtered, paginated)
      ↓
  Returns serialized event list (RSC payload)
      ↓
  Client renders EventCard components

[RSVP TO EVENT]
  Guest submits RSVP form
      ↓
  Server Action `rsvpForEvent(eventId, formData)`
      ↓
  Auth check → Zod validation → Prisma $transaction
      ↓
  Check capacity → Create RSVP → Send notification
      ↓
  revalidatePath(`/events/${eventId}`)
      ↓
  Server re-renders updated data
      ↓
  Client receives fresh RSC payload

[CREATE EVENT]
  Host submits event creation form
      ↓
  Server Action `createEvent(formData)`
      ↓
  Auth check (host role) → Zod validation
      ↓
  Geocode location → Create event in DB
      ↓
  revalidatePath(`/host/dashboard`) + redirect to /host/events/[id]
```

### State Management

```
PERSISTENT STATE   TEMPORARY STATE (Client-side only)
┌──────────────┐   ┌─────────────────────────────┐
│  PostgreSQL   │   │  Search filters (URL params) │
│  (source of   │   │  Form state (controlled)     │
│   truth)      │   │  Debounced search input      │
└──────┬───────┘   │  Toast notifications          │
       │           └─────────────────────────────┘
       │
┌──────▼───────┐
│  Prisma ORM   │
│  (type-safe)  │
└──────┬───────┘
       │
┌──────▼───────┐
│  RSC Cache    │
│  (Next.js)    │  ← revalidatePath() / revalidateTag()
└──────────────┘
```

**Rule:** No client-side state library (Zustand, Redux) for MVP. The RSC model eliminates the need for a global client store. The few client-interactive elements (search debouncing, form state) use React's built-in `useState`/`useReducer` scoped to the component.

### Key Data Flows

1. **Event Discovery Flow:** Guest → Server Component `/events` → Prisma query with search/filter params → Event cards rendered in RSC payload. Filters managed via URL search params, not client state.

2. **RSVP Flow:** Guest → RSVP Server Action → transaction-based capacity check → RSVP created → notification dispatched → cache revalidated → page refreshes with updated count.

3. **Event Creation Flow:** Host → EventForm Server Action → Zod validation → Prisma event create → redirect to event management page → host sees guest list placeholder.

4. **Notification Flow:** Event trigger (RSVP, event edit, reminder) → Notification service → email via Resend / in-app notification stored in DB → delivered to recipient.

## Database Schema

### Core Tables

```
users
├── id          UUID (PK)
├── name        String
├── email       String (unique)
├── image       String? (avatar URL)
├── bio         String?
├── role        Enum (USER, HOST)     ← host requires additional setup
├── createdAt   DateTime
└── updatedAt   DateTime

events
├── id          UUID (PK)
├── hostId      UUID (FK → users)
├── title       String
├── description String
├── date        DateTime
├── location    String (address text)
├── lat         Float? (geocoded)
├── lng         Float? (geocoded)
├── menu        String (menu description)
├── capacity    Int
├── status      Enum (DRAFT, PUBLISHED, CANCELLED, COMPLETED)
├── createdAt   DateTime
├── updatedAt   DateTime
└── images      EventImage[] (relation)

event_images
├── id          UUID (PK)
├── eventId     UUID (FK → events)
├── url         String
└── order       Int

rsvps
├── id          UUID (PK)
├── eventId     UUID (FK → events)
├── userId      UUID (FK → users)
├── status      Enum (GOING, MAYBE, NOT_GOING)
├── guestCount  Int (default: 1)
├── createdAt   DateTime
└── updatedAt   DateTime
└── UNIQUE(eventId, userId)  ← one RSVP per user per event

notifications
├── id          UUID (PK)
├── userId      UUID (FK → users)
├── type        Enum (RSVP_CONFIRMED, EVENT_REMINDER, EVENT_CANCELLED, GUEST_JOINED)
├── title       String
├── body        String
├── read        Boolean (default: false)
├── link        String? (deep link to resource)
├── createdAt   DateTime
└── deliveredAt DateTime?
```

### Key Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| events | `(date, status)` | Filter upcoming published events |
| events | `hostId, status` | Host dashboard queries |
| events | `title` (GIN trgm) | Full-text search on event titles |
| rsvps | `(eventId, status)` | Count RSVPs by event |
| rsvps | `(userId, status)` | Guest's upcoming events |
| notifications | `(userId, read, createdAt)` | Unread notification count |

### Schema Design Decisions

- **One RSVP per user per event** via unique constraint on `(eventId, userId)`. This prevents duplicate RSVPs. The `status` field handles changes (switching from GOING to NOT_GOING), not deletion.
- **`guestCount` on RSVP** rather than creating individual guest records. For an MVP, tracking "party size" is sufficient. If per-guest details become needed later, normalize into a `guests` table.
- **Event coordinates** (`lat`/`lng`) for map-based discovery. Geocode on event creation using a lightweight service (Google Maps API / Nominatim). Deferred if not in MVP.
- **`status` on events** (DRAFT → PUBLISHED → CANCELLED) handles the lifecycle. DRAFT allows hosts to prepare before going live.
- **Role system** is simple: `USER` vs `HOST`. A user creates a host profile (with additional fields like cuisine style, host bio) but the `role` flag gates host-only routes. No admin role needed for MVP.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith Next.js on Vercel. Single PostgreSQL instance (Neon free tier). Server Actions for everything. No background job infrastructure. |
| 1k-100k users | Add Vercel Postgres / Neon scale-to-zero. Introduce Redis for rate limiting and cache hot queries (event detail pages). Add Vercel Cron for reminder jobs. Consider extracting notification dispatch to a Queue. |
| 100k+ users | Split notification service into dedicated worker. Read replicas for event discovery queries. Consider materialized view for event search. CDN for event images. |

### Scaling Priorities

1. **First bottleneck: Capacity check concurrency on popular events.** At ~100 concurrent RSVPs on the same event, the `$transaction` with row lock will be the contention point. Mitigation: add a Redis counter for `remaining_spots` as a pre-check before the DB transaction; use optimistic locking.

2. **Second bottleneck: Event discovery queries.** Full-text search on `events` table with a GIN index works to ~50k rows. After that, consider pg_search (trgm) or external search (Typesense/MeiliSearch).

## Anti-Patterns

### Anti-Pattern 1: Client-Side Global State for Server Data

**What people do:** Fetch events in a client component, store in Zustand/Redux, dispatch actions to update, re-fetch on mount.

**Why it's wrong:** With RSC, the server is the source of truth. Client-side stores duplicate state, add complexity, and go stale. Next.js already handles caching, deduplication, and revalidation via RSC.

**Do this instead:** Fetch data in Server Components. Use `revalidatePath()` / `revalidateTag()` after mutations. Keep client state only for UI concerns (open/closed modals, form input values).

### Anti-Pattern 2: Over-Booking Due to Non-Atomic RSVP

**What people do:** Check `count(rsvps) < capacity` in application code, then `create(rsvp)` in a separate query. Between the check and the insert, another request sneaks in.

**Why it's wrong:** Race condition — two guests both see 9/10 capacity and both RSVP, resulting in 11/10.

**Do this instead:** Wrap the capacity check and RSVP insert in a database transaction (Prisma `$transaction`). Even better: use a `SELECT ... FOR UPDATE` row lock on the event row within the transaction.

### Anti-Pattern 3: Notification Logic Scattered in Services

**What people do:** Call `sendEmail()` directly inside `rsvp-service.ts`, then again inside `event-service.ts` for cancellations, etc.

**Why it's wrong:** Tight coupling between business logic and notification channels. Hard to change providers, add new channels, or debug delivery failures.

**Do this instead:** Have services emit typed events (or return domain events) and let a dedicated notification handler react. At MVP scale, this can simply be a post-mutation call to a notification service, but keep the notification logic centralized.

### Anti-Pattern 4: Direct Database Access in Client Components

**What people do:** Import Prisma client in a client component to fetch data with `useEffect`.

**Why it's wrong:** Exposes database credentials to the client bundle (if not using RSC boundaries). Bypasses Next.js data cache. Prevents progressive enhancement.

**Do this instead:** Fetch in Server Components. If you need client interactivity, pass data as props from a parent Server Component. Use Server Actions for mutations.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Auth (NextAuth.js) | Server-side session via `auth()` helper in RSC | Supports OAuth (Google, GitHub) + credentials. JWT strategy for stateless sessions. |
| Email (Resend / SendGrid) | Server Action → Notification service → Email API | For RSVP confirmations, reminders (24h before event). Template-based emails. |
| Image Upload (Uploadthing) | Client-side upload with callback URL → Server Action saves URL to DB | Free tier supports most MVP needs. Server-only upload keys. |
| Geocoding (optional) | Server Action → Nominatim / Google Geocoding API → store lat/lng | For map-based event discovery. Can be deferred. |
| Map Display (optional) | Client component with leaflet/react-leaflet | Loads events from Server Component data. Deferred feature. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components ↔ Services | Direct function call (server-side) | Services imported directly in RSC — no overhead |
| Client Components ↔ Server Actions | HTML form POST → Server Function | Progressive enhancement: works without JS |
| Client Components ↔ Server Data | Props from parent Server Component | Data flows down; mutations flow up via Server Actions |
| Services ↔ Database | Prisma ORM | All DB access goes through Prisma — no raw SQL except for migrations |
| Services → Notifications | Direct function call (MVP) → extract to queue later | Centralized Notification service keeps it manageable |

## Build Order (Component Dependencies)

### Phase 1: Auth + User Profiles (Foundation)
```
Dependencies: None — everything else depends on knowing who the user is
Delivers: Registration, login, session, basic profile
Unlocks: All authenticated features
```

### Phase 2: Event Creation (Host Flow)
```
Depends on: Auth (Phase 1)
Delivers: Event CRUD, draft/publish, image upload
Unlocks: Events exist in the system to discover and RSVP to
```

### Phase 3: Event Discovery + RSVP (Guest Flow)
```
Depends on: Auth (Phase 1), Events (Phase 2)
Delivers: Public event list, search/filter, event detail page, RSVP flow
Unlocks: Core loop — host creates, guest discovers and joins
```

### Phase 4: Host Dashboard + Guest Management
```
Depends on: Events (Phase 2), RSVP (Phase 3)
Delivers: Host sees who RSVPed, can manage guests, communicate
Unlocks: Host can actually host — knows who is coming
```

### Phase 5: Notifications + Reminders
```
Depends on: RSVP (Phase 3) — notifications are responses to RSVP actions
Delivers: Email confirmations, reminders, cancellation notices
Unlocks: Reliability — guests don't miss events
```

### Phase 6: Polish + Maps + Discovery Enhancements
```
Depends on: All above
Delivers: Map view, advanced search, host profiles, event categories
Unlocks: Platform feels complete
```

---

## Sources

- JoynaTable case study (peer-to-peer dining platform) — gocodeable.com
- Cohosted platform architecture (collaborative event planning) — github.com/elenav24/cohosted
- Event RSVP Platform system design — systemforces.com
- Shishi-Shitufi community potluck app — github.com/Chagai33/Shishi-Shitufi_v3
- Event Guest Management System Architecture — scribd.com (AWS microservices reference)
- Event Planning and RSVP App database schema — databasesample.com
- Next.js App Router documentation — nextjs.org/docs

---
*Architecture research for: Supper Club platform*
*Researched: 2026-07-02*
