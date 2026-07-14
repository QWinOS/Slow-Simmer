# Feature Research

**Domain:** Env-driven / centralized site configuration for a small single-maintainer Next.js content site
**Researched:** 2026-07-13
**Milestone:** v1.1 Env-Driven Site Config
**Confidence:** HIGH (Next.js env conventions are stable, well-documented, and directly verifiable against the shipped codebase)

> Note: this file was previously the v1.0 supper-club *platform* feature survey. It has been replaced with v1.1 milestone research (env-driven config). The v1.0 survey is preserved in git history if needed.

## Context Recap

Milestone v1.1 externalizes hardcoded content in the shipped "Slow Simmer" site into env vars, read through **one central typed module** (`lib/site-config.ts`). Content categories in scope:

1. **Social handles** — Instagram / YouTube / LinkedIn / WhatsApp. Footer currently hardcodes only Instagram + YouTube as `href="#"` placeholders (`components/Footer.tsx:48,55`). LinkedIn/WhatsApp icons don't exist yet.
2. **Brand identity** — name, tagline, SEO `<title>` + meta description. Currently hardcoded in `app/layout.tsx:24–27` (metadata) and repeated as string literals in `Footer.tsx:37,40` and `brevo.ts:31,52`.
3. **Confirmation email copy** — subject/body/signature hardcoded in `lib/brevo.ts:39–54` (server-side).
4. **Marketing copy** — hero (`HeroSection.tsx`), About highlights + "Kolkata & Bangalore" + seat count ("10–14") (`AboutSection.tsx:93`, `HeroSection.tsx:6`), Membership reasons/steps (`MembershipSection.tsx:6–29`).

Key architectural constraint (PROJECT.md): `NEXT_PUBLIC_*` vars are **build-time**, inlined by string replacement at `next build`. Runtime-editable content (event date/price/location) deliberately stays in the Google Sheet. So this milestone is a *deploy-time* config system, not a live CMS.

## How env-driven config works in small Next.js sites (behavioral baseline)

Established conventions this milestone should conform to. Each maps to a decision below.

| Concern | Standard Next.js behavior | Recommended for this project |
|---------|---------------------------|------------------------------|
| **Server vs browser exposure** | Only `NEXT_PUBLIC_`-prefixed vars are inlined into client bundles; unprefixed vars are server-only. | Footer / Hero / Membership are `"use client"` — values they reference **must** be `NEXT_PUBLIC_` (or passed as props from a server parent). Email copy in `brevo.ts` stays **unprefixed** (server-only). |
| **Missing / empty var** | `process.env.FOO` is `undefined` / `""`; Next.js does **not** fail the build for a missing `NEXT_PUBLIC_` var — it silently renders `undefined`/blank. | The single most important UX decision — see "Fallback behavior". Never render raw `undefined`. |
| **Build-time inlining** | `NEXT_PUBLIC_` values are frozen at build; changing them requires a redeploy. | Acceptable and intended. Document in `.env.example` that public vars need a rebuild. |
| **Documentation** | `.env.example` (committed) lists every var with placeholder values; real values live in uncommitted `.env.local` / host dashboard. | Every new var added to `.env.example` with a comment + sample. Table stakes. |
| **Single source of truth** | Read `process.env` in exactly one module, export typed accessors; components import from that module, never touch `process.env` directly. | The whole point of `lib/site-config.ts`. One `.env` change → all usages update, since all resolve through the same accessor. |

## Feature Landscape

### Table Stakes (Users Expect These)

"Users" = the single maintainer editing config, plus visitors who must never see broken output.

| Feature | Why Expected | Complexity | Notes / Dependencies |
|---------|--------------|------------|----------------------|
| **Central typed config module** (`lib/site-config.ts`) | The stated goal; without it there's no single source of truth. Typed accessors give autocomplete + compile-time safety. | MEDIUM | New file. Reads `process.env.NEXT_PUBLIC_*` (public) and server-only vars. Export a frozen typed object so the config shape is discoverable. |
| **Safe fallback for every value** (never render `undefined`/blank) | A missing var must degrade to the current hardcoded copy, not blank the hero or ship the literal string "undefined". | LOW–MEDIUM | Each accessor: `process.env.NEXT_PUBLIC_HERO_TITLE ?? "The Art of the Unhurried Table"`. Fallback = today's shipped copy, so an empty `.env` reproduces the current site exactly. Guards the whole migration against typos. |
| **`.env.example` documents every var** | Only way the maintainer discovers what's configurable; the config surface is otherwise invisible. | LOW | Extend existing `.env.example`. Group by category (Brand / Social / Email / Marketing). One commented line per var with a realistic sample. |
| **`NEXT_PUBLIC_` prefix on all browser-facing values** | Client components (`Footer`, `HeroSection`, `MembershipSection`) can't read unprefixed vars — they'd be `undefined` at runtime. | LOW | Enforce naming discipline. Email copy stays unprefixed (server-only). Mixing this up is the #1 silent bug (see PITFALLS). |
| **Social handles wired to real URLs** | The literal ask — replace `href="#"` placeholders so icons actually navigate. | LOW | Footer already renders Instagram/YouTube icons; swap `href="#"` → `siteConfig.social.instagram`. LinkedIn + WhatsApp icons must be **added** (don't exist in `Footer.tsx`). |
| **Brand name/tagline/SEO from config** | A rebrand or copy tweak shouldn't require editing 4 files (`layout.tsx`, `Footer.tsx` ×2, `brevo.ts`). | LOW–MEDIUM | `layout.tsx` metadata is server-side (easy). Footer is client — read via config accessor. SEO `title`/`description` read in the `metadata` export. |
| **Email copy from config** | Subject/body/signature are the maintainer's voice; editing TS string arrays in `brevo.ts` is fragile. | MEDIUM | Server-only vars (no `NEXT_PUBLIC_`). Body is multi-line HTML — see anti-features re: not over-templating. Keep `params.name/location/date` interpolation in code; externalize only the static copy shell (subject, intro, signature). |

### Differentiators (Competitive Advantage)

Higher-polish behaviors that meaningfully improve maintainer/visitor experience without over-building.

| Feature | Value Proposition | Complexity | Notes / Dependencies |
|---------|-------------------|------------|----------------------|
| **Conditional hide: drop a social icon when its URL is unset** | The key UX decision. An unset handle renders **nothing**, not a dead `#` link or broken icon. A maintainer with no LinkedIn leaves `NEXT_PUBLIC_LINKEDIN_URL` blank and the icon disappears. | LOW–MEDIUM | Drive the footer icon row from an array filtered by truthiness: `[{icon, url}].filter(s => s.url)`. Requires the config module to return `undefined`/`""` for unset social (NOT a fallback). This is the one category where blank ≠ fallback-to-default; blank = "I don't have this". |
| **Fail-fast validation for required server secrets** | Missing `BREVO_API_KEY` already throws at send-time (`brevo.ts:17`). A lightweight "assert required env present" surfaces misconfig at boot/build instead of mid-payment. | MEDIUM | Keep tiny — hand-rolled check or a minimal schema for the ~5 *required* secrets only. Do NOT validate the dozens of optional copy vars (they have fallbacks by design). Scope carefully or it becomes an anti-feature. |
| **Grouped/namespaced config shape** (`siteConfig.social.instagram`, `siteConfig.brand.name`, `siteConfig.email.subject`) | Readability + discoverability; the maintainer/agent sees the whole config surface as one typed tree. | LOW | Pure code organization inside the module. No runtime cost. |
| **`.env.example` grouped with rebuild-requirement comments** | Tells the maintainer which vars need a redeploy (all `NEXT_PUBLIC_`) vs runtime (none here — that's the Sheet). Prevents "I changed the tagline but the site didn't update" confusion. | LOW | Documentation quality, not code. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Full CMS / admin UI / DB-backed config** | "Wouldn't it be nice to edit copy in a dashboard?" | Massive over-build for a single-maintainer site editing copy a few times a year. Adds a DB/service, auth, hosting cost — violates the zero-additional-spend constraint. The Google Sheet already covers the one truly-dynamic category (event details). | Env vars + redeploy for static copy; Google Sheet for runtime data. Both already free. |
| **Live / no-redeploy `NEXT_PUBLIC_` editing** | "Change the tagline without redeploying." | Impossible by design — `NEXT_PUBLIC_` is inlined at build. Chasing it leads to a runtime-config API route reading env per request, defeating the simplicity. Explicitly out of scope per PROJECT.md. | Accept redeploy for static copy. Values needing live edits go in the Sheet (like event details already do). |
| **Heavy validation framework (full zod schema over all vars, custom DSL)** | "Type-safe env, fail on any missing var." | Applied to *optional copy* vars it turns graceful fallbacks into hard build failures — the opposite of the desired "empty var → sensible default" behavior. Also adds a dependency for ~40 mostly-optional strings. | Validate only the handful of *required secrets* (Brevo/Razorpay/Google). Let all copy/social vars fall back silently. Keep validation hand-rolled or a minimal schema over required-only. |
| **Templating engine for email body (Handlebars/MJML/etc.)** | "Make the email fully customizable via env." | The body in `brevo.ts` is already a controlled HTML string with a few interpolations. A templating layer + escaping concerns + a big multi-line env var is fragile (newlines/HTML in `.env` are painful). | Externalize only the *static copy pieces* (subject, intro line, signature) as short env strings; keep the HTML shell + `params` interpolation in code. |
| **i18n / multi-locale config** | "What if we add languages?" | No signal of multi-language need; single event, two Indian cities, English site. Doubles the config surface for zero current value. | Single-locale env vars. Revisit only on a real second-language requirement. |
| **Per-environment copy variants abstraction (staging vs prod copy)** | "Different copy in preview." | Env-var *values* already differ per environment via `.env.local` / host env — no extra feature needed. A "variants" abstraction is redundant. | Rely on the platform's existing per-environment env var support. |
| **Env-driving event date/time/price/location** | "Externalize everything for consistency." | Explicitly out of scope — these are *runtime-editable* via the Sheet on purpose. Moving them to `NEXT_PUBLIC_` would make them require a redeploy — a regression. | Leave in the Google Sheet. Config module handles only static brand/social/copy. |

## Feature Dependencies

```
lib/site-config.ts (central typed module)
    ├──required-by──> Social handles wired to real URLs
    │                     └──enables──> Conditional-hide social icon (needs unset→blank semantics)
    ├──required-by──> Brand identity (name / tagline / SEO)
    ├──required-by──> Marketing copy blocks (Hero / About / Membership)
    └──required-by──> Email copy externalization (server-only branch of the module)

Safe-fallback behavior ──applies-to──> Brand, Marketing, Email copy   (unset → default copy)
Conditional-hide      ──applies-to──> Social handles ONLY             (unset → render nothing)
   └──conflicts-with──> Safe-fallback  (a social handle must NOT fall back to a placeholder URL)

.env.example documentation ──documents──> every var the module reads

NEXT_PUBLIC_ prefix ──required-by──> every value read inside "use client" components
   (Footer, HeroSection, MembershipSection)   ← hard runtime constraint, not optional
```

### Dependency Notes

- **Everything requires `lib/site-config.ts` first:** it's the foundation; all other features are just "point component X at accessor Y." Build the module (fallbacks + grouped shape) before wiring any component.
- **Conditional-hide requires unset→blank semantics and *conflicts* with safe-fallback:** two opposite behaviors coexist in the same module. Copy fields fall back to defaults; social URLs return `undefined` when unset so the footer can filter them out. Do NOT apply a default placeholder to social URLs — that reintroduces the dead `href="#"` problem. Make the asymmetry explicit: `social.*` accessors return `string | undefined`; `brand.*`/`marketing.*` return `string` with a `??` fallback.
- **`NEXT_PUBLIC_` prefix is a hard constraint for client components:** `Footer`, `HeroSection`, `MembershipSection` are `"use client"`. Any env value they read must be `NEXT_PUBLIC_`-prefixed or it is `undefined` at runtime (silently — no error). The most common silent failure; drives naming of the entire public config surface.
- **Email copy is the server-only branch:** `brevo.ts` runs server-side, so its vars stay unprefixed. The module can expose an `email.*` group imported only by server code. Keep it separate from the `NEXT_PUBLIC_` groups.

## MVP Definition

### Launch With (v1.1)

- [ ] **`lib/site-config.ts`** — grouped typed accessors + safe fallbacks. Foundational; nothing else works without it.
- [ ] **Social handles (Instagram, YouTube, LinkedIn, WhatsApp)** from config, with **conditional-hide when unset**. Requires adding LinkedIn + WhatsApp icons to `Footer.tsx`.
- [ ] **Brand identity** (name, tagline, SEO title + description) from config — dedupes the same strings across `layout.tsx`, `Footer.tsx`, `brevo.ts`.
- [ ] **Marketing copy blocks** (hero title/tagline/CTA, About highlights + cities, seat count, Membership reasons/steps) from config with fallbacks.
- [ ] **Email copy** (subject, intro, signature) from server-only config in `brevo.ts`.
- [ ] **`.env.example`** extended with every new var, grouped and commented.

### Add After Validation (v1.x)

- [ ] **Fail-fast validation for required secrets only** — add once the config module is stable; must be scoped to required secrets so it doesn't break optional-copy fallbacks.
- [ ] **Rebuild-requirement note in `.env.example`** — small doc polish clarifying `NEXT_PUBLIC_` = redeploy.

### Future Consideration (v2+)

- [ ] CMS-like editing, live public config, i18n, email templating — deliberately deferred / avoided (see Anti-Features). Revisit only on a concrete new requirement.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `lib/site-config.ts` (typed module + fallbacks) | HIGH | MEDIUM | P1 |
| Social handles + conditional-hide when unset | HIGH | LOW–MEDIUM | P1 |
| Safe fallback for every copy value | HIGH | LOW | P1 |
| `.env.example` documents every var | HIGH | LOW | P1 |
| `NEXT_PUBLIC_` discipline on client-read values | HIGH | LOW | P1 |
| Brand identity (name/tagline/SEO) from config | HIGH | LOW–MEDIUM | P1 |
| Email copy externalization | MEDIUM | MEDIUM | P1 |
| Marketing copy blocks from config | MEDIUM | MEDIUM | P1 |
| Grouped/namespaced config shape | MEDIUM | LOW | P2 |
| Fail-fast validation (required secrets only) | MEDIUM | MEDIUM | P2 |
| `.env.example` rebuild-requirement note | LOW | LOW | P2 |
| CMS / live public config / i18n / email templating | LOW | HIGH | P3 (avoid) |

**Priority key:** P1 = must have for the milestone · P2 = should have, add when convenient · P3 = defer / avoid.

## Key Behavioral Decisions (for requirements definition)

1. **Missing/empty copy var → graceful fallback to current shipped copy.** Never blank, never `undefined`, never a build error. An empty `.env` must reproduce today's site byte-for-byte. Makes the migration safe and reversible.
2. **Missing/empty social URL → hide the icon entirely.** The one exception to fallback: no default placeholder URL. Footer renders social icons from a truthiness-filtered array. This is the explicit UX ask and the reason `social.*` and `brand.*`/`marketing.*` accessors have *different* return types (`string | undefined` vs `string`).
3. **Single source of truth = one module, imported everywhere.** No component reads `process.env` directly. Changing a value in `.env` updates every usage because every usage resolves through the same accessor (e.g. the brand name currently duplicated in 4 places collapses to one accessor).
4. **`.env.example` is the contract.** Every configurable value has a documented, grouped, commented entry. It's the only discoverable map of the config surface.
5. **Build-time, not runtime.** `NEXT_PUBLIC_` changes need a redeploy — accepted and documented. Truly-dynamic data stays in the Google Sheet.

## Sources

- Codebase (authoritative for current state): `components/Footer.tsx`, `app/layout.tsx`, `lib/brevo.ts`, `components/HeroSection.tsx`, `components/AboutSection.tsx`, `components/MembershipSection.tsx`, `.planning/PROJECT.md`.
- Next.js environment-variable conventions: `NEXT_PUBLIC_` build-time inlining, server-only vars, `.env.example` documentation pattern, and absence of build failure on unset public vars (stable, long-standing App Router behavior). Confidence HIGH — cross-checked against the shipped code's existing env usage (`brevo.ts` already reads `process.env.BREVO_*` / `CONTACT_NUMBER` with `|| ""` fallbacks, confirming the fallback idiom is already in use).

---
*Feature research for: env-driven centralized site config (single-maintainer Next.js content site)*
*Researched: 2026-07-13*
