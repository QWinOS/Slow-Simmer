import { z } from "zod";

// Each additional guest: name + age (both required once a guest row exists).
// Count of guests = array length, driven by the counter in the form.
export const guestSchema = z.object({
  name: z.string().min(1, "Guest name is required"),
  age: z.string().min(1, "Guest age is required"),
});

export const registrationSchema = z.object({
  location: z.string().min(1, "Please select a location"),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  contact: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  aadhar: z
    .string()
    .length(12, "Aadhar must be exactly 12 digits")
    .regex(/^\d{12}$/, "Aadhar must contain only digits"),
  guests: z.array(guestSchema).default([]),
  about: z
    .string()
    .min(
      5,
      "Let me know if you're allergic to any foods, what you love to eat, or if there is anything else we should keep in mind",
    )
    .max(200, "Maximum 200 characters"),
  social: z.string().url("Enter a valid URL"),
});

export type GuestData = z.infer<typeof guestSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
