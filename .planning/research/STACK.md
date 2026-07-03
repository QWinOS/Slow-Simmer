# Stack Research

**Domain:** Supper club / event-hosting platform
**Researched:** 2026-07-02
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|---|---|---|---|
| **Next.js** | 16.x (already set) | Full-stack React framework | App Router, Server Components, Server Actions, Route Handlers — all the primitives this platform needs. SSR for event discovery (SEO). Already scaffolded. |
| **React** | 19.x (already set) | UI runtime | Server Components, Server Actions, `use()`, `action()` — the React 19 feature set that Next.js 16 relies on. Already in the project. |
| **TypeScript** | 5.x (already set) | Type safety | Non-negotiable for a multi-model domain (events, users, RSVPs, menus). Catches schema drift between DB and UI. Already set up. |
| **TailwindCSS** | v4 (already set) | Styling | Utility-first CSS with CSS-first configuration in v4 (no `tailwind.config.js` needed). Already in the project. Already scaffolded. |
| **Neon** | Latest (serverless) | PostgreSQL database | Serverless Postgres with scale-to-zero billing, instant branching (each PR gets its own DB), native Vercel integration. Free tier: 0.5 GB storage. Launch: $19/mo. Best pure Postgres option for a platform that handles auth separately. No vendor lock-in beyond Postgres itself. |
| **Drizzle ORM** | ^0.42.x | TypeScript ORM / query builder | SQL-shaped query builder with zero runtime overhead (~7kb). First-class edge runtime support (no native binaries). Type-safe schema from a single TS file. Best fit for Neon + Next.js 16 serverless. Migrations via `drizzle-kit`. |
| **Better Auth** | ^1.x | Authentication framework | The 2026 consensus pick for new Next.js projects. Self-hosted, full data ownership, no per-user pricing. Supports email/password, OAuth (Google, GitHub), magic links, and database sessions. Framework-agnostic, works with Drizzle adapter. Auth.js (NextAuth) v5 is still maintained but active development has moved to Better Auth — this is where the ecosystem is going. |
| **shadcn/ui** | Latest (^4.x) | UI component library | The de facto component library for Next.js + TailwindCSS. Copy-paste components (no npm dependency), fully customizable with TailwindCSS v4. Provides accessible dialog, form, card, toast, and dropdown primitives needed for event CRUD, RSVP flows, and profile pages. |
| **Vercel** | Pro ($20/mo) | Hosting / deployment | Purpose-built for Next.js. Zero-config deploy, preview deploys per PR, Edge Functions, ISR, Image Optimization. The one platform where every Next.js 16 feature works before anywhere else. Hobby tier is free for MVP; Pro tier ($20/user/mo) covers production traffic for a supper club platform. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---|---|---|---|
| **UploadThing** | Latest | File uploads (menu images) | Menu image uploads in event creation flow. Pre-built React dropzone component, 5-minute integration. Free tier: 2 GB storage (more than enough for menu photos). Handles auth middleware, file type validation, CDN delivery. |
| **Resend** | Latest | Transactional email API | RSVP confirmations, host notifications, event reminders. Developer-first API with React Email template support. Free tier: 3,000 emails/month. For a supper club platform at MVP scale, this is free. Verifies domain with SPF/DKIM/DMARC. |
| **React Email** | Latest (`@react-email/components`) | Email templates | Author RSVP confirmations, host notifications, and event reminders as typed React components. Preview in browser during development. Share design tokens with the app. Renders to battle-tested email HTML (tables + inline styles) that works in Outlook, Gmail, and Apple Mail. |
| **`ics`** | ^3.12.0 | Calendar file generation | Generate `.ics` files for "Add to Calendar" buttons on event detail pages. v3.12.0 (Apr 2026) is current, 552K weekly downloads. Creates iCalendar-compliant VCALENDAR strings. Users download or auto-open in their calendar app (Apple/Google/Outlook). |
| **date-fns** | ^4.x | Date/time utilities | Format event dates, calculate "starts in X days", handle timezone display. Tree-shakeable, functional, no Moment.js baggage. Needed everywhere in an event platform. |
| **react-hook-form** | ^7.x | Form state management | Event creation/edit forms (multi-field, validation-heavy). Reduces re-renders via uncontrolled inputs. Pairs with Zod for schema validation. |
| **zod** | ^3.x | Schema validation | Validate form inputs, API request bodies, environment variables. Single source of truth for types shared between client and server. Used by Better Auth internally as well (consistent validation stack). |
| **sonner** | Latest | Toast notifications | RSVP success, event created, errors. Standard toast library in the shadcn/ui ecosystem. Lightweight, accessible, works with Server Actions. |
| **lucide-react** | Latest | Icons | Icon library used by shadcn/ui. Calendar, users, food, location, clock icons — all needed for event cards, detail pages, and nav. |
| **nuqs** | ^2.x | URL query state management | Search/filter state in URL params for event discovery. "What events are this weekend?" → `?date=weekend&location=...` in the URL. Type-safe, pairs with Next.js App Router. |

### Development Tools

| Tool | Purpose | Notes |
|---|---|---|
| **drizzle-kit** | Database migrations | `drizzle-kit generate` / `drizzle-kit migrate` / `drizzle-kit push`. Schema drift detection via `drizzle-kit studio` for visual DB inspection. |
| **Neon CLI / Dashboard** | Database management | Branch databases per PR (Neon's killer feature). View query logs, monitor compute usage. |
| **Resend Dashboard** | Email analytics | Track delivery, opens, bounces. Configure domain verification, webhooks for bounce/complaint events. |
| **UploadThing Dashboard** | File management | View uploaded files, monitor storage usage. |
| **@next/bundle-analyzer** | Bundle analysis | Catch accidental large dependencies during development (especially important with Drizzle's tiny core). |

## Installation

```bash
# Database & ORM
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Authentication
npm install better-auth @better-auth/drizzle

# UI
npx shadcn@latest init
npx shadcn@latest add button card form dialog toast dropdown-menu input label select textarea calendar popover

# File uploads
npm install uploadthing @uploadthing/react

# Email
npm install resend @react-email/components

# Forms & validation
npm install react-hook-form @hookform/resolvers zod

# Date handling
npm install date-fns

# Calendar / ICS
npm install ics

# Utilities
npm install sonner lucide-react nuqs
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| **Better Auth** | **Clerk** | If you need auth shipped in a week with pre-built login UI, social OAuth, and multi-tenant orgs — and you accept the vendor relationship and per-user pricing. Clerk is faster to prototype but locks you into their platform. Better Auth gives full data ownership. For a supper club platform that may want to self-host eventually, Better Auth's self-hosted model is the right call. |
| **Neon** | **Supabase** | If you want auth + storage + realtime bundled in one platform, Supabase is compelling. But since we're handling auth separately with Better Auth and uploads with UploadThing, Supabase's extras are unused overhead. Neon gives cleaner Postgres with branching. |
| **Drizzle ORM** | **Prisma** | If your team has mixed seniority and prefers a schema-first approach with the deepest migration tooling. Prisma 7 narrowed the edge-runtime gap via driver adapters. Drizzle wins for bundle size (~7kb vs Prisma's larger footprint) and SQL fidelity. For a new project with Neon, Drizzle is the 2026 default. |
| **UploadThing** | **Vercel Blob** | If already on Vercel Pro and want the simplest possible integration for small files (<4MB). Vercel Blob's SDK bypasses the 4.5MB serverless body limit with signed URLs. UploadThing's pre-built dropzone is faster for MVP; both are fine — pick one and commit. |
| **Resend** | **SendGrid / AWS SES** | If you're already on SendGrid or need marketing campaign features. For purely transactional email (RSVPs, notifications), Resend's API + React Email is cleaner and the free tier covers MVP scale. |
| **Vercel** | **Railway** | If you need persistent background workers or long-running websocket processes alongside the app. Railway is cheaper at scale ($30-60/mo vs Vercel's $150-400+ at production). But for a standard Next.js app with occasional CRUD and email sending, Vercel's Next.js integration is unmatched. |

## What NOT to Use

| Avoid | Why | Use Instead |
|---|---|---|
| **Mongoose / MongoDB** | No joins for event RSVPs means application-level joins and consistency headaches. An event platform with users, events, RSVPs, and menus is fundamentally relational. Postgres + Drizzle handles this naturally. | Neon (Postgres) + Drizzle ORM |
| **Auth.js v5 / NextAuth** | Auth.js has handed off active development to Better Auth. The official migration page recommends Better Auth for new projects. Auth.js v5 still receives security patches but the ecosystem momentum has shifted. Starting a new project on Auth.js in 2026 means accepting a deprecated trajectory. | Better Auth |
| **Prisma (for this project)** | Prisma's Rust binary engine creates cold-start issues on serverless, the bundle is larger, and the higher abstraction level hides SQL — which matters for event queries (RSVP counts, date-range filters, location proximity). Drizzle's SQL-shaped API gives more control with less overhead. | Drizzle ORM |
| **Moment.js** | Deprecated, large bundle, not tree-shakeable. date-fns is the modern replacement with functional API and tree-shaking. Every event platform does date math — don't start with Moment. | date-fns |
| **Nodemailer** | SMTP-based, no React Email support, no built-in deliverability tooling. Requires manual SPF/DKIM/DMARC setup and server SMTP credentials. Resend's HTTPS API eliminates socket management. | Resend + React Email |
| **PlanetScale (MySQL)** | Eliminated free tier in 2024. Minimum $39/mo. For a Postgres-native stack (Drizzle + Neon), MySQL compatibility is an unnecessary constraint. | Neon |
| **Redux / Zustand (client state)** | This is an event platform, not a stateful SPA. Next.js Server Components handle most data fetching. URL params handle filter/search state. Any component-level state (form inputs) is local. Adding a client state library is premature. | React Server Components + Server Actions + URL search params |
| **tRPC** | Adds a layer of abstraction between Server Actions and the client. Next.js 16 Server Actions are already typed RPC — `"use server"` functions called directly from forms/buttons with full type safety. tRPC is redundant in the App Router era. | Server Actions |

## Stack Patterns by Variant

**If deploying self-hosted (not Vercel):**
- Swap UploadThing → Cloudflare R2 with presigned URLs (cheaper at scale, zero egress fees)
- Keep everything else the same
- Hosting: Railway ($5-30/mo for a full Postgres + Next.js setup) or Coolify on a $6/mo VPS
- Because: Vercel's pricing is great for MVP but can scale faster than revenue at production levels

**If shipping MVP in <2 weeks:**
- Use Clerk instead of Better Auth (pre-built login UI saves days)
- Keep everything else the same
- Because: The tradeoff of vendor lock-in is worth it for speed-to-validation. Plan a migration to Better Auth post-MVP if needed.

**If payments become needed later (Phase 2+):**
- Add Stripe (latest SDK)
- Add Stripe webhooks → Resend for receipt emails
- No database migration needed — Drizzle schema extends with `orders` and `payments` tables
- Because: Payment processing was explicitly deferred in PROJECT.md. When it arrives, the stack handles it cleanly.

## Version Compatibility

| Package | Compatible With | Notes |
|---|---|---|
| Next.js 16.x + React 19.x | Drizzle ORM ^0.42.x | Drizzle has first-class edge/Server Component support. No native dependencies. Verified working in production. |
| Next.js 16.x + React 19.x | Better Auth ^1.x | Better Auth uses standard Request/Response — works in both Node.js runtime and edge. Pair with `@better-auth/drizzle` adapter. |
| Drizzle ORM + Neon | `@neondatabase/serverless` (latest) | Drizzle's `neon` HTTP driver adapter or the WebSocket driver. Both work. HTTP is faster for serverless (fewer connections). |
| shadcn/ui + TailwindCSS v4 | Latest (shadcn 4.12.0+) | shadcn/ui v4 supports TailwindCSS v4 natively. Run `npx shadcn@latest init` to set up. |
| Resend + React Email | `resend` SDK + `@react-email/components` | Render email templates to HTML with `render()` on the server only. Never import React Email components in client bundles. |
| `ics` ^3.12.0 + Node.js | ESM and CJS | ESM import: `import * as ics from 'ics'`. Works in Route Handlers and Server Actions. No native dependencies. |

## Sources

- [Better Auth docs](https://better-auth.com/) — Library docs and installation guide. Confidence: HIGH (official docs)
- [Drizzle ORM docs](https://orm.drizzle.team/) — Current version and API reference. Confidence: HIGH (official docs)
- [Neon docs](https://neon.tech/docs) — Serverless Postgres configuration. Confidence: HIGH (official docs)
- [LogRocket — Best auth library for Next.js 2026](https://blog.logrocket.com/best-auth-library-nextjs-2026/) — Comparison of Auth.js, Clerk, WorkOS, Better Auth. Published Apr 2026. Confidence: MEDIUM (blog, but well-researched)
- [Shubhra Dev — Next.js 16 Auth 2026](https://shubhra.dev/blog/nextjs-16-auth-better-auth-vs-clerk-vs-authjs) — Direct comparison with Auth.js → Better Auth migration context. Published Jun 2026. Confidence: MEDIUM (personal blog, but cites official migration docs)
- [Cadence blog — File uploads Next.js 2026](https://cadence.withremote.ai/blog/file-uploads-nextjs) — UploadThing vs Vercel Blob vs R2 comparison. Published May 2026. Confidence: MEDIUM
- [Cadence blog — Drizzle vs Prisma 2026](https://cadence.withremote.ai/blog/drizzle-vs-prisma) — ORM comparison. Published May 2026. Confidence: MEDIUM
- [DesignRevision — Neon vs Supabase vs PlanetScale 2026](https://designrevision.com/blog/supabase-vs-neon) — Database comparison. Published Feb 2026. Confidence: MEDIUM
- [Resend docs — Send with Next.js](https://resend.com/docs/send-with-nextjs) — Official integration guide. Confidence: HIGH (official docs)
- [Next.js Launchpad — Resend + React Email 2026](https://nextjslaunchpad.com/article/nextjs-transactional-emails-resend-react-email) — Transactional email patterns. Published May 2026. Confidence: MEDIUM
- [Causo Hub — Vercel vs alternatives 2026](https://hub.causo.ai/guides/vercel-vs-alternatives-founders-2026) — Hosting comparison for founders. Published May 2026. Confidence: MEDIUM
- [DEV Community — Managed Postgres for Next.js 2026](https://dev.to/whoffagents/neon-vs-supabase-vs-planetscale-managed-postgres-for-nextjs-in-2026-2el4) — Database provider comparison. Published Apr 2026. Confidence: MEDIUM
- [ics npm package](https://www.npmjs.com/package/ics) — v3.12.0 released Apr 2026. Confidence: HIGH (package registry)
- [shadcn/ui GitHub](https://github.com/shadcn-ui/ui) — Latest v4.12.0 (Jun 2026), Next.js 16.2.6 support. Confidence: HIGH (official repo)

---
*Stack research for: Supper club / event-hosting platform*
*Researched: 2026-07-02*
