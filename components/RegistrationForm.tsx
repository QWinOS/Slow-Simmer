"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { termsClauses, lastUpdated } from "@/lib/terms";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/lib/validations";
import { fetchLocations, type LocationEvent } from "@/lib/locations";
import { useRegistration } from "@/components/RegistrationProvider";
import Reveal from "@/components/Reveal";

function formatAadhar(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (digits.length === 0) return "";
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function RegistrationForm() {
  const [showAadhar, setShowAadhar] = useState(false);
  const [locations, setLocations] = useState<LocationEvent[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const { setRegistrationData } = useRegistration();

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch(() => {
        toast.error("Failed to load event locations");
      })
      .finally(() => setLocationsLoading(false));
  }, []);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(
      registrationSchema,
    ) as unknown as Resolver<RegistrationFormData>,
    mode: "onBlur",
    defaultValues: {
      location: "",
      eventDate: "",
      eventTime: "",
      name: "",
      contact: "",
      email: "",
      aadhar: "",
      guests: [],
      about: "",
      social: "",
      termsAccepted: false,
    } as unknown as RegistrationFormData,
  });

  const { fields: guestFields, append, remove } = useFieldArray({
    control: form.control,
    name: "guests",
  });

  const selectedLocation = form.watch("location");
  const guestCount = guestFields.length;
  // Max Member includes the registrant, so extra guests cap at maxMember - 1.
  const selectedEvent = locations.find((l) => l.location === selectedLocation);
  const maxGuests = selectedEvent ? Math.max(0, selectedEvent.maxMember - 1) : 0;
  const soldOut = Boolean(selectedEvent) && selectedEvent!.maxMember <= 0;

  function ErrorSummary() {
    const errors = form.formState.errors;
    const errorEntries = Object.entries(errors);
    if (errorEntries.length === 0) return null;

    return (
      <div
        role="alert"
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 mb-6"
      >
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
    );
  }

  function onSubmit(data: RegistrationFormData) {
    const event = locations.find((l) => l.location === data.location);
    // Guard: party (registrant + guests) must fit remaining capacity.
    if (event && 1 + data.guests.length > event.maxMember) {
      toast.error(
        event.maxMember <= 0
          ? "This event is sold out."
          : `Only ${event.maxMember} seat(s) left — reduce your guest count.`,
      );
      return;
    }
    setRegistrationData({
      location: data.location,
      name: data.name,
      contact: data.contact,
      email: data.email,
      aadhar: data.aadhar,
      about: data.about,
      social: data.social,
      guests: data.guests,
      eventDate: event?.date || "",
      eventTime: event?.time || "",
      price: event?.price || 0, // per-seat, in paise, from Location_Date Price column
    });
  }

  return (
    <section
      id="form"
      className="relative bg-background px-4 py-16 sm:py-24 scroll-mt-16"
    >
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
              const firstError = Object.keys(errors)[0];
              if (firstError) {
                form.setFocus(firstError as keyof RegistrationFormData);
              }
            })}
            className="rounded-xl bg-card p-6 sm:p-8 shadow-sm ring-1 ring-border"
            noValidate
          >
            <ErrorSummary />

            {/* Section 1: Personal Information */}
            <div className="font-heading text-lg font-bold mb-4">
              Personal Information
            </div>
            <FieldGroup>
              <Controller
                name="location"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Choose Event Location{" "}
                      <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const event = locations.find(
                          (l) => l.location === value,
                        );
                        if (event) {
                          form.setValue("eventDate", event.date);
                          form.setValue("eventTime", event.time);
                          // New location may allow fewer guests — trim overflow.
                          const allowed = Math.max(0, event.maxMember - 1);
                          const current = form.getValues("guests");
                          if (current.length > allowed) {
                            form.setValue("guests", current.slice(0, allowed));
                          }
                        }
                      }}
                      disabled={locationsLoading}
                    >
                      <SelectTrigger
                        id={field.name}
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                        className="w-full"
                      >
                        <SelectValue
                          placeholder={
                            locationsLoading
                              ? "Loading locations..."
                              : "Select your city"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.length === 0 && !locationsLoading && (
                          <SelectItem value="__none" disabled>
                            No locations available
                          </SelectItem>
                        )}
                        {locations.map((event) => {
                          const label = event.date
                            ? `${event.location} — ${event.date}${event.time ? `, ${event.time}` : ""}`
                            : event.location;
                          return (
                            <SelectItem
                              key={event.location}
                              value={event.location}
                            >
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {soldOut && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-center ring-1 ring-destructive/10">
                  <p className="flex items-center justify-center gap-2 text-base font-bold text-destructive mb-1">
                    <span aria-hidden="true" className="text-lg">×</span>
                    Sold Out
                  </p>
                  <p className="text-sm text-muted-foreground">
                    No seats left for this event. Please select another location.
                  </p>
                </div>
              )}

              {!soldOut && (
              <>
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
                          const raw = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12);
                          field.onChange(raw);
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
                          aria-label={
                            showAadhar ? "Hide Aadhar" : "Show Aadhar"
                          }
                          type="button"
                        >
                          {showAadhar ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
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
              </>
              )}
            </FieldGroup>

            {!soldOut && (
            <>
            <Separator className="my-6" />

            {/* Section 2: Guest Details */}
            <div className="font-heading text-lg font-bold mb-4">
              Guest Details
            </div>

            <Field orientation="horizontal" className="items-center justify-between gap-3">
              <div>
                <FieldLabel className="mb-0 font-normal">
                  Additional guests
                </FieldLabel>
                <FieldDescription className="text-xs text-muted-foreground">
                  {!selectedLocation
                    ? "Select a location to add guests"
                    : `Up to ${maxGuests} guest${maxGuests === 1 ? "" : "s"} (incl. you: ${selectedEvent?.maxMember} seats)`}
                </FieldDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove guest"
                  disabled={guestCount === 0}
                  onClick={() => remove(guestCount - 1)}
                >
                  <Minus className="size-4" />
                </Button>
                <span
                  className="w-6 text-center font-medium tabular-nums"
                  aria-live="polite"
                  aria-label="Guest count"
                >
                  {guestCount}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Add guest"
                  disabled={!selectedLocation || guestCount >= maxGuests}
                  onClick={() => append({ name: "", age: "" })}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </Field>

            {guestFields.length > 0 && (
              <div className="flex flex-col gap-4 pt-4">
                {guestFields.map((guestField, index) => (
                  <div
                    key={guestField.id}
                    className="grid grid-cols-1 gap-4 rounded-lg border border-border p-4 sm:grid-cols-2"
                  >
                    <Controller
                      name={`guests.${index}.name`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>
                            Guest {index + 1} Name
                            <span className="text-destructive">*</span>
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
                      name={`guests.${index}.age`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>
                            Guest {index + 1} Age
                            <span className="text-destructive">*</span>
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
                ))}
              </div>
            )}

            <Separator className="my-6" />

            {/* Section 3: Social & About */}
            <div className="font-heading text-lg font-bold mb-4">
              Social & About
            </div>
            <FieldGroup>
              <Controller
                name="about"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      About Yourself<span className="text-destructive">*</span>
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Share 1-2 lines about yourself, like food allergies, preferences, or anything else..."
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
                      <span className="text-destructive">*</span>
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

            <Separator className="my-6" />

            <div className="font-heading text-lg font-bold mb-4">
              Agreement
            </div>

            <Controller
              name="termsAccepted"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={field.name}
                      checked={field.value ?? false}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                      aria-label="I agree to the Terms & Conditions"
                    />
                    <span className="text-sm leading-relaxed text-muted-foreground">
                      <label htmlFor={field.name}>I agree to the </label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="underline underline-offset-4 hover:text-primary"
                          >
                            Terms &amp; Conditions
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80dvh] overflow-y-auto sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="font-heading">
                              Terms &amp; Conditions
                            </DialogTitle>
                            <DialogDescription>
                              Last updated: {lastUpdated}
                            </DialogDescription>
                          </DialogHeader>
                          {termsClauses.map((clause) => (
                            <section key={clause.id}>
                              <h3 className="font-heading text-sm font-semibold mb-1">
                                {clause.title}
                              </h3>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {clause.content}
                              </p>
                            </section>
                          ))}
                        </DialogContent>
                      </Dialog>
                    </span>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && <Spinner className="size-4" />}
              {form.formState.isSubmitting
                ? "Submitting..."
                : "Submit Registration"}
            </Button>
            </>
            )}
          </form>
        </div>
      </Reveal>
    </section>
  );
}

export default RegistrationForm;
