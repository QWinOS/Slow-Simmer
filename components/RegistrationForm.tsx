"use client"

import { useState } from "react"
import { useForm, Controller, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { registrationSchema, type RegistrationFormData } from "@/lib/validations"
import { useRegistration } from "@/components/RegistrationProvider"
import Reveal from "@/components/Reveal"

function formatAadhar(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  if (digits.length === 0) return ""
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ")
}

export function RegistrationForm() {
  const [showAadhar, setShowAadhar] = useState(false)
  const { setRegistrationData } = useRegistration()

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema) as unknown as Resolver<RegistrationFormData>,
    mode: "onBlur",
    defaultValues: {
      name: "",
      contact: "",
      email: "",
      aadhar: "",
      bringingGuest: false,
      guestName: "",
      guestAge: "",
      about: "",
      social: "",
    },
  })

  const bringingGuest = form.watch("bringingGuest")

  function ErrorSummary() {
    const errors = form.formState.errors
    const errorEntries = Object.entries(errors)
    if (errorEntries.length === 0) return null

    return (
      <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6">
        <p className="font-medium text-destructive mb-2">
          Please fix the following errors:
        </p>
        <ul className="list-disc pl-5 text-sm text-destructive space-y-1">
          {errorEntries.map(([field, error]) => (
            <li key={field}>
              {(error as { message?: string })?.message ?? "Invalid value"}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  function onSubmit(data: RegistrationFormData) {
    setRegistrationData(data)
    toast.success("Form submitted! Now proceed to payment")
    setTimeout(() => {
      document.getElementById("payment")?.scrollIntoView({ behavior: "smooth" })
    }, 500)
  }

  return (
    <section id="form" className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16">
      {/* Backdrop accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 size-[50vmin] max-w-[500px] rounded-full bg-gradient-to-t from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

      <Reveal>
        <div className="mx-auto max-w-lg">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">
            Reserve Your Spot
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Fill in your details to register for the event.
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const firstError = Object.keys(errors)[0]
              if (firstError) {
                form.setFocus(firstError as keyof RegistrationFormData)
              }
            })}
            className="rounded-xl bg-card p-6 sm:p-8 shadow-sm ring-1 ring-border"
            noValidate
          >
            <ErrorSummary />

            {/* Section 1: Personal Information */}
            <div className="font-heading text-lg font-bold mb-4">Personal Information</div>
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

              <Controller
                name="contact"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Contact Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="tel"
                      inputMode="numeric"
                      aria-invalid={fieldState.invalid}
                      placeholder="10-digit mobile number"
                      autoComplete="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Email Address <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="your@email.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="aadhar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="aadhar">
                      Aadhar Number <span className="text-destructive">*</span>
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="aadhar"
                        type={showAadhar ? "text" : "password"}
                        value={formatAadhar(field.value || "")}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "").slice(0, 12)
                          field.onChange(raw)
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
                          {showAadhar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription className="text-xs text-muted-foreground">
                      Your Aadhar is used only for event check-in
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Separator className="my-6" />

            {/* Section 2: Guest Details */}
            <div className="font-heading text-lg font-bold mb-4">Guest Details</div>
            <Controller
              name="bringingGuest"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="gap-3">
                  <Checkbox
                    id={field.name}
                    checked={field.value ?? false}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <FieldLabel htmlFor={field.name} className="mb-0 font-normal cursor-pointer">
                    Bringing a guest?
                  </FieldLabel>
                </Field>
              )}
            />

            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out overflow-hidden",
                bringingGuest ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                "motion-reduce:transition-none motion-reduce:!grid-rows-[1fr] motion-reduce:!opacity-100"
              )}
            >
              <div className="min-h-0">
                <div className="flex flex-col gap-4 pt-4">
                  <Controller
                    name="guestName"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Guest Name
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Guest's full name"
                          autoComplete="name"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="guestAge"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Guest Age
                        </FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                          placeholder="Guest's age"
                          inputMode="numeric"
                          autoComplete="off"
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Section 3: Social & About */}
            <div className="font-heading text-lg font-bold mb-4">Social & About</div>
            <FieldGroup>
              <Controller
                name="about"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      About Yourself
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Share 1-2 lines about yourself..."
                      rows={3}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="social"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Instagram or LinkedIn
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="url"
                      aria-invalid={fieldState.invalid}
                      placeholder="https://instagram.com/yourhandle"
                      autoComplete="url"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner className="size-4" />}
              {form.formState.isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </Reveal>
    </section>
  )
}

export default RegistrationForm
