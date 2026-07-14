# Project Research Summary

**Project:** Slow Simmer
**Domain:** Env-driven site configuration (Next.js 16 App Router on Vercel)
**Researched:** 2026-07-13
**Confidence:** HIGH

> Synthesized by the orchestrator: STACK/FEATURES/ARCHITECTURE/PITFALLS all completed on disk; the synthesizer spawn was skipped after a 402 usage-limit on the 4th agent. All four source files are substantive and agree.

## Executive Summary

v1.1 is an internal refactor: move hardcoded site content (social handles, brand identity, email copy, marketing copy) out of components and into environment variables, read through **one central typed config module** so a single `.env` change updates every usage. This is not a new product surface — the app already uses `process.env` for all secrets and reads event date/time/price/location from a Google Sheet at runtime (deliberately left there).

The unanimous stack recommendation is **add nothing**: `zod@4.4.3` is already installed (`lib/validations.ts`), so the config module is a plain typed module backed by existing zod with `.default()` fallbacks. `@t3-oss/env-nextjs` is over-engineered here because the new vars are optional display copy with fallbacks — its fail-fast value doesn't apply. The one small dependency to add is **`server-only`** (currently absent; `client-only` is present) to compiler-enforce the client/server boundary.

The dominant risk is **operational, not architectural**, and it already has a track record on this project: the resolved incident where `BREVO_API_KEY`/`BREVO_SENDER_EMAIL` were present-but-empty in Vercel Production and a `.catch()` swallowed the failure. Adding ~15+ new vars multiplies that surface. Two pitfalls carry the milestone's real weight: **empty-string env vars** (treat `""` as missing) and **`NEXT_PUBLIC_` build-time staleness** (dashboard change ≠ live change without a redeploy; computed-key reads silently become `undefined` in the browser).

## Key Findings

### Recommended Stack

Build `lib/site-config.ts` as a plain typed module using the **already-installed zod**. No env-validation library, no CMS, no templating engine.

**Core technologies:**
- **zod@4.4.3 (already installed)** — validate/parse `process.env` once; `.min(1)` on required, `.default()` on optional. Zero new dependency.
- **`server-only` (ADD — small)** — top-of-file fence on the secret/server config module so an accidental client import is a *build error*, not a silent leak.
- **Next.js 16 `NEXT_PUBLIC_` inlining (native)** — the real constraint: each browser-facing var must be a static literal `process.env.NEXT_PUBLIC_X`; no loops/destructuring/computed keys (they compile to `undefined` in the browser).

### Expected Features

**Must have (table stakes):**
- Central typed config module as single source of truth (collapses e.g. "Slow Simmer" from 4+ sites to one accessor)
- Two accessor behaviors: **copy** (`brand.*`, `marketing.*`, email copy) falls back to today's shipped strings → empty `.env` renders byte-identical to now; **social URLs** return `string | undefined` → footer **hides** the icon when unset (replaces current `href="#"` placeholders)
- `.env.example` documenting every var (grouped, annotated required/optional + `NEXT_PUBLIC_`/server, non-empty examples)
- Empty-string-as-missing guard everywhere

**Should have (competitive):**
- Boot-time validation of required vars (fail loud, not blank) — directly answers the incident
- Wiring all four social handles (means **adding LinkedIn + WhatsApp icons** — Footer only has Instagram + YouTube today)

**Defer (v2+):**
- Fail-fast `@t3-oss/env-nextjs`, drift-test automation, any admin/CMS UI, live no-redeploy public config (that's what the Sheet is for)

### Architecture Approach

**Decisive:** split into two modules, not one.

**Major components:**
1. **`lib/site-config.ts` (PUBLIC)** — only `NEXT_PUBLIC_*` static-literal reads; safe to import from any client component (Footer, Hero, Membership, NavBar, PaymentSection).
2. **`lib/site-config.server.ts` (SERVER-ONLY)** — `import "server-only"` at top; email copy + any server-read strings; imported by `lib/brevo.ts` and `app/layout.tsx` metadata only. Prevents secret/server refs entering the client bundle graph.
3. **Consumers** — each accessor defaults to the exact current hardcoded string, so every migration step is a behavior-neutral refactor (unset env == today's output).

Note: AboutSection/Footer are Server Components; Hero/Membership/NavBar/PaymentSection are `"use client"`. Existing proof-of-pattern: `PaymentSection.tsx:77` already reads `process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID` directly in a client file.

### Critical Pitfalls

1. **Empty-string env var = silent blank/failure (THE incident, now ×15)** — treat `""` as missing via `requireEnv`/`optionalEnv`; boot-validate required vars; smoke-check live values after redeploy.
2. **`NEXT_PUBLIC_` build-time freeze** — dashboard change needs a fresh redeploy (no build cache); reference each public var as a single static literal, never a computed key.
3. **Secret leak via client import or `NEXT_PUBLIC_` prefix** — never prefix a secret; split public vs `server-only` module; grep-gate `NEXT_PUBLIC_*(KEY|SECRET|TOKEN|PRIVATE)`.
4. **Wrong Vercel environment** — add each var to Production+Preview+Development up front; diff key sets vs `.env.example`.
5. **`.env.example` drift** — every phase that adds a var updates `.env.example` in the same commit; keys must match the config module.

## Implications for Roadmap

Research points to a **single-phase milestone** (Phase 4, continuing v1.0's numbering) with a strict internal build order. It's small, low-risk, and each step is independently shippable — splitting into multiple roadmap phases would be over-engineering. Suggested plan-level ordering *within* the phase:

### Phase 4: Env-Driven Site Config
**Rationale:** One cohesive refactor around a single new module; everything depends on the module existing first, then consumers migrate one at a time with zero behavior change.
**Delivers:** `lib/site-config.ts` + `lib/site-config.server.ts`, all in-scope hardcoded strings read from env, `.env.example` documenting every var, social icons conditionally rendered.
**Addresses:** all v1.1 requirements (social, brand, email copy, marketing copy, central module).
**Avoids:** empty-string silent-fail and `NEXT_PUBLIC_` staleness (Pitfalls 1 & 2) baked into the module contract from step 1.

Suggested build order (plan steps, each a shippable commit):
1. Scaffold both modules (public + `server-only`), add `server-only` dep, empty-string-as-missing helpers, required/optional contract, seed `.env.example`.
2. Social handles → wire Footer, conditional-hide, add LinkedIn + WhatsApp icons.
3. Brand identity + SEO metadata (name, tagline, `layout.tsx` title/description).
4. Email copy (server-only module; exercises the `server-only` fence) in `lib/brevo.ts`.
5. Marketing copy blocks (hero, About highlights, Membership reasons/steps, cities, seat count) — one component per commit; leave long AboutSection prose in code (awkward in `.env`).
6. Close out `.env.example` as the canonical contract; verify no drift.

### Phase Ordering Rationale
- Module-first because every consumer imports it (hard dependency).
- Public-before-server keeps the risky client/secret boundary explicit early.
- Fallback-to-current-string per accessor means each step is verifiable by "site looks identical."

### Research Flags
- **No deeper research needed** — well-documented Next.js patterns, grounded in this repo's existing working `NEXT_PUBLIC_` usage. Skip `--research-phase`.
- **Decision for plan/spec:** exact env var **naming scheme** and **granularity** of marketing-copy vars (individual vs grouped) — a design choice, not a research gap.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | zod already installed; verified against bundled Next 16 docs |
| Features | HIGH | Grounded in shipped code (Footer, brevo, layout) |
| Architecture | HIGH | Read every affected file; `server-only` absence verified in node_modules |
| Pitfalls | HIGH | Anchored to a real resolved incident on this project |

**Overall confidence:** HIGH

### Gaps to Address
- Env var naming convention + marketing-copy granularity → decide at plan/discuss-phase.
- Whether to externalize AboutSection's multi-paragraph prose → recommend leaving in code; externalize only short high-churn strings.

## Sources

### Primary (HIGH confidence)
- `.planning/debug/resolved/email-not-delivering.md` — real empty-string-env incident on this project
- `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — `NEXT_PUBLIC_` build-time inlining/freezing, non-inlining of computed lookups
- Codebase: `lib/brevo.ts`, `lib/razorpay.ts`, `components/PaymentSection.tsx`, `components/Footer.tsx`, `app/layout.tsx`

### Secondary (MEDIUM confidence)
- [T3 Env Next.js docs](https://env.t3.gg/docs/nextjs), [t3-oss/t3-env](https://github.com/t3-oss/t3-env)
- [Next.js env discussion #44628](https://github.com/vercel/next.js/discussions/44628), [Vercel stale-env-after-redeploy thread](https://community.vercel.com/t/wrong-env-var-value-in-production-after-redeploy-without-cache/15485)

---
*Research completed: 2026-07-13*
*Ready for roadmap: yes*
