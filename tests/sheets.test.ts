/**
 * Unit tests for lib/sheets-write.ts
 *
 * Per VALIDATION.md Per-Task Verification Map:
 * - appendRegistrationRow  → SHEET-01 (Schema), SHEET-02 (Write operation)
 * - checkPaymentIdExists   → SHEET-03 (Idempotency check)
 *
 * Strategy: Mock global fetch and @/lib/google-auth. No real HTTP calls.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import type { RegistrationRow } from "@/lib/sheets-write"

// ---- Mock google-auth ----
vi.mock("@/lib/google-auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue("mock-token"),
}))

const { appendRegistrationRow, checkPaymentIdExists } = await import("@/lib/sheets-write")

/** A valid full RegistrationRow matching the D-05 schema order */
const sampleRow: RegistrationRow = {
  location: "Kolkata",
  eventDate: "2026-07-20",
  eventTime: "7:00 PM",
  name: "Test Guest",
  contact: "9876543210",
  email: "guest@test.com",
  aadhar: "123456789012",
  bringingGuest: "No",
  guestName: "",
  guestAge: "",
  about: "Love good food!",
  social: "https://instagram.com/test",
  paymentStatus: "Success",
  paymentId: "pay_abc123",
  timestamp: "2026-07-20T12:00:00Z",
}

describe("appendRegistrationRow", () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset process.env to known state
    process.env.VIDEOS_SHEET_ID = "test-sheet-id"

    // Create a fresh mock for fetch
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  it("makes POST request to correct URL", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await appendRegistrationRow(sampleRow)

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain("values/Registrations!A:O:append")
    expect(options.method).toBe("POST")
  })

  it("sends 15 columns in correct order per D-05 schema", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await appendRegistrationRow(sampleRow)

    const [, options] = mockFetch.mock.calls[0]
    const body = JSON.parse(options.body)
    const values = body.values[0]

    expect(values).toHaveLength(15)
    expect(values).toEqual([
      "Kolkata",
      "2026-07-20",
      "7:00 PM",
      "Test Guest",
      "9876543210",
      "guest@test.com",
      "123456789012",
      "No",
      "",
      "",
      "Love good food!",
      "https://instagram.com/test",
      "Success",
      "pay_abc123",
      "2026-07-20T12:00:00Z",
    ])
  })

  it("includes Authorization header with Bearer token", async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await appendRegistrationRow(sampleRow)

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers).toMatchObject({
      Authorization: "Bearer mock-token",
    })
  })

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve("Forbidden") })

    await expect(appendRegistrationRow(sampleRow)).rejects.toThrow("Sheets append failed: 403")
  })

  it("throws when VIDEOS_SHEET_ID is missing", async () => {
    delete process.env.VIDEOS_SHEET_ID

    await expect(appendRegistrationRow(sampleRow)).rejects.toThrow("VIDEOS_SHEET_ID not configured")
  })
})

describe("checkPaymentIdExists", () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    process.env.VIDEOS_SHEET_ID = "test-sheet-id"
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  it("returns true when Payment ID exists in sheet", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["N"], ["pay_123"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(true)
  })

  it("returns false when Payment ID does not exist", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["N"], ["pay_456"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(false)
  })

  it("queries column N (Payment ID) only", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [] }),
    })

    await checkPaymentIdExists("pay_123")

    const [url] = mockFetch.mock.calls[0]
    expect(url).toContain("Registrations!N:N")
  })

  it("skips header row when checking", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["Payment ID"], ["pay_123"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(true)
  })

  it("returns false on API error (idempotency safe-fail)", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(false)
  })

  it("throws when VIDEOS_SHEET_ID is missing", async () => {
    delete process.env.VIDEOS_SHEET_ID

    await expect(checkPaymentIdExists("pay_123")).rejects.toThrow("VIDEOS_SHEET_ID not configured")
  })
})
