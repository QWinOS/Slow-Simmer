# Stack Research

**Domain:** Env-driven centralized site config for Next.js 16 App Router + TypeScript
**Milestone:** v1.1 Env-Driven Site Config (subsequent milestone; v1.0 stack already shipped)
**Researched:** 2026-07-13
**Confidence:** HIGH

> Note: This file was regenerated for milestone v1.1. The prior v1.0 ecosystem stack research (Neon/Drizzle/Better Auth/Clerk/Resend etc.) described a proposed greenfield stack that was NOT the stack ultimately shipped — the app shipped on Google Sheets + Drive + Razorpay + Brevo with no DB/ORM/auth. This v1.1 research is scoped only to the new env-config capability and reflects the real, shipped codebase.

## TL;DR Recommendation

**Build a plain typed config module (`lib/site-config.ts`) using the `zod` v4 you already have installed. Do NOT add `@t3-oss/env-nextjs` or any new dependency.**

For a single-maintainer, single-page marketing site whose new config is non-secret display copy with sensible fallbacks, a validation *library* buys almost nothing a ~40-line typed module doesn't, while adding a dependency, a build-time failure surface, and destructuring boilerplate. Zod is already a dependency (`^4.4.3`, used in `lib/validations.ts`), so you get schema-backed parsing, coercion, and full type inference at **zero new cost**. The one non-negotiable is the **`NEXT_PUBLIC_` static-access rule**, which dictates the module's shape regardless of approach.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 16.2.10 (installed) | Env loading + `NEXT_PUBLIC_` build-time inlining | Its built-in `.env*` loader + inliner IS your env system — nothing to add. |
| TypeScript | ^5 (installed) | Static typing of config accessors | Delivers the "typed accessors" the milestone asks for via `export const siteConfig = {...} as const` or `z.infer`. |
| zod | 4.4.3 (installed) | Optional runtime shape/coercion + type inference for the config object | **Already installed** (used in `lib/validations.ts`). Reuse it: one schema → `z.infer` types + coercion (seat count → number) + fallbacks, at zero new dependency cost. |

**No new packages are required for this milestone.**

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| _(none)_ | — | — | This milestone needs no new library. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `.env.example` (existing convention) | Documents every new var | Milestone requires documenting each new var here. Group `NEXT_PUBLIC_*` separately from server-only vars. Existing keys (confirmed from source): `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `BREVO_API_KEY/SENDER_EMAIL/SENDER_NAME`, `CONTACT_NUMBER`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEETS_*`, `VIDEOS_SHEET_ID`, `DRIVE_FOLDER_ID`. (Agent could not read `.env.example` directly — permission denied — keys derived from `grep process.env` across `lib/` + `app/`.) |
| Existing `process.env` pattern | Current baseline | Codebase already reads `process.env.X!` and `process.env.X \|\| "fallback"` (see `lib/brevo.ts`, `lib/razorpay.ts`). The new module formalizes this in one place. |

## Installation

```bash
# Nothing to install. zod@4.4.3 is already a dependency.
```

## The Decision: Validation Library vs Plain Typed Module

### Decision matrix

| Criterion | Plain typed module (fallbacks) | Plain module + zod (RECOMMENDED) | `@t3-oss/env-nextjs` |
|-----------|-------------------------------|----------------------------------|----------------------|
| New dependencies | 0 | 0 (zod already present) | +1 (`@t3-oss/env-nextjs@0.13.11`) |
| Cost | Free | Free | Free, but extra maintenance surface |
| Type safety | Manual `as const` / interface | `z.infer` — automatic | Automatic |
| Server/client split enforcement | Manual discipline | Manual discipline | **Enforced** (throws if a server var is read on client) |
| Coercion (seat count→number, bool flags) | Manual `Number()` | `z.coerce.number()` | via zod schema |
| Fail-fast on missing var | Only if coded | Only if coded (fallbacks make most vars optional) | **Yes, at build/boot** |
| `NEXT_PUBLIC_` destructuring boilerplate | Write once | Write once | **Mandated** (`experimental__runtimeEnv`) — same boilerplate |
| Fit for THIS project | Good | **Best** | Over-engineered |

### Why plain-module-plus-zod wins for Slow Simmer

1. **The new config is display copy with fallbacks, not fail-fast secrets.** Social handles, brand name, tagline, marketing blocks, email copy — each has a sensible default and the site must render even if a var is missing. `@t3-oss/env-nextjs`'s headline feature is *throwing at build/boot when a required var is absent* — the wrong behavior for optional cosmetic copy. You'd mark everything `.optional()` and defeat the library's main value.

2. **Secrets are already handled and out of scope.** Razorpay/Brevo/Google secrets already use `process.env.X!` inline and are validated implicitly by the APIs consuming them. This milestone targets *content*, not secrets. No new "must-not-boot-without-it" variable exists.

3. **Zero-cost, single-maintainer.** Zod already ships. Adding t3-env means one more package kept in lockstep with Next.js majors (`next` + validator peer deps; historically needs bumps across Next versions). For a solo maintainer optimizing for "zero additional spend and simplicity," fewer moving parts wins.

4. **t3-env's enforced server/client split is nice, but file discipline gets ~90% of it** (see Integration Points). Its runtime "you accessed a server var on the client" guard matters for teams; one person authoring one file does not need a runtime tripwire.

**When to reconsider t3-env:** if this app later gains required-at-boot integrations (real DB URL, auth secret) that should hard-fail the deploy when unset, adopt `@t3-oss/env-nextjs@0.13.11` then. Clean drop-in; pairs with installed zod v4 (peer `^3.24.0 || ^4.0.0` ✓).

## Next.js 16 App Router Specifics (critical constraints)

From `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` (bundled with installed next@16.2.10). Behavior is unchanged from prior versions but is **load-bearing** for `lib/site-config.ts`:

1. **`NEXT_PUBLIC_` vars are inlined at BUILD time, only via static literal access.**
   `process.env.NEXT_PUBLIC_BRAND_NAME` is replaced with a hard-coded string during `next build`. **Dynamic access is NOT inlined:**
   ```ts
   // ✅ inlined — safe in client components
   const brand = process.env.NEXT_PUBLIC_BRAND_NAME
   // ❌ NOT inlined — becomes undefined in the browser
   const key = "NEXT_PUBLIC_BRAND_NAME"; const brand = process.env[key]
   const env = process.env; const brand = env.NEXT_PUBLIC_BRAND_NAME
   ```
   **Consequence:** each `NEXT_PUBLIC_` var must appear as an explicit `process.env.NEXT_PUBLIC_XXX` literal in source. No looping over keys, no spreading `process.env`, to build the client-facing config. (This is the exact rule that forces t3-env's manual `experimental__runtimeEnv` destructuring — you pay the boilerplate either way; a plain module just makes it visible.)

2. **`NEXT_PUBLIC_` values are frozen at build time** — no response to env changes without a rebuild. Matches the milestone's "Out of Scope: live-editable browser config" note: anything needing no-redeploy edits stays in the Google Sheet. Brand/social/marketing copy changing on redeploy is intended.

3. **Non-prefixed vars are server-only** and never reach the browser bundle. Confirmation *email copy* is consumed server-side (Brevo send path: `lib/brevo.ts` + webhook route), so email copy vars should be **server-only (no prefix)**, keeping them out of the client bundle. Only values rendered in client components need `NEXT_PUBLIC_`.

4. **Server env reads during dynamic rendering are fine.** In Server Components/route handlers, `process.env.X` reads at request time (`await connection()` to force request-time evaluation). Static marketing copy read at build needs no special handling.

## Recommended `NEXT_PUBLIC_` vs Server-Only Split

| Config group | Consumed where | Prefix | Rationale |
|--------------|----------------|--------|-----------|
| Brand name, tagline | Client (navbar/hero) AND `metadata` (server) | `NEXT_PUBLIC_` | Rendered in client UI; also usable server-side. Public anyway. |
| SEO title / meta description | `generateMetadata` / `metadata` export (server) | **Prefer no prefix** | Metadata runs server-side; no need to bloat client bundle. Use `NEXT_PUBLIC_` only if the same string also shows in client UI. |
| Social handles (IG/YouTube/LinkedIn/WhatsApp) | Footer (currently client `href="#"`) | `NEXT_PUBLIC_` | Rendered directly in browser markup. Public by definition. |
| Marketing copy (hero, about, membership, cities, seat count) | Mix of client + server components | `NEXT_PUBLIC_` for client-rendered; no prefix if server-only | Split per component. Seat count → coerce to number. |
| Confirmation email copy (subject/body/signature) | Server only (Brevo send in webhook / `lib/brevo.ts`) | **No prefix** | Never rendered client-side. Keep out of the client bundle. |

**Rule of thumb:** prefix a var `NEXT_PUBLIC_` **only if a Client Component renders it.** Everything else stays server-only.

## Integration Points

1. **New file `lib/site-config.ts`** — the single source of truth. Two clearly separated sections:
   ```ts
   import { z } from "zod"  // already a dep

   // --- CLIENT (NEXT_PUBLIC_, must be static literal access) ---
   const clientRaw = {
     brandName: process.env.NEXT_PUBLIC_BRAND_NAME,
     tagline: process.env.NEXT_PUBLIC_TAGLINE,
     instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
     youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL,
     // ...one explicit literal per NEXT_PUBLIC_ var
   }

   const schema = z.object({
     brandName: z.string().default("Slow Simmer"),
     seatCount: z.coerce.number().default(20),
     // ...
   })
   export const siteConfig = schema.parse(clientRaw)
   export type SiteConfig = z.infer<typeof schema>
   ```
   Use `.default(...)` (or `.catch(...)`) on every field so missing vars degrade gracefully instead of throwing — matches the "safe fallbacks" requirement.

2. **Replace inline reads** in the Footer (`href="#"` → `siteConfig.instagram`), hero/about/membership components, `app/layout.tsx` `metadata`, and `lib/brevo.ts` email copy.

3. **`.env.example`** — add every new var with a comment + example value; group `NEXT_PUBLIC_*` separately from server-only vars.

4. **Server/client boundary discipline:** to make a bundler-level leak impossible, split into `lib/site-config.ts` (client-safe, `NEXT_PUBLIC_` only) + `lib/site-config.server.ts` (server-only, e.g. email copy) so client components can never import server-only fields. This is the poor-man's version of t3-env's runtime guard — recommended for peace of mind, still zero deps.

## What NOT to Use / What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@t3-oss/env-nextjs` (this milestone) | Core value is fail-fast on missing *required* vars; new vars are optional display copy with fallbacks. Adds a dep + Next-version-coupled maintenance for a solo maintainer. | Plain module + already-installed zod. Revisit only if a future required-at-boot secret appears. |
| `valibot` (1.4.2) | Smaller bundle than zod, but you already ship zod v4 for forms. Adding valibot = two validation libs, no benefit here. | Reuse zod v4. |
| `dotenv` / `@next/env` at runtime | Next.js already auto-loads `.env*` into `process.env`. `@next/env` is only for *outside* the Next runtime (ORM config, test bootstrap) — not app code. | Built-in Next.js env loading. |
| Looping/spreading to build client config (`Object.entries(process.env)`, `{...process.env}`) | Breaks `NEXT_PUBLIC_` inlining → `undefined` in the browser. | Explicit `process.env.NEXT_PUBLIC_X` literal per var. |
| Email copy behind `NEXT_PUBLIC_` | Ships server-only copy into the client bundle unnecessarily. | Keep email copy server-only (no prefix). |
| A runtime config API / no-redeploy editing | Out of scope per PROJECT.md; that role is filled by the Google Sheet. | Google Sheet for anything needing live edits. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Plain module + zod | `@t3-oss/env-nextjs@0.13.11` | You add a *required* var that must hard-fail build/deploy when unset (DB URL, auth secret), or a team wanting a runtime server-var-leak guard worth a dependency. |
| zod v4 (installed) | valibot 1.4.2 | Greenfield project with no existing validation lib and a strict client-bundle-size budget. Not applicable — zod already present. |
| zod schema with `.default()` | Hand-rolled `?? "fallback"` + TS `interface` | You want the absolute minimum, are fine writing fallbacks + types by hand, and skip coercion. Valid; saves ~15 lines but loses inferred types + coercion. Zod is the better free option since it's already there. |

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.2.10 | zod@4.4.3 | No coupling — zod is runtime-agnostic. ✓ |
| @t3-oss/env-nextjs@0.13.11 (if ever added) | zod@^3.24.0 \|\| ^4.0.0 | Peer range covers installed zod 4.4.3. Also peers `next`. ✓ but not recommended now. |

## Sources

- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` (bundled with installed next@16.2.10) — HIGH: `NEXT_PUBLIC_` build-time inlining, no-dynamic-lookup rule, server-only default, runtime env via `connection()`, load order. Authoritative for this exact Next version.
- Codebase inspection (`lib/brevo.ts`, `lib/razorpay.ts`, `components/PaymentSection.tsx`, `lib/validations.ts`, `package.json`) — HIGH: existing `process.env` patterns; zod@4.4.3 already installed and used for validation.
- `npm view` — HIGH: `@t3-oss/env-nextjs@0.13.11` (peers: zod `^3.24.0 || ^4.0.0`, valibot, arktype, typescript ≥5), `zod@4.4.3`, `valibot@1.4.2`.
- [T3 Env — Next.js docs](https://env.t3.gg/docs/nextjs) & [t3-oss/t3-env GitHub](https://github.com/t3-oss/t3-env) — MEDIUM/HIGH: `runtimeEnv` vs `experimental__runtimeEnv` manual destructuring stems from the same Next inlining rule.
- [Next.js Guides: Environment Variables](https://nextjs.org/docs/pages/guides/environment-variables) — HIGH: corroborates bundled docs.

---
*Stack research for: env-driven centralized site config (Next.js 16 App Router + TypeScript)*
*Researched: 2026-07-13*
