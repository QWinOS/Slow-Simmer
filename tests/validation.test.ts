import { describe, it, expect } from "vitest"
import { registrationSchema } from "@/lib/validations"

const validBase = {
  location: "Kolkata",
  name: "Test User",
  contact: "9876543210",
  email: "test@example.com",
  aadhar: "123456789012",
  about: "Love good food and meeting new people",
  social: "https://instagram.com/testuser",
  guests: [],
}

describe("registrationSchema", () => {
  it("accepts a valid submission without guest", () => {
    const result = registrationSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  describe("location", () => {
    it("accepts any non-empty location string", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        location: "Kolkata",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty/unselected location", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        location: "",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("location")
      }
    })

    it("rejects a missing location", () => {
      const { location, ...withoutLocation } = validBase
      const result = registrationSchema.safeParse(withoutLocation)
      expect(result.success).toBe(false)
    })
  })

  describe("name", () => {
    it("accepts name with exactly 2 characters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        name: "Ab",
      })
      expect(result.success).toBe(true)
    })

    it("accepts name longer than 2 characters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        name: "John Doe",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty name", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        name: "",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name")
      }
    })

    it("rejects name shorter than 2 characters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        name: "A",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("name")
      }
    })
  })

  describe("contact", () => {
    it("accepts valid 10-digit numbers starting with 6-9", () => {
      const validContacts = [
        "9876543210",
        "6123456789",
        "7123456789",
        "8123456789",
        "9123456789",
      ]
      for (const contact of validContacts) {
        const result = registrationSchema.safeParse({
          ...validBase,
          contact,
        })
        expect(result.success).toBe(true)
      }
    })

    it("rejects numbers starting with 5", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        contact: "5123456789",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("contact")
      }
    })

    it("rejects 9-digit numbers", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        contact: "987654321",
      })
      expect(result.success).toBe(false)
    })

    it("rejects 11-digit numbers", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        contact: "98765432109",
      })
      expect(result.success).toBe(false)
    })

    it("rejects contact with letters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        contact: "98765abcde",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty contact", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        contact: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("email", () => {
    it("accepts standard email addresses", () => {
      const validEmails = [
        "user@example.com",
        "test.user@domain.co",
        "name@subdomain.example.org",
      ]
      for (const email of validEmails) {
        const result = registrationSchema.safeParse({
          ...validBase,
          email,
        })
        expect(result.success).toBe(true)
      }
    })

    it("rejects email without @ symbol", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        email: "notanemail",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("email")
      }
    })

    it("rejects email without domain", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        email: "user@",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty email", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        email: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("aadhar", () => {
    it("accepts exactly 12 digits", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "123456789012",
      })
      expect(result.success).toBe(true)
    })

    it("rejects 11-digit aadhar", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "12345678901",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("aadhar")
      }
    })

    it("rejects 13-digit aadhar", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "1234567890123",
      })
      expect(result.success).toBe(false)
    })

    it("rejects aadhar with spaces", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "1234 5678 9012",
      })
      expect(result.success).toBe(false)
    })

    it("rejects aadhar with letters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "12345678901a",
      })
      expect(result.success).toBe(false)
    })

    it("rejects empty aadhar", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        aadhar: "",
      })
      expect(result.success).toBe(false)
    })
  })

  describe("guests array", () => {
    it("accepts an empty guests array", () => {
      const result = registrationSchema.safeParse({ ...validBase, guests: [] })
      expect(result.success).toBe(true)
    })

    it("defaults guests to [] when omitted", () => {
      const { guests, ...withoutGuests } = validBase
      const result = registrationSchema.safeParse(withoutGuests)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.guests).toEqual([])
      }
    })

    it("accepts fully-filled guest rows", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        guests: [
          { name: "John", age: "30" },
          { name: "Asha", age: "29" },
        ],
      })
      expect(result.success).toBe(true)
    })

    it("rejects a guest row with empty name", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        guests: [{ name: "", age: "25" }],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes("name"))
        expect(issue?.message).toBe("Guest name is required")
      }
    })

    it("rejects a guest row with empty age", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        guests: [{ name: "John", age: "" }],
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        const issue = result.error.issues.find((i) => i.path.includes("age"))
        expect(issue?.message).toBe("Guest age is required")
      }
    })
  })

  describe("about", () => {
    it("rejects empty about (required, min 5)", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        about: "",
      })
      expect(result.success).toBe(false)
    })

    it("accepts about within 200 characters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        about: "I love cooking and hosting dinner parties!",
      })
      expect(result.success).toBe(true)
    })

    it("rejects about exceeding 200 characters", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        about: "A".repeat(201),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("about")
      }
    })
  })

  describe("social", () => {
    it("accepts a valid URL", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        social: "https://instagram.com/testuser",
      })
      expect(result.success).toBe(true)
    })

    it("rejects empty string (required URL)", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        social: "",
      })
      expect(result.success).toBe(false)
    })

    it("rejects malformed URL", () => {
      const result = registrationSchema.safeParse({
        ...validBase,
        social: "not-a-url",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain("social")
      }
    })
  })
})
