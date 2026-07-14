# Architecture Research

**Domain:** Env-driven site configuration for an existing Next.js 16 App Router app ("Slow Simmer")
**Researched:** 2026-07-13
**Confidence:** HIGH (grounded in the actual codebase + Next.js 16 env docs at `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`)

> **Milestone note (v1.1):** This file was previously the v1.0 platform-architecture research (a hypothetical Prisma/NextAuth design that did not match the shipped app). It has been replaced with architecture research scoped to the v1.1 goal: integrating a central env-driven config module into the *existing* codebase. The prior content is preserved in git history.

## The Decisive Decision (read this first)

**Split the config into two modules. Do NOT ship a single `lib/site-config.ts` imported by both server and client.**

- `lib/site-config.ts` — **PUBLIC** config. Only `NEXT_PUBLIC_*` values (brand, tagline, SEO, social links, marketing copy). Safe to import from Server Components AND Client Components.
- `lib/site-config.server.ts` — **SERVER-ONLY** config. Non-public secrets/copy (email subject/body/signature, contact number, sender). Imported only by `lib/*` server modules and route handlers. Guarded with `import "server-only"` at the top.

**Why a split is mandatory here, not just tidy:**

1. **Inlining requires *static* `process.env.NEXT_PUBLIC_X` references.** The Next.js 16 doc is explicit: dynamic lookups are *not* inlined (`environment-variables.md` lines 182–191 — "This will NOT be inlined, because it uses a variable"). If you build a config object by iterating keys, destructuring `process.env`, or indexing `process.env[name]`, the browser bundle gets `undefined`. So the public module must reference each `process.env.NEXT_PUBLIC_*` var *by its literal name*, one line each.
2. **Non-public vars are `undefined` in the browser.** "By default, environment variables are only available on the server" (line 198); "Non-`NEXT_PUBLIC_` environment variables are only available in the Node.js environment... they aren't accessible to the browser" (line 156). A single shared module that reads `process.env.BREVO_...` *and* `process.env.NEXT_PUBLIC_...` in the same file is tempting to import from a client component; the moment someone does, the server values silently become `undefined` client-side — or worse, a maintainer "fixes" it by adding a `NEXT_PUBLIC_` prefix and leaks a secret. The physical split makes the boundary unbypassable: the client literally cannot import the server module (`server-only` throws at build).
3. **The codebase already uses the correct pattern.** `components/PaymentSection.tsx:77` reads `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!` as a direct static reference inside a `"use client"` file. The new public config module simply generalizes this existing, proven pattern. Server modules (`lib/brevo.ts`, `lib/sheets-write.ts`, `lib/google-auth.ts`, `lib/razorpay.ts`) already read bare `process.env.*` directly.

> Single most load-bearing constraint: **the public module is a flat list of literal `process.env.NEXT_PUBLIC_*` reads with fallbacks; the server module holds everything else and is fenced with `import "server-only"`.**

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                       BROWSER BUNDLE (client)                     │
│  ┌────────────┐ ┌──────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │HeroSection │ │MembershipSec.│ │ NavBar   │ │PaymentSection │  │
│  │"use client"│ │ "use client" │ │"use clnt"│ │ "use client"  │  │
│  └─────┬──────┘ └──────┬───────┘ └────┬─────┘ └───────┬───────┘  │
│        └───────────────┴──────────────┴───────────────┘          │
│                            imports ▼                              │
│              ┌───────────────────────────────────┐               │
│              │  lib/site-config.ts  (PUBLIC)      │  ← inlined at │
│              │  siteConfig = { name, tagline,     │    build time │
│              │    seo, social{ig,yt,li,wa}, copy } │               │
│              └───────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
                             ▲ same module ▲
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER (RSC + route handlers)                  │
│  ┌────────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────────┐  │
│  │ layout.tsx │ │AboutSect.│ │  Footer.tsx │ │ api/* handlers │  │
│  │ (metadata) │ │ (RSC)    │ │   (RSC)     │ │                │  │
│  └─────┬──────┘ └────┬─────┘ └──────┬──────┘ └───────┬────────┘  │
│        │ imports     │ imports      │ imports        │ imports    │
│        ▼ site-config ▼ site-config  ▼ site-config    ▼ BOTH       │
│                                                        │           │
│              ┌────────────────────────────────────────┴───────┐  │
│              │  lib/site-config.server.ts (SERVER-ONLY)        │  │
│              │  import "server-only"                           │  │
│              │  serverConfig{ email{subject,body,sig},        │  │
│              │    contact, sender } — reads bare process.env.* │  │
│              └────────────────────┬───────────────────────────┘  │
│                                   │ consumed by                   │
│                            ┌──────▼───────┐                       │
│                            │ lib/brevo.ts │                       │
│                            └──────────────┘                       │
└──────────────────────────────────────────────────────────────────┘

Event date/time/price/location — NOT here. Stays in Google Sheet,
fetched at runtime via /api/locations (unchanged, out of scope).
```

### Component Responsibilities

| Module | Responsibility | Import boundary |
|--------|----------------|-----------------|
| `lib/site-config.ts` (NEW) | Public brand/SEO/social/marketing copy. Flat object of literal `process.env.NEXT_PUBLIC_*` reads, each with a fallback default. | Server + Client (universal) |
| `lib/site-config.server.ts` (NEW) | Email subject/body/signature, contact number, sender name/email. Reads bare `process.env.*`. First line `import "server-only"`. | Server only (build error if imported client-side) |
| `app/layout.tsx` (MODIFIED) | Pulls `metadata.title` / `description` from `site-config.ts`. | Server (RSC) |
| `lib/brevo.ts` (MODIFIED) | Reads email copy from `site-config.server.ts` instead of hardcoded strings. | Server |
| Client components (MODIFIED) | Read brand/social/copy from `site-config.ts`. | Client |
| Google Sheet + `/api/locations` (UNCHANGED) | Event date/time/price/location at runtime. | out of scope |

## Recommended Project Structure

```
lib/
├── site-config.ts          # NEW — PUBLIC (NEXT_PUBLIC_*), universal import
├── site-config.server.ts   # NEW — SERVER-ONLY (import "server-only")
├── brevo.ts                # MODIFIED — consumes site-config.server.ts
├── razorpay.ts             # unchanged
├── sheets-write.ts         # unchanged
├── google-auth.ts          # unchanged
└── locations.ts            # unchanged (event data stays in Sheet)
app/
└── layout.tsx              # MODIFIED — metadata from site-config.ts
components/
├── Footer.tsx              # MODIFIED — brand + social hrefs from site-config.ts  (RSC)
├── AboutSection.tsx        # MODIFIED — story highlights + cities              (RSC)
├── NavBar.tsx              # MODIFIED — brand name                          (client)
├── HeroSection.tsx         # MODIFIED — hero copy, seat count, cities       (client)
├── MembershipSection.tsx   # MODIFIED — reasons/steps copy                  (client)
└── PaymentSection.tsx      # (optional) — "Slow Simmer" strings → config    (client)
.env.example                # MODIFIED — document every new NEXT_PUBLIC_* + server var
package.json                # MODIFIED — add `server-only` dependency
```

### Structure Rationale

- **Two files, not a folder.** The surface is a few dozen strings. A `config/` directory is overkill; two sibling `lib/` files sit naturally next to the existing server modules and are easy to find.
- **`.server.ts` naming is the boundary signal.** The filename declares intent before a reviewer opens it; the `import "server-only"` line enforces it mechanically at build.
- **Do NOT use `next.config.ts` `env:`.** The existing `next.config.ts` has no `env` block and shouldn't gain one — it's the legacy mechanism, supports no fallbacks/typing, and scatters config away from the typed module. Read `process.env.NEXT_PUBLIC_*` directly inside `site-config.ts`.

## Architectural Patterns

### Pattern 1: Public config as a flat object of literal env reads

**What:** Every public value is a hand-written line so Next's compiler can statically inline it.
**When to use:** Any value a Client Component or `<head>` metadata needs.
**Trade-offs:** Verbose (one line per var), but the verbosity is *required* for inlining — not optional boilerplate.

```typescript
// lib/site-config.ts  — NO "use client", NO "server-only": universal
// Each process.env.NEXT_PUBLIC_* is referenced by literal name so it inlines.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Slow Simmer",
  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE ?? "An Unhurried Supper Club",
  seo: {
    title:
      process.env.NEXT_PUBLIC_SEO_TITLE ??
      "Slow Simmer — An Unhurried Supper Club",
    description:
      process.env.NEXT_PUBLIC_SEO_DESCRIPTION ??
      "A supper club for good food and better company. Seasonal menus, shared tables, and evenings made to linger. Join us at the next supper.",
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE ?? "",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN ?? "",
    whatsapp: process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP ?? "",
  },
} as const;
```

### Pattern 2: `server-only` fence for secret-adjacent config

**What:** A poison-pill import that fails the build if the module ever reaches a Client Component graph.
**When to use:** Email copy, contact number, sender — anything not `NEXT_PUBLIC_`.
**Trade-offs:** Adds the tiny `server-only` package (see note below), for build-enforced safety.

```typescript
// lib/site-config.server.ts
import "server-only"; // build error if imported from a client component

export const serverConfig = {
  email: {
    subject:
      process.env.EMAIL_SUBJECT ?? "You're registered for Slow Simmer!",
    signature: process.env.EMAIL_SIGNATURE ?? "— Slow Simmer Team",
    // body template pieces as needed...
  },
  contactNumber: process.env.CONTACT_NUMBER ?? "",
  sender: {
    email: process.env.BREVO_SENDER_EMAIL,
    name: process.env.BREVO_SENDER_NAME ?? "Slow Simmer",
  },
} as const;
```

> **Dependency note:** `client-only` is already installed in `node_modules`, but `server-only` is **NOT**. Add it: `npm i server-only`. (If the team prefers zero new deps, an alternative fence is a runtime `if (typeof window !== "undefined") throw` at module top — weaker, runtime-only, and does not stop bundling; `server-only` is strongly recommended.)

### Pattern 3: Fallback-to-current-string (behavior-preserving refactor)

**What:** Every accessor's default value is *the exact string currently hardcoded* in the component.
**When to use:** During the refactor of each existing component.
**Trade-offs:** None — this is the mechanism that guarantees "zero behavior change." With no env var set, the app renders byte-identically to today.

**Example:** `NavBar.tsx` brand `"Slow Simmer"` → `{siteConfig.name}` with fallback `"Slow Simmer"`. Unset env ⇒ identical output.

## Data Flow

### Build-time flow (public config)

```
next build
   ↓ reads NEXT_PUBLIC_* from build environment
process.env.NEXT_PUBLIC_SITE_NAME  →  inlined literal "Slow Simmer"
   ↓
lib/site-config.ts  →  bundled into every client chunk that imports it
   ↓
Hero / Membership / NavBar / Footer / About / layout metadata
```

### Runtime flow (server config — email)

```
Razorpay webhook  →  app/api/webhooks/razorpay/route.ts
   ↓
lib/sheets-write.ts (writes registration)
   ↓
lib/brevo.ts  →  reads serverConfig from site-config.server.ts (runtime process.env)
   ↓
Brevo REST API  →  confirmation email
```

### Runtime flow (event data — UNCHANGED, out of scope)

```
Client mount  →  fetch("/api/locations")  →  Google Sheet
   ↓
location / date / time / price  →  RegistrationProvider → PaymentSection
```

### Key data flows

1. **Public copy:** frozen at `next build` — "After being built, your app will no longer respond to changes to these environment variables" (`environment-variables.md` line 166). Acceptable and explicitly in-scope per PROJECT.md ("Out of Scope: Live-editable browser config — `NEXT_PUBLIC_` env vars are build-time").
2. **Email copy:** read at request time on the server, so a `.env` change picks it up on redeploy without depending on build-time inlining semantics.
3. **Event details:** never touch the config module — they remain a runtime Sheet fetch via `/api/locations`.

## Suggested Build Order (dependency-aware; each step shippable & behavior-neutral)

Ordered so every commit is independently deployable with **no visual/behavior change** (fallbacks = current strings):

1. **Scaffold both config modules + `.env.example` + dep.** Create `lib/site-config.ts` and `lib/site-config.server.ts` with every key defaulting to today's hardcoded string. `npm i server-only`. Document every var in `.env.example`. *No component imports yet → zero runtime change, fully shippable.*
2. **Footer social links (highest user value, lowest risk).** Replace the two `href="#"` placeholders (`Footer.tsx:48,55`) + brand text with `siteConfig.social.*` / `siteConfig.name`. Footer is a Server Component — trivial, no client-boundary concern. *Delivers the headline v1.1 feature first.*
3. **Brand identity + SEO metadata.** Wire `app/layout.tsx` metadata (`title`, `description`) and `NavBar.tsx` brand to `siteConfig`. Simple string swaps. *SEO title/desc now env-driven.*
4. **Email copy (server side, isolated).** Refactor `lib/brevo.ts` to read from `serverConfig` (subject/signature/contact/sender/body). Only step touching the server-only module and the only one exercising the `server-only` fence. Keep existing `CONTACT_NUMBER`/`BREVO_*` var names to avoid touching deploy config. *Verify email still sends identically.*
5. **Marketing copy blocks.** Move hero (`HeroSection` — copy + `DETAILS` seat/cities bar), about highlights + cities (`AboutSection`), membership reasons/steps (`MembershipSection`) into `siteConfig`. Largest string volume, purely public client/RSC reads. One component per commit. *Each commit independently visually-verifiable.*
6. **(Optional) PaymentSection brand strings.** Swap `"Slow Simmer"` occurrences to `siteConfig.name`; leave the `NEXT_PUBLIC_RAZORPAY_KEY_ID` read exactly as-is (already correct).

**Ordering rationale:**
- Step 1 must precede all others (the modules are the dependency for every later step).
- Steps 2–3 are pure Server / simple client swaps — de-risk the pattern before the trickier server-only step.
- Step 4 is isolated so the `server-only` build behavior is validated on its own; a fence misfire can't be confused with a copy change.
- Step 5 is last because it's high-volume but low-risk; splitting per-component keeps each diff reviewable.

## Integration Points (enumerated by file)

### New files

| File | Kind | Reads |
|------|------|-------|
| `lib/site-config.ts` | Universal | `process.env.NEXT_PUBLIC_*` (literal reads) |
| `lib/site-config.server.ts` | Server-only (`import "server-only"`) | bare `process.env.*` |

### Modified files

| File | Boundary | Change | Imports |
|------|----------|--------|---------|
| `app/layout.tsx` | RSC | `metadata.title`/`description` from config | `site-config.ts` |
| `components/Footer.tsx` | RSC | social hrefs (`#`→env) + brand/tagline | `site-config.ts` |
| `components/AboutSection.tsx` | RSC | story highlights, cities | `site-config.ts` |
| `components/NavBar.tsx` | client | brand name | `site-config.ts` |
| `components/HeroSection.tsx` | client | hero copy, seat count, cities (`DETAILS`) | `site-config.ts` |
| `components/MembershipSection.tsx` | client | reasons/steps copy | `site-config.ts` |
| `components/PaymentSection.tsx` | client (optional) | `"Slow Simmer"` strings | `site-config.ts` |
| `lib/brevo.ts` | server | email subject/body/signature/contact/sender | `site-config.server.ts` |
| `.env.example` | — | document all new vars | — |
| `package.json` | — | add `server-only` dep | — |

## Anti-Patterns

### Anti-Pattern 1: One universal `site-config.ts` holding both public and secret values

**What people do:** Put `NEXT_PUBLIC_SITE_NAME` and `BREVO_SENDER_EMAIL` in the same importable module.
**Why it's wrong:** A client import silently yields `undefined` for the server values; the "fix" (prefixing `NEXT_PUBLIC_`) leaks the secret into the browser bundle. No compiler warning.
**Do this instead:** Two modules; fence the server one with `import "server-only"`.

### Anti-Pattern 2: Building the public config dynamically

**What people do:** `Object.fromEntries(...)`, `process.env[key]`, or `const { NEXT_PUBLIC_X } = process.env`.
**Why it's wrong:** Next only inlines *static, literal* `process.env.NEXT_PUBLIC_X` references (`environment-variables.md` 182–191). Dynamic forms compile to `undefined` in the browser — the config silently blanks out in production.
**Do this instead:** One literal `process.env.NEXT_PUBLIC_*` line per value, each with `?? "fallback"`.

### Anti-Pattern 3: Moving event date/time/price/location into the config module

**What people do:** "While we're at it, let's env-ify the event details too."
**Why it's wrong:** Those are deliberately runtime-editable via the Google Sheet (PROJECT.md Out of Scope). Baking them into build-time `NEXT_PUBLIC_*` would freeze them and break the no-redeploy editing the client relies on.
**Do this instead:** Leave `/api/locations` + Sheet flow untouched.

### Anti-Pattern 4: Using `next.config.ts` `env:` for the new vars

**What people do:** Add an `env` block to `next.config.ts`.
**Why it's wrong:** No fallbacks, no typing, splits config across two places; `.env.local` already works with `NEXT_PUBLIC_` directly.
**Do this instead:** Read `process.env` inside the typed config module.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Sheet (event data) | Runtime fetch via `/api/locations` | **Unchanged** — out of scope for v1.1 |
| Brevo | Server `fetch` in `lib/brevo.ts` | Now sources copy from `site-config.server.ts`; keep existing `BREVO_*`/`CONTACT_NUMBER` var names |
| Razorpay | `NEXT_PUBLIC_RAZORPAY_KEY_ID` in client | Already the correct pattern; the new public module mirrors it |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Client components ↔ `site-config.ts` | direct import, build-time inline | must use literal env reads |
| Server modules ↔ `site-config.server.ts` | direct import, runtime `process.env` | `server-only` fence prevents client leakage |
| `site-config.ts` ↔ `site-config.server.ts` | **no import between them** | keep fully separate; server may re-export public if ever needed, never the reverse |

## Sources

- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` (Next.js 16, App Router) — inlining semantics, dynamic-lookup exclusion (182–191), build-time freeze note (166), server-only default (156, 198). **HIGH confidence** (curated official docs shipped with the installed version).
- Codebase inspection: `components/PaymentSection.tsx:77` (existing `NEXT_PUBLIC` client pattern), `lib/brevo.ts` (hardcoded email copy), `components/Footer.tsx:48,55` (`href="#"` placeholders), `app/layout.tsx:23-27` (metadata), `app/page.tsx` (component tree), server/client `"use client"` grep. **HIGH confidence** (direct source read).
- `.planning/PROJECT.md` — v1.1 scope; out-of-scope event-data-in-Sheet constraint.

---
*Architecture research for: env-driven site config integration (Next.js 16 App Router)*
*Researched: 2026-07-13*
