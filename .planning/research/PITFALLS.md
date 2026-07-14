# Pitfalls Research

**Domain:** Env-driven site configuration for a Next.js 16 (App Router) app deployed on Vercel — externalizing hardcoded content (social handles, brand identity, email + marketing copy) into env vars via a central typed module (v1.1 milestone).
**Researched:** 2026-07-13
**Confidence:** HIGH

> **Why this file matters:** This milestone adds *many* new env vars to a system that already suffered a **silent production email failure** caused by an empty-string env var in Vercel that a `.catch()` swallowed (see `.planning/debug/resolved/email-not-delivering.md`). Every new var multiplies that exact risk surface. The two highest-priority pitfalls below — **empty-string env vars** and **NEXT_PUBLIC_ staleness** — already have (or nearly have) a track record on this project. Earlier phases of this file described a generic RSVP/waitlist platform; that framing is obsolete — the pitfalls below reflect the actual shipped app (Razorpay UPI, Google Sheets, Brevo, single-page) and the v1.1 config goal.

---

## Critical Pitfalls

### Pitfall 1: Empty-string env var in Vercel silently blanks the UI or silently fails (THE incident, now multiplied)

**What goes wrong:**
A var is *present* in Vercel (so "is it set?" checks pass) but its value is an **empty string** (`""`). For server-side integrations the code throws and the error gets swallowed — exactly what happened with `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` (present but `""` in Production, throw swallowed by the `.catch()` at `app/api/orders/verify/route.ts:75` and `app/api/webhooks/razorpay/route.ts:113`). For browser-facing config the empty string flows straight into JSX and renders a **blank tagline, blank hero, empty `<title>`, or a social icon linking to nothing** — with zero errors anywhere. This milestone adds ~15+ new vars (social handles, brand name, tagline, SEO title/description, email subject/body/signature, marketing copy), so any one landing empty produces a broken-looking page nobody notices.

**Why it happens:**
- `vercel env add` accepts an empty value without complaint; a copy-paste that grabs only the key, or piping from a file where the value was blank, lands `""`.
- `process.env.X || fallback` does not save every case: `"" || fallback` → fallback (fine), but `process.env.X ?? fallback` → **keeps `""`** (bad), and a bare `process.env.X` with no fallback renders empty.
- The codebase already leans on fragile patterns: `lib/brevo.ts:19` uses `process.env.CONTACT_NUMBER || ""` (empty is silently "acceptable"), and `lib/razorpay.ts:20-21` use `process.env.X!` (asserts non-null, but `""` still passes the `!` and fails downstream).
- A naive `if (!process.env.X)` catches `""` only by luck (`!""` is `true`); developers who "fix" it to `if (process.env.X === undefined)` or `if ("X" in process.env)` then **miss** the empty-string case.

**How to avoid:**
- **Central typed config module (`lib/site-config.ts`) with an explicit required-vs-optional contract and a real validator that treats empty string as missing.** Provide `requireEnv(name)` — throws when the trimmed value is `undefined` **or** `""` — and `optionalEnv(name, fallback)` — coalesces both `undefined` and `""` to the fallback. Never read `process.env.X` directly in a component again.
- **Fail-fast at boot for anything truly required** (see Pitfall 6): validate all required vars once at server startup (via `instrumentation.ts` or a module-load-time parse) so an empty required var crashes the first request loudly instead of rendering blank for hours.
- **Schema validation** (small Zod schema or hand-rolled equivalent) with `.min(1)` on required strings; parse `process.env` once and export the typed result — turning "empty string" into a startup error naming the exact var.
- **Post-deploy smoke check:** after every env change + redeploy, `vercel env pull` and eyeball the values (literally how the incident was diagnosed), or open the live page and confirm the brand name / social links actually render.

**Warning signs:**
- Live site shows blank tagline / empty `<title>` / a social icon linking to `#` or `""` while localhost looks perfect.
- `vercel env ls production` shows the var exists → developer concludes "configured" and stops looking (this exact false-confidence step is in the incident trail).
- A `.catch()` or `|| ""` sits between the env read and the user-visible effect.

**Phase to address:**
**Phase 1 (central config module + validation).** The `requireEnv`/`optionalEnv` helpers, the required/optional contract, and boot-time validation must exist before any consumer migrates. Verify: set a required var to `""` locally → app refuses to start (or the page throws a clear "MISSING: X") rather than rendering blank.

---

### Pitfall 2: NEXT_PUBLIC_ vars are build-time-frozen — set-but-not-redeployed and stale-value confusion

**What goes wrong:**
Someone updates a `NEXT_PUBLIC_` var in the Vercel dashboard (e.g. `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_BRAND_NAME`) and **nothing changes on the live site** — the value was **inlined into the client JS bundle at `next build` time** and the live build still carries the old string. They re-save, hard-refresh, clear cache — still stale. Conversely, a "Redeploy with existing Build Cache" can carry a value correct at build time but now stale, causing "wrong env var value in production after redeploy" confusion.

**Why it happens:**
- Per the bundled Next.js docs (`node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`): `NEXT_PUBLIC_` values are inlined at build time and *"After being built, your app will no longer respond to changes to these environment variables… frozen with the value evaluated at build time."* Vercel never injects new public values into an already-built bundle.
- The mental model "env var = runtime config" is true for *server* vars but **false** for `NEXT_PUBLIC_` vars. This milestone deliberately puts social handles + brand identity behind `NEXT_PUBLIC_` (they must reach the browser), so the trap covers most new customer-visible surface.
- The project already ships one such var (`NEXT_PUBLIC_RAZORPAY_KEY_ID` in `components/PaymentSection.tsx:77`), so the pattern exists but its redeploy requirement may be undocumented for future editors.

**How to avoid:**
- **Document the redeploy requirement loudly** in `.env.example` and the config module header: any `NEXT_PUBLIC_*` change requires a **fresh deployment (build), not just a dashboard save**. On Vercel, redeploy **without** "use existing build cache" for env-only changes.
- **Keep genuinely runtime-editable content out of `NEXT_PUBLIC_`.** PROJECT.md already made this call (event date/time/price/location stay in the Google Sheet, read at runtime). Reinforce: if a value must change *without a redeploy*, it does NOT belong in an env var — put it in the Sheet or an API route. Env vars here are for rarely-changing values that can tolerate a redeploy.
- **Avoid dynamic lookups that silently kill inlining.** Per the docs, `process.env[varName]` and `const env = process.env; env.NEXT_PUBLIC_X` are **NOT inlined** → they resolve to `undefined` in the browser. A central module that loops over a key list or destructures `process.env` will break every public var. Reference each `NEXT_PUBLIC_*` var by its **full static literal** (`process.env.NEXT_PUBLIC_BRAND_NAME`) exactly once.
- **Bake a build-time assertion** for required public vars into the config module so a missing/empty public var fails the build before the stale bundle ships.

**Warning signs:**
- "I changed it in Vercel but the site still shows the old value."
- A helper reading public vars via computed keys / loops / destructuring, followed by `undefined` in the browser console.
- An env-only "redeploy" using existing build cache produced no change.

**Phase to address:**
**Phase 1 (config module)** for the static-literal access rule + build-time assertion + `.env.example` redeploy note. **Phase 2 (wiring public values into UI: social/brand/SEO)** for the operational redeploy-after-change discipline and verifying each public var re-renders after a fresh build.

---

### Pitfall 3: Var added to the wrong Vercel Environment (Production vs Preview vs Development)

**What goes wrong:**
A new var is added to only *one* Vercel environment. Classic outcomes: works in Production but every **Preview** (PR) deploy shows blank brand/social/copy; or a var added to Preview during testing was never promoted to Production. The incident file already flagged this drift: *"the Production BREVO_* now differ from Preview (which still had the 6h-old copies)."* Adding 15+ new vars across 3 environments = 45+ places to get right, and Vercel's UI makes it easy to tick only "Production."

**Why it happens:**
- Vercel scopes each var to a checkbox set of {Production, Preview, Development}; a fast `Enter` on `vercel env add` selects the default only.
- Preview deploys are where stakeholders review new copy — a Preview-missing var means reviewers approve a page that looks broken, or see a stale value that differs from Production.
- No single command shows "which var is missing in which env" at a glance, so drift accumulates silently.

**How to avoid:**
- **Add every new var to all three environments up front** unless there's a deliberate reason to differ (e.g. a test Razorpay key in Preview). Prefer explicit `vercel env add X production preview development`.
- **Diff environments after each batch:** `vercel env pull` per environment (or the `vercel:env diff` skill) and compare key sets. The boot-time validator (Pitfall 1) should run in Preview too, so a Preview deploy *fails loudly* when a required var is missing — turning silent drift into a visible red deploy.
- **`.env.example` as the canonical checklist** (Pitfall 5): the list of keys that must exist in *every* environment.

**Warning signs:**
- Preview URL renders blank/placeholder copy while Production is fine (or vice-versa).
- `vercel env ls preview` key count ≠ `vercel env ls production` key count.
- A reviewer comments "the tagline is missing" on a PR preview only.

**Phase to address:**
**Phase 2 / deployment phase** (whichever first ships public config to a live/preview URL). Verify: pull all three environments, assert key sets match `.env.example`; open a Preview deploy and confirm brand/social/copy render.

---

### Pitfall 4: Server secret leaked to the client — server config imported into a client component, or a secret named NEXT_PUBLIC_

**What goes wrong:**
Two failure modes, both ending with a secret in the browser bundle:
1. A **secret is given the `NEXT_PUBLIC_` prefix** (e.g. someone "consolidates" and names the Brevo key `NEXT_PUBLIC_BREVO_API_KEY` to "make it available") → it is **inlined into client JS and shipped to every visitor**. Marking it "Sensitive" in Vercel does **not** help — Sensitive does not stop inlining.
2. A **single `lib/site-config.ts` mixes server-only secret reads** (`BREVO_API_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `GOOGLE_PRIVATE_KEY`) **with browser-facing reads**, and a **client component imports from that module** — pulling server-only `process.env.SECRET` references into the client bundle graph. This milestone's whole premise is "one central config module," making this the single most likely way to leak a secret here.

**Why it happens:**
- The convenience of "one config to rule them all" pushes toward a single file imported by both `PaymentSection.tsx` (client) and `app/api/*` (server).
- Non-public vars resolve to `undefined` in the browser (Next.js won't inline them), so a plain secret read usually doesn't leak its *value* — **but** any secret that got a `NEXT_PUBLIC_` prefix, or a value passed as a prop to a client component, does leak. The prefix mistake is the sharp edge.
- The existing secrets are exactly the high-value ones: `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `GOOGLE_PRIVATE_KEY`, `BREVO_API_KEY`.

**How to avoid:**
- **Split config by boundary:** `lib/site-config.ts` contains **only `NEXT_PUBLIC_*` reads** and is the only config safe to import from client components. Keep a separate `lib/server-config.ts` (or read secrets inline in route handlers as today) for secrets, with **`import 'server-only'`** at the top so any accidental client import is a **build error**, not a silent leak.
- **Never prefix a secret with `NEXT_PUBLIC_`.** Rule: if leaking it to a visitor would be bad, it must NOT start with `NEXT_PUBLIC_`. The only public values in this milestone are social URLs, brand name/tagline, SEO text, marketing copy, and email *copy* (subject/body text) — all intentionally public. The Brevo *API key/sender identity* stays server-only.
- **Grep gate in CI / review:** fail if `NEXT_PUBLIC_` appears near `KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE`. Run `next build` and confirm no secret string appears in `.next/static/**` chunks.
- Use the `server-only` package on any module reading a secret so the boundary is compiler-enforced.

**Warning signs:**
- A var named `NEXT_PUBLIC_*_KEY` / `*_SECRET` / `*_TOKEN`.
- A `"use client"` file importing a config module that also reads secrets.
- A secret string findable via `grep -r <secret-prefix> .next/static`.

**Phase to address:**
**Phase 1 (config module architecture).** The public/server split and the `server-only` guard are structural and must be decided before any consumer wires in. Verify: import the server-config module from a client component → build fails; grep client bundle for secret values → none.

---

### Pitfall 5: `.env.example` drift — the documented surface diverges from what the code actually reads

**What goes wrong:**
Code starts reading a new var (`process.env.NEXT_PUBLIC_TAGLINE`) but `.env.example` is never updated — so the next person setting up Preview/Production doesn't know the var exists, doesn't set it, and gets a blank UI or a swallowed failure. With 15+ new vars in one milestone, drift is near-certain if `.env.example` is a manual afterthought. The inverse also happens: `.env.example` lists a renamed/removed var, so people set a dead var and wonder why nothing changes.

**Why it happens:**
- `.env.example` is edited by hand, out of band from the code that reads the var; no compiler links the two.
- A typo copy-pasted into code (`NEXT_PUBLIC_INSTGRAM_URL`) that `.env.example` doesn't catch.
- PROJECT.md explicitly promises "`.env.example` documents every new var," so drift here is a direct requirement violation, not just hygiene.

**How to avoid:**
- **Single source of truth = the config module.** Because all vars are read in one typed module, generate or hand-maintain `.env.example` against that module's key list. Ideally a tiny test asserts every key referenced in the config module appears in `.env.example` and vice-versa (a drift test).
- **Group and comment `.env.example`** by section (social, brand, SEO, email copy, marketing copy), with a note per var: required vs optional, `NEXT_PUBLIC_` (⚠ redeploy on change) vs server-only, and a **non-empty, realistic example value** (so no one copies a blank).
- **Make `.env.example` completeness part of each phase's Definition-of-Done** and the PR checklist.

**Warning signs:**
- A var appears in `git grep NEXT_PUBLIC_` / `git grep process.env` but not in `.env.example` (or the reverse).
- A fresh clone → copy `.env.example` → `.env.local` → app still renders blanks (missing keys).
- The drift test (if present) fails.

**Phase to address:**
**Every phase that introduces vars updates `.env.example` in the same PR**, but the **drift-check mechanism** (test/script comparing config-module keys ↔ `.env.example`) is owned by **Phase 1 (config module)**. Verify: run the drift check; diff `.env.example` keys against grep-ed config keys → must match.

---

### Pitfall 6: No deliberate fallback strategy — blank config that should fail loudly instead degrades invisibly (and vice-versa)

**What goes wrong:**
Every new var gets the *same* treatment when different values need opposite handling:
- A **missing optional social handle** (no LinkedIn) with no fallback renders a dead icon linking to `""` or `#` — should have **degraded gracefully** (hide the icon).
- A **missing required brand name / SEO title / email subject** silently `|| ""`-defaulted ships a **blank-titled, unbranded page or a subject-less email** — should have **failed loudly** at build/boot.
This is the generalization of the original incident: the wrong policy (silent) was applied to a required value (Brevo credentials), degrading invisibly for hours.

**Why it happens:**
- Uniformly slapping `|| ""` or `|| "fallback"` on every read feels safe and consistent, but converts *required* into *silently-optional*.
- No explicit classification of each var as **required (fail loud)** vs **optional (degrade)**; the decision is made ad hoc per read site.
- Graceful degradation for optional values is *also* often missed — code renders the icon unconditionally, so an unset optional var still produces broken UI.

**How to avoid:**
- **Classify every var once, in the config module, as `required` or `optional`:**
  - **Required → fail loud.** `requireEnv()` throws on `undefined`/`""` at boot (Pitfall 1). Examples: brand name, SEO title, SEO description, email subject/sender, any `NEXT_PUBLIC_` the page structurally depends on. Better a red deploy than a blank live page.
  - **Optional → degrade gracefully.** `optionalEnv(name)` returns `undefined` (not `""`) when unset; **consumers must conditionally render.** Example: a social handle — if `NEXT_PUBLIC_LINKEDIN_URL` is unset, **don't render the LinkedIn icon at all** (never render a link to `""`/`#`). Optional marketing sub-blocks fall back to a sensible default or are omitted.
- **Optional reads return `undefined`, never `""`,** so `{url && <SocialIcon href={url} />}` is the natural, correct pattern and a blank never reaches an `href`.
- **Never render an anchor to an empty/`#` href** — this replaces the current `href="#"` footer placeholders (PROJECT.md target). Conditional-render or omit.
- **Document the policy per var in `.env.example`** (required/optional) so the fallback intent is visible where vars are configured.

**Warning signs:**
- A social/link icon whose `href` is `""`, `#`, `undefined`, or `"/undefined"`.
- Blank `<title>`, empty hero heading, or an email with an empty subject in prod.
- `|| ""` on a value that is actually required (the original-incident smell).

**Phase to address:**
**Phase 1 (config module)** defines the required/optional contract and the two accessor helpers. **Phase 2+ (UI wiring)** enforces conditional rendering for every optional value. Verify: for each optional var, unset it locally → the element is *absent* (not a dead link); for each required var, unset it → loud failure.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Read `process.env.X` directly in components instead of via the config module | Faster to type, no import | Bypasses validation, empty-string guard, and required/optional policy → reintroduces the exact incident class; scatters the var name so drift & renames break silently | **Never** in this milestone — the whole point is one central module |
| `\|\| ""` fallback on a value | "It won't crash" | Converts required→silently-optional; blank ships to users invisibly (this *is* the incident) | Only for values genuinely allowed to be empty, and only when the UI conditionally renders on emptiness |
| One config module imported by both client and server | Single source of truth | Risks pulling server-secret `process.env` refs into the client graph; one `NEXT_PUBLIC_` naming slip leaks a secret | Only if split into public vs `server-only` modules with a compiler-enforced boundary |
| Skip boot-time validation ("it worked in the last deploy") | Ship faster | Empty/missing required var degrades silently for hours before anyone notices | Never for required vars; the incident is the case study |
| Dynamic/looped `process.env[key]` read in the config module | DRY, less repetition | `NEXT_PUBLIC_` vars are **not inlined** via computed keys → `undefined` in browser | Never for `NEXT_PUBLIC_*`; static literal access only |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel Env UI | Ticking only "Production"; leaving Preview/Dev unset → drift | Add to all three envs up front; diff key sets after each batch |
| Vercel Env UI | Setting an **empty value** and assuming "present = configured" | Treat `""` as missing; validate values (pull + eyeball), not just presence |
| `vercel env add` | Piping a value from a blank/wrong line → lands `""` | Verify with `vercel env pull` after add (the incident's own fix step) |
| Next.js `NEXT_PUBLIC_` | Changing value in dashboard, expecting live update | Requires a **fresh build/redeploy**; disable build cache for env-only redeploys |
| Next.js inlining | Computed-key / destructured `process.env` for public vars | Static literal `process.env.NEXT_PUBLIC_FOO` referenced once |
| Vercel "Sensitive" flag | Marking a `NEXT_PUBLIC_` var Sensitive to "protect" a secret | Sensitive does **not** prevent client inlining — never put secrets behind `NEXT_PUBLIC_` at all |
| Brevo/Razorpay/Google (existing secrets) | `.catch()` swallowing a config-throw → silent failure | Surface/log a distinct alert (incident follow-up); required-var boot validation |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Naming a secret `NEXT_PUBLIC_*` | Secret inlined into client bundle, readable by every visitor | Naming rule + CI grep gate: no `NEXT_PUBLIC_*(KEY\|SECRET\|TOKEN\|PASSWORD\|PRIVATE)` |
| Client component imports a config module that also reads secrets | Server-secret `process.env` refs / props pulled into client graph | Split public vs `server-only` config; `import 'server-only'` guard on the secret module |
| Committing real `.env.local` while wiring up new vars | Leaks `RAZORPAY_KEY_SECRET`, `GOOGLE_PRIVATE_KEY`, `BREVO_API_KEY` | Keep `.env*.local` git-ignored (create-next-app default); only `.env.example` is committed; clean up `vercel env pull` artifacts (the incident did this) |
| Logging the config object at startup "for debugging" | Prints secrets to Vercel logs | Validate presence/emptiness only; never log values |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Social icon linking to `""`/`#`/`undefined` when handle unset | Dead click, looks broken/untrustworthy | Conditionally render — omit the icon entirely when the URL is unset |
| Blank tagline / empty `<title>` / unbranded page from an empty required var | Page looks broken; bad SEO/social-share preview | Required-var fail-loud at build; never `\|\| ""` a required string |
| Email with empty subject or missing signature | Confirmation email looks like spam / broken | Treat email copy vars as required (or ship a hard-coded default), validated |
| Stale marketing copy after a dashboard edit that wasn't redeployed | Users see old hero/seat-count | Document the redeploy requirement; treat env config as "changes need a deploy" |

## "Looks Done But Isn't" Checklist

- [ ] **Central config module:** Often missing the empty-string guard — verify `""` is treated as missing, not as a valid value.
- [ ] **Required vars:** Often missing boot-time validation — verify the app fails loudly (not blank) when a required var is `""`/unset.
- [ ] **Optional social handles:** Often missing conditional render — verify an unset handle *hides* its icon rather than linking to `""`/`#`.
- [ ] **`NEXT_PUBLIC_` vars:** Often missing the redeploy note — verify `.env.example` documents "change requires redeploy" and a fresh build actually re-renders the new value.
- [ ] **Vercel environments:** Often missing Preview/Dev copies — verify all three environments' key sets match `.env.example`.
- [ ] **Client/server boundary:** Often missing the split — verify no client component imports a secret-reading module (`server-only` guard present, build fails on violation).
- [ ] **`.env.example`:** Often drifted — verify every config-module key is present, with realistic non-empty examples and required/public annotations.
- [ ] **Secret naming:** Verify no secret carries a `NEXT_PUBLIC_` prefix (grep gate).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Empty-string var in prod (blank UI / silent fail) | LOW | `vercel env pull` → find `""` → `vercel env rm` + `vercel env add` real value → **redeploy** (exactly the incident's fix) |
| `NEXT_PUBLIC_` changed but stale | LOW | Redeploy without build cache; confirm the new value in the served bundle |
| Var missing in Preview/Prod | LOW | Add to the missing environment; redeploy that environment |
| Secret leaked via `NEXT_PUBLIC_` prefix or client import | HIGH | **Rotate the secret immediately** (assume compromised), rename without prefix, split the module, redeploy; audit bundle history |
| `.env.example` drift | LOW | Regenerate from the config module; add a drift test to prevent recurrence |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 — Empty-string silent fail/blank | Phase 1 (config module + validation) | Set a required var to `""` locally → app refuses to start / throws clear "MISSING: X" |
| 2 — NEXT_PUBLIC_ staleness | Phase 1 (static access + build assert) → Phase 2 (redeploy discipline) | Change a public var → no update until fresh build; no computed-key reads |
| 3 — Wrong Vercel environment | Phase 2 / deploy phase | Pull all 3 envs → key sets match `.env.example`; Preview renders correctly |
| 4 — Secret leak via client import / prefix | Phase 1 (public vs server-only split) | Import server-config from a client comp → build fails; grep client bundle → no secrets |
| 5 — `.env.example` drift | Phase 1 (drift check) + every phase updates it | Drift test: config keys ↔ `.env.example` keys match |
| 6 — Fallback strategy (loud vs graceful) | Phase 1 (required/optional contract) + Phase 2 (conditional render) | Unset optional → element absent; unset required → loud failure |

## Sources

- `.planning/debug/resolved/email-not-delivering.md` — the real empty-string-env silent-failure incident on this project (HIGH confidence, primary source).
- Next.js official docs bundled in repo: `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md` — confirms `NEXT_PUBLIC_` build-time inlining/freezing, non-inlining of dynamic/computed lookups, server-default scoping (HIGH confidence, curated).
- Codebase reality: `lib/brevo.ts` (`|| ""` pattern), `lib/razorpay.ts` (`process.env.X!` pattern), `components/PaymentSection.tsx` (existing `NEXT_PUBLIC_RAZORPAY_KEY_ID` in a client component) — grounds the pitfalls in this project's actual patterns (HIGH confidence).
- Community/Vercel discussions corroborating env behavior: [Next.js runtime env discussion #44628](https://github.com/vercel/next.js/discussions/44628), [Wrong ENV var after redeploy without cache](https://community.vercel.com/t/wrong-env-var-value-in-production-after-redeploy-without-cache/15485), [Vercel env variables guide](https://env.dev/guides/vercel-env-variables) (MEDIUM confidence).

---
*Pitfalls research for: env-driven site configuration in Next.js 16 on Vercel (v1.1)*
*Researched: 2026-07-13*
