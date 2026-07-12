import { z } from "zod"

export const LOCATIONS = ["kolkata", "bangalore"] as const

export const registrationSchema = z
  .object({
    location: z.enum(LOCATIONS, { message: "Please select a location" }),
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
  })
  .superRefine((data, ctx) => {
    // Bangalore is not open for registration yet ("coming soon"). Guard at the
    // schema level so a tampered/stale client can't submit it.
    if (data.location === "bangalore") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bangalore is coming soon — please choose Kolkata",
        path: ["location"],
      })
    }

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
