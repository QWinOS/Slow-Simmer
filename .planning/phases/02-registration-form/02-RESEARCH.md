# Phase 2: Registration Form - Research

**Researched:** 2026-07-04
**Domain:** Client-side form validation, UI composition with shadcn/ui Field components, React Context data handoff
**Confidence:** HIGH

## Summary

This phase builds the registration form that replaces `FormPlaceholder.tsx` at the `#form` section. The form collects name, contact (Indian mobile), email, optional guest info (conditional on checkbox), about yourself, social links, and Aadhar with masked input. All validation is client-side only — no API calls. On successful validation, data is stored in a React context for Phase 3 (payment/sheets) to consume.

**Primary recommendation:** Use **React Hook Form 7.80.0 + Zod 4.4.3** for form state management and validation, with the shadcn **Field** component family for accessible field composition. Use **sonner 2.0.7** for toast notifications. This is the exact stack shadcn/ui's own React Hook Form guide demonstrates — it's the canonical path.

**Architecture:** The form lives in a single `"use client"` component at `components/RegistrationForm.tsx`. A `RegistrationProvider` wrapping `layout.tsx` (or just the form section) holds the validated data in React Context. Phase 3 reads from the same context — no Zustand, no URL params, no Redux needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Form Layout
- **D-01:** Fields grouped into visual sections with labeled card titles inside a single outer card with dividers between sections
- **D-02:** Single column layout for all fields (consistent with site's max-w-lg pattern)
- **D-03:** Aadhar placed in Personal Info section (not separate section)
- **D-04:** Full-width submit button at the bottom of the form card

#### Conditional Guest Fields
- **D-05:** Checkbox "Bringing a guest?" toggles guest name + age fields with slide animation
- **D-06:** Guest name and age both required when checkbox is checked

#### Validation Strategy
- **D-07:** Real-time validation on blur (not submit-only)
- **D-08:** Required fields: name, contact number, email, Aadhar. Optional: social links, about yourself. Guest fields conditionally required.
- **D-09:** Error display: inline below each field + summary banner at form top with `role="alert"`
- **D-10:** Phone validation: strict 10-digit Indian mobile format (`/^[6-9]\d{9}$/`)
- **D-11:** Visible labels above inputs (not placeholder-only), required fields marked with asterisk

#### Aadhar Input
- **D-12:** Masked input with eye toggle to reveal (like password field)
- **D-13:** Auto-format with spaces: XXXX XXXX XXXX
- **D-14:** Privacy note below field: "Your Aadhar is used only for event check-in"

#### Form-to-Payment Handoff (Phase 3 contract)
- **D-15:** Validated form data stored in a React context provider — Phase 3 reads from the same context
- **D-16:** Google Sheets write happens only after payment confirmation (Phase 3), not on form submit

#### Submission UX
- **D-17:** Submit button shows spinner and disables during validation
- **D-18:** On success: brief toast confirmation ("Form submitted! Now proceed to payment") then auto-scroll to payment section
- **D-19:** On error: error summary banner at top + inline field errors with focus on first invalid field

### the agent's Discretion
No areas delegated to agent discretion.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FORM-01 | Guest can enter full name | React Hook Form Controller + Zod string min validation + Field component |
| FORM-02 | Guest can enter contact number | Zod regex `/^[6-9]\d{9}$/` for Indian mobile validation |
| FORM-03 | Guest can enter email address | Zod `.email()` validation with auto-complete hints |
| FORM-04 | Guest can indicate if bringing someone + provide their name & age | Checkbox component (shadcn) + conditional Zod schema via `.refine()` or `nullable()` |
| FORM-05 | Guest can share 1-2 lines about themselves | Textarea component (shadcn) — optional field |
| FORM-06 | Guest can share Instagram or LinkedIn profile | Input component — optional field, URL validation |
| FORM-07 | Guest can enter Aadhar number | Custom masked input with InputGroup + eye toggle addon, auto-format, Zod length/pattern |
| FORM-08 | Form validates required fields before submission | Zod schema + React Hook Form's `mode: "onBlur"` + resolver integration |
| FORM-09 | Form is mobile-friendly with proper touch targets | Shadcn Field component defaults to 44px+ touch targets; validate in review |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Form state management | Browser / Client | — | All form state is client-side React state (useForm). No server needed for client-only forms. |
| Field validation | Browser / Client | — | Zod schema validated via react-hook-form resolver on blur. No server round-trip. |
| Conditional field toggle (guest) | Browser / Client | — | React Hook Form's `watch()` hook toggles guest fields visibility and requiredness. |
| Aadhar masking / reveal | Browser / Client | — | Pure client-side presentation: InputGroup with eye toggle button + onChange formatting. |
| Toast notification | Browser / Client | — | sonner fires from client after validation success — ephemeral UI only. |
| Form data persistence (cross-phase) | Browser / Client | — | React Context lives in client tree; Phase 3 reads the same context. No server store. |
| Submit button spinner | Browser / Client | — | React Hook Form's `formState.isSubmitting` controls button disabled + Spinner. |
| Error summary banner | Browser / Client | — | Rendered from `formState.errors` — all client-side. |
| Auto-scroll to payment | Browser / Client | — | After success toast, call `document.getElementById('payment')?.scrollIntoView()`. |

## Project Constraints (from AGENTS.md)

- **This is NOT the Next.js you know** — Check `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
- Client Components must use `"use client"` directive where needed.
- No server actions needed for this form — all validation is client-side. Phase 3 will handle server calls.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.80.0 | Form state, validation, submission | Officially documented by shadcn/ui for form integration; React 19 compatible [VERIFIED: npm registry] |
| zod | 4.4.3 | Schema definition + validation | TypeScript-first, standard-schema compliant, paired with @hookform/resolvers [VERIFIED: npm registry] |
| @hookform/resolvers | 5.4.0 | Zod → React Hook Form bridge | `zodResolver()` passes Zod schema to useForm; official React Hook Form integration [VERIFIED: npm registry] |
| sonner | 2.0.7 | Toast notifications | shadcn/ui's recommended toast library; maintained by emilkowalski (Radix UI core) [VERIFIED: npm registry] |

### Supporting (shadcn/ui components — installed via CLI, no npm install needed)

| Component | Package | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| Field | `npx shadcn@latest add field` | Accessible form field wrapper (Field + FieldLabel + FieldError + FieldDescription) | shadcn's canonical form composition primitive — replaces old separate form/input/label pattern [CITED: ui.shadcn.com/docs/components/radix/field] |
| Input | `npx shadcn@latest add input` | Text input control | Standard shadcn form input [CITED: ui.shadcn.com/docs/components/radix/input] |
| Label | `npx shadcn@latest add label` | Accessible label component | Already included in Field as FieldLabel, but useful standalone [CITED: ui.shadcn.com/docs/components/radix/label] |
| Checkbox | `npx shadcn@latest add checkbox` | "Bringing a guest?" toggle | Radix UI checkbox primitive [CITED: ui.shadcn.com/docs/components/radix/checkbox] |
| Textarea | `npx shadcn@latest add textarea` | "About yourself" multi-line input | Standard shadcn textarea [CITED: ui.shadcn.com/docs/components/radix/textarea] |
| Sonner | `npx shadcn@latest add sonner` | shadcn-wrapped sonner Toaster | Adds Toaster to layout, `import { toast } from "sonner"` in components [CITED: ui.shadcn.com/docs/components/radix/sonner] |
| Spinner | `npx shadcn@latest add spinner` | Loading indicator for submit button | Uses lucide-react LoaderIcon with animate-spin [CITED: ui.shadcn.com/docs/components/radix/spinner] |
| InputGroup | `npx shadcn@latest add input-group` | Aadhar input with eye toggle addon | Required for the eye-toggle button inside the Aadhar input [CITED: ui.shadcn.com/docs/components/radix/input-group] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Hook Form + Zod | Native `<form>` with `onSubmit` + manual validation | No controlled inputs, no `mode: "onBlur"`, no automatic field-level error tracking, manual dirty/pristine state management. RHF+Zod is standard for complex client forms. |
| React Hook Form + Zod | TanStack Form | TanStack Form is newer and less documented; shadcn/ui has an integration page but the React Hook Form guide is more mature. |
| sonner | shadcn `Toast` component | The older shadcn Toast relies on Radix Toast primitive with more boilerplate. sonner is the modern replacement — simpler API, better animation. |
| React Context | Zustand | Context is simpler for a single form data object; Zustand adds a dependency for what amounts to one `{ data: FormData | null }` value. |
| React Context | URL params | Exposing Aadhar in URL is a privacy risk. Context is the right choice per D-15. |

**Installation commands:**

```bash
# npm packages
npm install react-hook-form zod @hookform/resolvers

# shadcn/ui components
npx shadcn@latest add field input label checkbox textarea sonner spinner input-group
```

**Version verification:**
```bash
npm view react-hook-form version           # 7.80.0 [VERIFIED]
npm view zod version                       # 4.4.3 [VERIFIED]
npm view @hookform/resolvers version       # 5.4.0 [VERIFIED]
npm view sonner version                    # 2.0.7 [VERIFIED]
```

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| react-hook-form | npm | 5+ yrs | ~12M/wk | github.com/react-hook-form/react-hook-form | OK | Approved |
| zod | npm | 4+ yrs | ~20M/wk | github.com/colinhacks/zod | OK | Approved |
| @hookform/resolvers | npm | 5+ yrs | ~5M/wk | github.com/react-hook-form/resolvers | OK | Approved |
| sonner | npm | 3+ yrs | ~2M/wk | github.com/emilkowalski/sonner | OK | Approved |

**Packages removed due to [SLOP] verdict:** None
**Packages flagged as suspicious [SUS]:** None

All packages verified on npm registry with long history, high downloads, and recognized maintainers.

## Architecture Patterns

### System Architecture Diagram

```
User fills form fields
        │
        ▼
┌─────────────────────────────────────────────────┐
│  RegistrationForm ("use client")                 │
│                                                  │
│  ┌─ Card ─────────────────────────────────────┐  │
│  │  Section 1: Personal Info                   │  │
│  │  [Name] [Contact] [Email] [Aadhar*]        │  │
│  ├─ Separator ──────────────────────────────── │  │
│  │  Section 2: Guest Info                      │  │
│  │  ☐ Bringing a guest? ──[slide]── [Name][Age]│  │
│  ├─ Separator ──────────────────────────────── │  │
│  │  Section 3: Social & About                  │  │
│  │  [About] [Instagram/LinkedIn]               │  │
│  ├──────────────────────────────────────────── │  │
│  │  [ Submit (full-width) ]  ← Spinner if busy │  │
│  └─────────────────────────────────────────────┘  │
│                                                  │
│  React Hook Form (useForm + zodResolver)          │
│    mode: "onBlur"                                 │
│    watch("bringingGuest") → toggle guest fields   │
│    formState.errors → inline + summary banner      │
│                                                  │
│  On submit success:                               │
│    → toast("Form submitted! Now proceed to payment")│
│    → setFormData(context) ← RegistrationProvider   │
│    → scrollTo("#payment")                          │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│  RegistrationProvider (React Context)             │
│  ┌──────────────────────────────────────────────┐ │
│  │  { name, contact, email, aadhar,             │ │
│  │    guestName?, guestAge?,                     │ │
│  │    about?, social? }                         │ │
│  └──────────────────────────────────────────────┘ │
│  Consumed by Phase 3 (PaymentSection)             │
└──────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
components/
├── RegistrationForm.tsx      # Main form component ("use client")
├── RegistrationProvider.tsx   # React context provider
├── ui/                        # shadcn components (installed via CLI)
│   ├── field.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── checkbox.tsx
│   ├── textarea.tsx
│   ├── sonner.tsx
│   ├── spinner.tsx
│   └── input-group.tsx
│   (button.tsx, card.tsx, separator.tsx already exist)
└── FormPlaceholder.tsx       # To be replaced (not deleted — swapped)

lib/
├── utils.ts                   # Already exists — cn() utility
└── validations.ts             # (optional) Shared Zod schemas
```

### Pattern 1: React Hook Form + Field Composition

**What:** Use `Controller` from React Hook Form inside shadcn `Field` components for accessible form fields with integrated error display.

**When to use:** Every form field in this phase. This is the canonical shadcn pattern.

**Example:**
```typescript
// Source: shadcn/ui React Hook Form guide (ui.shadcn.com/docs/forms/react-hook-form)
"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
})

export function RegistrationForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",         // D-07: Validate on blur
    defaultValues: {
      name: "",
      contact: "",
      email: "",
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Store in context, show toast
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Full Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Your full name"
                autoComplete="name"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        {/* Repeat for contact, email, etc. */}
      </FieldGroup>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  )
}
```

### Pattern 2: Conditional Guest Fields with Slide Animation

**What:** Use `watch("bringingGuest")` from React Hook Form to conditionally render/show guest name/age fields with CSS transition.

**When to use:** D-05 requires checkbox toggles guest fields with slide animation.

**Example:**
```typescript
const bringingGuest = form.watch("bringingGuest")

// In JSX:
<Controller
  name="bringingGuest"
  control={form.control}
  render={({ field }) => (
    <Field orientation="horizontal">
      <Checkbox
        id={field.name}
        checked={field.value ?? false}
        onCheckedChange={field.onChange}
      />
      <FieldLabel htmlFor={field.name}>Bringing a guest?</FieldLabel>
    </Field>
  )}
/>

{/* Guest fields with slide animation */}
<div
  className={cn(
    "grid transition-all duration-300 ease-in-out overflow-hidden",
    bringingGuest ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
  )}
>
  <div className="min-h-0">
    <FieldGroup className="pt-4">
      {/* Guest Name + Age fields — required only when bringingGuest is true */}
    </FieldGroup>
  </div>
</div>

// Zod schema handles the conditional requiredness:
const formSchema = z.object({
  guestName: z.string().optional(),
  guestAge: z.string().optional(),
}).refine(
  (data) => {
    if (data.bringingGuest) {
      return !!data.guestName && !!data.guestAge
    }
    return true
  },
  { message: "Guest details are required when bringing a guest" }
)
```

### Pattern 3: Aadhar Masked Input with Eye Toggle

**What:** Wrap Input in InputGroup with an eye icon button addon. On each change, strip non-digits and auto-format with spaces every 4 digits.

**When to use:** D-12/D-13 require masked Aadhar format with reveal toggle.

**Example:**
```typescript
const [showAadhar, setShowAadhar] = useState(false)

function formatAadhar(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

// In the Controller render:
<InputGroup>
  <InputGroupInput
    {...field}
    id="aadhar"
    type={showAadhar ? "text" : "password"}
    value={formatAadhar(field.value || "")}
    onChange={(e) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 12)
      field.onChange(raw)
    }}
    aria-invalid={fieldState.invalid}
    autoComplete="off"
  />
  <InputGroupAddon align="inline-end">
    <InputGroupButton
      size="icon-xs"
      variant="ghost"
      onClick={() => setShowAadhar(!showAadhar)}
      aria-label={showAadhar ? "Hide Aadhar" : "Show Aadhar"}
      type="button"
    >
      {showAadhar ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>
<FieldDescription className="text-xs text-muted-foreground">
  Your Aadhar is used only for event check-in
</FieldDescription>
```

### Anti-Patterns to Avoid

- **Don't use `mode: "onChange"`**: D-07 says validate on blur, not on every keystroke. `onChange` firehoses errors at users before they finish typing.
- **Don't mix controlled/uncontrolled**: React Hook Form switches between modes; always use `Controller` for consistent controlled inputs.
- **Don't put Aadhar in URL params**: Privacy risk. D-15 already chose React Context.
- **Don't use shadcn's old `Form` component**: The new `Field` component family replaces the old `Form` pattern. `Field` + `Controller` is the current canonical approach.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState for each field + onChange handlers | React Hook Form | Performance (isolated re-renders), validation integration, touched/dirty tracking, submission state |
| Schema validation | Manual if/else checks per field | Zod | Declarative, TypeScript-inferred types, composable, standard-schema compliant |
| Field error display | Manual aria-invalid and error text per field | shadcn Field + FieldError | Accessible by default, consistent styling, handles aria attributes automatically |
| Toast/notification | Custom toast div with CSS animation | sonner | Accessible (role="status"), dismissible, position configurable, animation built-in |
| Conditional field toggle | Manual state + visibility classes | React Hook Form `watch()` | Ties into form state, enables conditional validation in Zod refine |
| Input masking | Custom input masking library | Manual (strip digits + format with spaces) | Aadhar format is simple (12 digits, spaces every 4). No library needed for this pattern. |

**Key insight:** The React Hook Form + Zod + shadcn Field stack eliminates the most common form bugs: stale state, inconsistent validation, accessibility gaps, and layout shift from error messages. Custom form implementations in React consistently underestimate the complexity of touched/dirty tracking, async validation, and error display management. Use the established stack.

## Common Pitfalls

### Pitfall 1: Mode Mismatch for On-Blur Validation
**What goes wrong:** Form validates on submit only (default) instead of on blur.
**Why it happens:** React Hook Form defaults to `mode: "onSubmit"`. Forgetting to set `mode: "onBlur"` means users don't see errors until they click submit.
**How to avoid:** Always set `mode: "onBlur"` explicitly in `useForm()` config. The field's `onBlur` event is what triggers validation — RHF handles this automatically.
**Warning signs:** Errors only appear after clicking submit.

### Pitfall 2: Aadhar Cursor Jump on Format
**What goes wrong:** Auto-formatting Aadhar with spaces causes the cursor to jump to the end of the input while the user is still typing in the middle.
**Why it happens:** Replacing the input value on every `onChange` resets the cursor position.
**How to avoid:** Track cursor position before setting new value and restore it. For this simple format (12 digits, spaces at positions 4 and 8), the cursor jump is minimal — but if users can paste into the middle, it breaks. Alternative: use `input-otp` component for segmented input (not recommended for this case as the UX is worse for 12 digits).

**Practical mitigation:** Since Aadhar is entered from the beginning (not editing middle), cursor jump risk is low. The format only inserts spaces — it doesn't delete characters.

### Pitfall 3: Guest Fields Conditional Validation Fails on First Render
**What goes wrong:** Zod `.refine()` validating guest fields runs on initial render with `undefined` values.
**Why it happens:** The refinement runs on every validation event. If the refinement checks `data.bringingGuest && !data.guestName`, it might fail before the user interacts with anything.
**How to avoid:** Use Zod's `superRefine` with early return, or make guest fields `z.string().optional()` and use a `.refine()` that only triggers when `bringingGuest` is true. Better still: use discriminated union or `.nullable()`.

### Pitfall 4: Field Component Not Installed
**What goes wrong:** Developer tries to use the old `Form` / `FormField` pattern from shadcn docs (the v3 pattern) which doesn't match the installed version.
**Why it happens:** shadcn/ui v4 (radix-nova) uses the new `Field` component family, not the old `Form` component. The old `Form` was deprecated.
**How to avoid:** Always install and use `field` component (`npx shadcn@latest add field`). Import from `@/components/ui/field`. Do NOT install the old `form` component.

### Pitfall 5: React Context Causes Re-render Cascade
**What goes wrong:** Storing form data in context causes all context consumers (including Phase 3 code) to re-render on every keystroke.
**Why it happens:** Context value reference changes on every setState call if not memoized.
**How to avoid:** Only write to context ONCE on successful form submit. Keep form state in React Hook Form's internal store (not context) while editing. When submit succeeds, call `setRegistrationData(data)` once. Phase 3 reads a stable value.

## Code Examples

### Complete Form Submission Handler (success + error paths)

```typescript
// Source: Adapted from shadcn/ui React Hook Form guide patterns
function onSubmit(data: z.infer<typeof formSchema>) {
  // D-17: Button shows spinner via formState.isSubmitting (handled by RHF)
  
  // Store in context for Phase 3 (D-15)
  setRegistrationData(data)
  
  // D-18: Success toast + auto-scroll
  toast.success("Form submitted! Now proceed to payment")
  
  setTimeout(() => {
    document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })
  }, 500)
}

// Error handler is automatic via form.handleSubmit — it catches field errors
// For D-19: summary banner reads formState.errors at form top:
function ErrorSummary() {
  const errors = form.formState.errors
  const errorEntries = Object.entries(errors)
  
  if (errorEntries.length === 0) return null
  
  return (
    <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p className="font-medium text-destructive">
        Please fix the following errors:
      </p>
      <ul className="mt-2 list-disc pl-5 text-sm text-destructive">
        {errorEntries.map(([field, error]) => (
          <li key={field}>{error?.message as string}</li>
        ))}
      </ul>
    </div>
  )
}
```

### React Context Provider Pattern

```typescript
// components/RegistrationProvider.tsx
"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface RegistrationData {
  name: string
  contact: string
  email: string
  aadhar: string
  bringingGuest: boolean
  guestName?: string
  guestAge?: string
  about?: string
  social?: string
}

interface RegistrationContextValue {
  data: RegistrationData | null
  setRegistrationData: (data: RegistrationData) => void
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [data, setRegistrationData] = useState<RegistrationData | null>(null)
  
  return (
    <RegistrationContext.Provider value={{ data, setRegistrationData }}>
      {children}
    </RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext)
  if (!ctx) throw new Error("useRegistration must be inside RegistrationProvider")
  return ctx
}
```

### Zod Schema with Conditional Guest Validation

```typescript
// lib/validations.ts or inline in component
import { z } from "zod"

export const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  aadhar: z
    .string()
    .length(12, "Aadhar must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhar must contain only digits"),
  bringingGuest: z.boolean().default(false),
  guestName: z.string().optional(),
  guestAge: z.string().optional(),
  about: z.string().max(200, "Maximum 200 characters").optional(),
  social: z
    .string()
    .url("Enter a valid URL")
    .or(z.literal(""))
    .optional(),
}).superRefine((data, ctx) => {
  if (data.bringingGuest) {
    if (!data.guestName || data.guestName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guest name is required",
        path: ["guestName"],
      })
    }
    if (!data.guestAge || data.guestAge.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Guest age is required",
        path: ["guestAge"],
      })
    }
  }
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
```

## Validation Architecture

> Required by Nyquist validation (workflow.nyquist_validation: true).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (from next 16 defaults) or Jest |
| Config file | `vitest.config.ts` or `jest.config.*` — verify in project root |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --coverage` |

> **Note:** Check if a test framework is already configured. If not, add vitest.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FORM-01 | Name field validates min 2 chars on blur | unit | `npx vitest run --reporter=verbose` | ❌ Wave 0 |
| FORM-02 | Contact validates /^[6-9]\d{9}$/ — valid and invalid cases | unit | (same) | ❌ Wave 0 |
| FORM-03 | Email validates correctly | unit | (same) | ❌ Wave 0 |
| FORM-04 | Checkbox toggles guest fields, conditional required | integration | (same) | ❌ Wave 0 |
| FORM-05 | About textarea accepts max 200 chars | unit | (same) | ❌ Wave 0 |
| FORM-06 | Social URL validates URL or empty | unit | (same) | ❌ Wave 0 |
| FORM-07 | Aadhar 12 digits, format XXXX XXXX XXXX | unit | (same) | ❌ Wave 0 |
| FORM-08 | Required fields blocked on submit with errors displayed | integration | (same) | ❌ Wave 0 |
| FORM-09 | Touch targets >= 44px (manual/Cypress check) | manual | (visual inspection) | ❌ Wave 0 |

### Testable Validation Criteria (from Zod schema)

1. **Name:** `min(2)` — empty or single char → error
2. **Contact:** `/^[6-9]\d{9}$/` — must start 6-9, exactly 10 digits
3. **Email:** `z.string().email()` — RFC 5322 valid email
4. **Aadhar:** `.length(12)` + `/^\d{12}$/` — exactly 12 digits
5. **Guest Name:** required when `bringingGuest === true`
6. **Guest Age:** required when `bringingGuest === true`
7. **About:** optional, max 200 chars
8. **Social:** optional, URL or empty
9. **Error display:** FieldError renders for each invalid field
10. **Summary banner:** `role="alert"` renders when any error exists

### Sampling Rate

- **Per task commit:** Run Zod schema unit tests + vitest run
- **Per wave merge:** Full vitest suite
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `tests/validation.test.ts` — unit tests for Zod schema covering all field rules
- [ ] `tests/RegistrationForm.test.tsx` — integration tests for conditional guest fields, submit behavior, error display
- [ ] `tests/setup.ts` — test framework setup if vitest not configured
- [ ] Framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — if none detected

## Security Domain

> Required: security_enforcement is true (config.json).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No authentication in this phase |
| V3 Session Management | No | No sessions — single-page form |
| V4 Access Control | No | No authorization boundaries |
| V5 Input Validation | Yes | Zod schema — client-side only (Phase 3 adds server validation) |
| V6 Cryptography | No | No encryption at this layer (Aadhar stored in React context — caution in Phase 3) |
| V8 Data Protection | Partial | Aadhar is sensitive; react context is in-memory only; no localStorage |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Aadhar in memory | Information Disclosure | React context is in-memory only (not persisted to localStorage). Phase 3 handles sheets write (server-side). |
| Paste of invalid data into Aadhar | Tampering | Zod regex filter on onChange strips non-digits; schema validates length + digits |
| XSS in About/Social fields | Spoofing | React's built-in JSX escaping prevents injection. Validate URL format on social. |
| Form submission without validation | Tampering | `form.handleSubmit()` only fires `onSubmit` after schema passes — Zod blocks invalid state. |

**Note:** Aadhar is stored in React Context (in-memory) until Phase 3 writes it to Google Sheets. No localStorage persistence. This is a LOW risk since context is not serialized to any persistent store. Phase 3 must ensure data is sent over HTTPS to Google Sheets API.

## Code Style & shadcn Rules

Based on installed shadcn/ui v4 patterns (`radix-nova` style):

- **Forms use `Field` + `FieldLabel` + `Input`** — Never raw `div` with `space-y-*` for form layout
- **Field validation uses `data-invalid` on `Field`** and `aria-invalid` on the control
- **Use semantic colors** — `bg-card`, `text-muted-foreground`, `border-border` (no raw hex)
- **No `space-x-*` or `space-y-*`** — Use `flex flex-col gap-*` for vertical stacks
- **Use `cn()` for conditional classes** — Not manual template literal ternaries
- **`"use client"` required** — This form component uses hooks, state, and event handlers

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | (check) | — |
| npm | Package install | ✓ | (check) | pnpm/yarn |
| Git | Version control | ✓ | (check) | — |

**Missing dependencies with no fallback:** None — all required stacks are npm packages.
**Missing dependencies with fallback:** None.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| shadcn `Form` + `FormField` (v3) | shadcn `Field` + `FieldGroup` + `FieldLabel` (v4) | 2026 (shadcn v4) | The old Form component is deprecated. Use Field family instead. |
| `useFormState` / `useFormStatus` (React 19) | Not needed here | 2026 | These are for Server Actions. This form is client-only — React Hook Form handles state. |
| shadcn `Toast` component | `sonner` | 2025 | Sonner is shadcn's recommended toast. The old Toast component still exists but sonner is preferred. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Project has no existing test framework configured | Validation Architecture | Low — Wave 0 will detect and install vitest if missing |
| A2 | shadcn/ui CLI will successfully install all listed components | Standard Stack | Low — button, card, separator already installed; field/input/label/checkbox are standard registry components |
| A3 | Next.js 16 `node_modules/next/dist/docs/` may contain API changes | Project Constraints | Medium — AGENTS.md warns about this. Developer should check before writing code |

## Open Questions

1. **Test framework detection**
   - What we know: No test config found yet (vitest/jest)
   - What's unclear: Whether Next.js 16 ships with a default test runner
   - Recommendation: Check `package.json` scripts; if none, install vitest in Wave 0

2. **Cursor behavior on Aadhar paste in middle**
   - What we know: Simple format (4-4-4) with spaces. Cursor jump is minimal for left-to-right entry.
   - What's unclear: Whether paste into middle of formatted value causes issues
   - Recommendation: Test with pasted values in review. If problematic, fall back to raw digits only (no formatting during edit, format on blur).

## Sources

### Primary (HIGH confidence)
- [CITED: ui.shadcn.com/docs/components/radix/field] — shadcn Field component API and composition patterns
- [CITED: ui.shadcn.com/docs/forms/react-hook-form] — Official React Hook Form integration guide with Field + Controller pattern
- [CITED: ui.shadcn.com/docs/components/radix/sonner] — Sonner/Toaster installation and usage
- [CITED: ui.shadcn.com/docs/components/radix/input-group] — InputGroup + InputGroupAddon + InputGroupButton patterns
- [VERIFIED: npm registry] — All package versions verified via npm view
- [VERIFIED: shadcn list] — Component availability confirmed via npx shadcn@latest list

### Secondary (MEDIUM confidence)
- [ASSUMED] — Test framework not yet configured; Wave 0 install needed
- [ASSUMED] — Next.js 16 doc directory contains API differences (per AGENTS.md)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages verified on npm, patterns verified on shadcn docs, React 19 peer dep confirmed
- Architecture: HIGH — patterns are standard shadcn + React Hook Form, proven in production across thousands of projects
- Pitfalls: HIGH — based on documented common mistakes with RHF, conditional validation, and masked inputs
- Security: MEDIUM — Aadhar handling is correct for this phase but Phase 3 needs HTTPS for sheets write

**Research date:** 2026-07-04
**Valid until:** 30 days (stable packages)
