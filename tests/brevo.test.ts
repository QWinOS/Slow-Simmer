/**
 * Unit tests for lib/brevo.ts
 *
 * Per VALIDATION.md Per-Task Verification Map:
 * - sendConfirmationEmail  → NOTF-01 (Structure), NOTF-02 (Contact info), NOTF-03 (Branding)
 *
 * Strategy: Mock global fetch. No real HTTP calls to Brevo API.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

// ---- Setup env vars ----
process.env.BREVO_API_KEY = "xkeysib-test-api-key"
process.env.BREVO_SENDER_EMAIL = "hello@slow-simmer.com"
process.env.BREVO_SENDER_NAME = "Slow Simmer"
process.env.CONTACT_NUMBER = "+91-9876543210"

const { sendConfirmationEmail } = await import("@/lib/brevo")

describe("sendConfirmationEmail", () => {
  let mockFetch: ReturnType<typeof vi.fn>
  const sampleParams = {
    email: "guest@test.com",
    name: "Guest",
    location: "The Venue",
    eventDate: "2026-07-20",
    eventTime: "7:00 PM",
  }

  beforeEach(() => {
    // Reset env vars to known defaults
    process.env.BREVO_API_KEY = "xkeysib-test-api-key"
    process.env.BREVO_SENDER_EMAIL = "hello@slow-simmer.com"
    process.env.BREVO_SENDER_NAME = "Slow Simmer"
    process.env.CONTACT_NUMBER = "+91-9876543210"

    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  it("makes POST request to correct Brevo API URL", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toBe("https://api.brevo.com/v3/smtp/email")
    expect(options.method).toBe("POST")
  })

  it("sends correct headers (api-key, Content-Type, Accept)", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers).toMatchObject({
      "api-key": "xkeysib-test-api-key",
      "Content-Type": "application/json",
      Accept: "application/json",
    })
  })

  it("sends correct email body structure", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    // Sender
    expect(body.sender).toEqual({
      email: "hello@slow-simmer.com",
      name: "Slow Simmer",
    })

    // Recipient
    expect(body.to).toEqual([
      { email: "guest@test.com", name: "Guest" },
    ])

    // Subject
    expect(body.subject).toBe("You're registered for Slow Simmer!")
  })

  it("includes contact number in email body", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body.htmlContent).toContain("+91-9876543210")
    expect(body.htmlContent).toContain("For queries, contact:")
  })

  it("omits contact number section when env var is empty", async () => {
    process.env.CONTACT_NUMBER = ""
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body.htmlContent).not.toContain("For queries, contact:")
  })

  it("contains event details (location, date, time, name)", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body.htmlContent).toContain("The Venue")
    expect(body.htmlContent).toContain("2026-07-20")
    expect(body.htmlContent).toContain("7:00 PM")
    expect(body.htmlContent).toContain("Guest")
    expect(body.htmlContent).toContain("Slow Simmer")
  })

  it("subject line matches spec", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await sendConfirmationEmail(sampleParams)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)

    expect(body.subject).toBe("You're registered for Slow Simmer!")
  })

  it("throws on API error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401, text: () => Promise.resolve("Unauthorized") })

    await expect(sendConfirmationEmail(sampleParams)).rejects.toThrow("Brevo email failed: 401")
  })

  it("throws when BREVO_API_KEY is missing", async () => {
    delete process.env.BREVO_API_KEY

    await expect(sendConfirmationEmail(sampleParams)).rejects.toThrow("BREVO_API_KEY not configured")
  })
})
