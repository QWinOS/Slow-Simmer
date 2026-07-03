# Phase 2: Registration Form - Pattern Map

**Mapped:** 2026-07-04
**Files analyzed:** 14 (4 custom + 8 shadcn CLI-generated + 2 test)
**Analogs found:** 10 / 11 custom files have matches

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `components/RegistrationForm.tsx` | component | request-response | `components/GallerySection.tsx` | role-match |
| `components/RegistrationProvider.tsx` | provider | request-response | `components/GallerySection.tsx` (state pattern) | partial |
| `lib/validations.ts` | utility | transform | `lib/utils.ts` | utility-match |
| `app/page.tsx` | route | request-response | `app/page.tsx` (existing - modification) | exact |
| `components/ui/field.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/input.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/label.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/checkbox.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/textarea.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/sonner.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `components/ui/spinner.tsx` | component | — | `components/ui/skeleton.tsx` | shadcn-cli |
| `components/ui/input-group.tsx` | component | — | `components/ui/button.tsx` | shadcn-cli |
| `tests/validation.test.ts` | test | batch | (no existing tests exist) | no-analog |
| `tests/RegistrationForm.test.tsx` | test | batch | (no existing tests exist) | no-analog |

---

## Pattern Assignments

### `components/RegistrationForm.tsx` (component, request-response)

**Analog:** `components/GallerySection.tsx` — closest client component with stateful section pattern

**Section wrapper pattern** (lines 17-26):
```tsx
<section id="gallery" className="relative py-16 sm:py-24 scroll-mt-16">
  {/* Background accent */}
  <div className="absolute top-1/3 right-0 size-[45vmin] max-w-[500px] rounded-full bg-gradient-to-l from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
  <div className="absolute -bottom-1/4 left-0 size-[40vmin] max-w-[400px] rounded-full bg-gradient-to-r from-amber-100/40 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

  <Reveal>
    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12 text-foreground">
      Gallery
    </h2>
  </Reveal>
</section>
```

**Client component directive + imports** (`GallerySection.tsx` lines 1-6):
```tsx
"use client"

import { useState } from "react"
import { GalleryGrid } from "./GalleryGrid"
import { GalleryLightbox } from "./GalleryLightbox"
import type { DriveFile } from "@/lib/drive"
import Reveal from "@/components/Reveal"
```

**State + event handler pattern** (`GallerySection.tsx` lines 10-14):
```tsx
const [images, setImages] = useState<DriveFile[]>([])
const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

const openLightbox = (index: number) => setSelectedIndex(index)
const closeLightbox = () => setSelectedIndex(null)
```

**Consistent section ID pattern used across all sections** (`FormPlaceholder.tsx` line 7):
```tsx
<section id="form" className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16">
```

**FormPlaceholder card-inner pattern** (`FormPlaceholder.tsx` lines 14-15) — basis for form card container:
```tsx
<div className="mx-auto max-w-lg rounded-xl bg-card p-8 shadow-sm text-center ring-1 ring-border">
```

**cn() utility pattern available throughout codebase** (`lib/utils.ts` lines 1-6):
```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Theme color semantic class usage** — ubiquitous across all sections, e.g. from `AboutSection.tsx` lines 48-49, form card in `FormPlaceholder.tsx` line 14:
- `bg-card`, `text-card-foreground`, `text-muted-foreground`, `ring-1 ring-border`
- `bg-background`, `bg-muted`, `text-foreground`
- `border-border`, `border-border/50`
- Amber accent: `text-amber-600`, `bg-amber-100/50`, `from-amber-100/50 to-transparent`

**React Hook Form + Zod pattern** (from RESEARCH.md — no codebase equivalent exists, use canonical):

The form will use this pattern:
```tsx
// Imports to use:
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
```

---

### `components/RegistrationProvider.tsx` (provider, request-response)

**Analog:** No React Context provider exists in the codebase. Pattern adapted from standard React Context + existing client component patterns.

**Client directive + imports pattern** (from `Reveal.tsx` lines 1-4):
```tsx
"use client"

import type { ReactNode } from "react"
```

**Full context provider pattern** (from RESEARCH.md — canonical pattern, no codebase analog exists):
```tsx
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

---

### `lib/validations.ts` (utility, transform)

**Analog:** `lib/utils.ts` — utility file with no state/hooks, pure functions.

**Utility file pattern** (`lib/utils.ts` lines 1-4) — barrel exports, no `"use client"`:
```tsx
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
```

**Zod schema pattern** (from RESEARCH.md — source of truth, no existing Zod in codebase):
```tsx
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

---

### `app/page.tsx` (route, request-response)

**Analog:** `app/page.tsx` — existing file, modification only.

**Current structure** (lines 1-23):
```tsx
import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import FormPlaceholder from "@/components/FormPlaceholder"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <FormPlaceholder />
      </main>
      <Footer />
    </>
  )
}
```

**Modification pattern:** Replace `FormPlaceholder` import and usage with `RegistrationForm`. Wrap in `RegistrationProvider`:

```tsx
import NavBar from "@/components/NavBar"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import GallerySection from "@/components/GallerySection"
import VideoSection from "@/components/VideoSection"
import { RegistrationForm } from "@/components/RegistrationForm"
import { RegistrationProvider } from "@/components/RegistrationProvider"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <RegistrationProvider>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <GallerySection />
        <VideoSection />
        <RegistrationForm />
      </main>
      <Footer />
    </RegistrationProvider>
  )
}
```

---

### `components/ui/field.tsx` (component — shadcn CLI generated)

**Analog:** `components/ui/button.tsx` — existing shadcn component showing radix-nova conventions.

Will be generated by `npx shadcn@latest add field`. Pattern to expect — same conventions as other shadcn components:

**Data-slot attribute pattern** (from `button.tsx` line 58, `card.tsx` line 12, `separator.tsx` line 16):
```tsx
data-slot="button"   // button.tsx:58
data-slot="card"     // card.tsx:12
data-slot="separator" // separator.tsx:16
```

**cn() wrapper pattern** (from `skeleton.tsx` lines 6-7):
```tsx
<div
  data-slot="skeleton"
  className={cn("animate-pulse rounded-md bg-muted", className)}
  {...props}
/>
```

**React.ComponentProps pattern** (from `button.tsx` lines 50-51):
```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
```

**Alias import pattern** — all components import `cn` from the same location (consistent across all):
```tsx
import { cn } from "@/lib/utils"
```

---

### `tests/validation.test.ts` and `tests/RegistrationForm.test.tsx` (test, batch)

**Analog:** No existing tests in the codebase. This is net-new.

**Expected test setup pattern** (from RESEARCH.md):
```typescript
// Zod schema tests — pure function, no DOM needed:
import { describe, it, expect } from "vitest"
import { registrationSchema } from "@/lib/validations"

describe("registrationSchema", () => {
  it("rejects name shorter than 2 characters", () => {
    const result = registrationSchema.safeParse({ name: "A", ...validBase })
    expect(result.success).toBe(false)
  })
  // ...
})

// Component tests — need jsdom + testing-library:
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
```

---

## Shared Patterns

### Section Container Pattern
**Source:** `components/FormPlaceholder.tsx` lines 6-10, echoed by all sections
**Apply to:** `components/RegistrationForm.tsx`
```tsx
<section
  id="form"
  className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
>
  {/* Background accent */}
  <div className="absolute ... blur-3xl -z-10" />

  <Reveal>
    {/* Card content */}
  </Reveal>
</section>
```

### Client Component Pattern
**Source:** All interactive components (`GallerySection.tsx`, `VideoSection.tsx`, `HeroSection.tsx`, `NavBar.tsx`, `Reveal.tsx`)
**Apply to:** `RegistrationForm.tsx`, `RegistrationProvider.tsx`
```tsx
"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
```
Consistent first-line directive. The project has 12 client components — all use `"use client"` on line 1.

### shadcn/ui Component Pattern (radix-nova style)
**Source:** `components/ui/button.tsx`, `components/ui/card.tsx`, `components/ui/separator.tsx`
**Apply to:** All `components/ui/*.tsx` files (field, input, label, checkbox, textarea, sonner, spinner, input-group)
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
```
- Uses `data-slot` attributes for styling
- Uses `cn()` for className merging
- Exports named functions (not default)
- Uses `React.ComponentProps<...>` for typing
- shadcn CLI generates these automatically — only manual if customizing

### Utility File Pattern
**Source:** `lib/utils.ts`
**Apply to:** `lib/validations.ts`
- No `"use client"` directive (pure functions, no hooks/state)
- Single focused responsibility
- Named exports with barrel pattern
- Path alias `@/lib/utils` for imports

### Toast/Notification Pattern
**Source:** RESEARCH.md (sonner, not yet in codebase)
**Apply to:** `RegistrationForm.tsx` submit handler
```typescript
import { toast } from "sonner"

// In submit handler:
toast.success("Form submitted! Now proceed to payment")
```

### Error Summary Banner Pattern
**Source:** RESEARCH.md (no codebase analog)
**Apply to:** `RegistrationForm.tsx`
```tsx
function ErrorSummary({ errors }: { errors: FieldErrors<RegistrationFormData> }) {
  const errorEntries = Object.entries(errors)
  if (errorEntries.length === 0) return null

  return (
    <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <p className="font-medium text-destructive">Please fix the following errors:</p>
      <ul className="mt-2 list-disc pl-5 text-sm text-destructive">
        {errorEntries.map(([field, error]) => (
          <li key={field}>{error?.message as string}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Spinner/Button Loading Pattern
**Source:** RESEARCH.md (from shadcn Spinner component)
**Apply to:** `RegistrationForm.tsx` submit button
```tsx
<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting && <Spinner />}
  {form.formState.isSubmitting ? "Submitting..." : "Submit Registration"}
</Button>
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `components/RegistrationProvider.tsx` | provider | request-response | No React Context providers exist in codebase — pattern from RESEARCH.md |
| `lib/validations.ts` | utility | transform | No Zod schemas exist in codebase — pattern from RESEARCH.md |
| `tests/validation.test.ts` | test | batch | No test infrastructure exists in project |
| `tests/RegistrationForm.test.tsx` | test | batch | No test infrastructure exists in project |
| `components/ui/*.tsx` (8 files) | component | — | Generated by shadcn CLI — follow existing shadcn component conventions from `button.tsx`/`card.tsx` |

---

## Key Integration Points

### FormPlaceholder Replacement
- `app/page.tsx` line 6 and line 18 currently use `FormPlaceholder`
- Replace import and JSX usage — keep `#form` section id (matches NavBar scroll target)
- `FormPlaceholder.tsx` remains in codebase (can be deleted after verification)

### Context Handoff Contract (Phase 3 boundary)
- `RegistrationProvider` wraps the app in `layout.tsx` or `page.tsx`
- `setRegistrationData(data)` called once on successful form submit
- Phase 3 reads via `useRegistration().data`
- `RegistrationData` interface must be stable — shared type with Phase 3

### NavBar Reference
- `NavBar.tsx` line 13 references `#form` section — must remain unchanged

---

## Metadata

**Analog search scope:** `components/`, `app/`, `lib/`, `hooks/`
**Files scanned:** 20+ existing files
**Pattern extraction date:** 2026-07-04
