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

import crypto from "crypto"
// Generate a valid RSA key for testing so createJWT doesn't fail
const testKey = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey.export({ type: "pkcs1", format: "pem" }).toString()

const { appendRegistrationRow, checkPaymentIdExists } = await import("@/lib/sheets-write")

/** A valid full RegistrationRow matching the schema order (16 cols, A:P) */
const sampleRow: RegistrationRow = {
  location: "Kolkata",
  eventDate: "2026-07-20",
  eventTime: "7:00 PM",
  name: "Test Guest",
  contact: "9876543210",
  email: "guest@test.com",
  aadhar: "123456789012",
  bringingGuest: "No",
  about: "Love good food!",
  social: "https://instagram.com/test",
  paymentStatus: "Success",
  paymentId: "pay_abc123",
  timestamp: "2026-07-20T12:00:00Z",
  guestDetails: "",
}

/** Helpers to set up env for internal getSheetsToken auth */
function setSheetsEnv() {
  process.env.VIDEOS_SHEET_ID = "test-sheet-id"
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "test@test.iam.gserviceaccount.com"
  process.env.GOOGLE_PRIVATE_KEY = testKey
}

/** Mock fetch that handles OAuth token exchange and Sheets API calls */
function mockFetchWithAuth(handler: (url: string, options: RequestInit) => any) {
  return vi.fn((url: string, options?: RequestInit) => {
    if (url.includes("oauth2")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: "mock-token", expires_in: 3600 }),
      })
    }
    return handler(url, options || {})
  })
}

describe("appendRegistrationRow", () => {
  let mockSheets: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setSheetsEnv()
    mockSheets = vi.fn()
    global.fetch = mockFetchWithAuth(mockSheets)
  })

  it("makes POST request to correct URL", async () => {
    mockSheets.mockResolvedValue({ ok: true })

    await appendRegistrationRow(sampleRow)

    const [url, options] = mockSheets.mock.calls[0]
    expect(url).toContain("values/Registrations!A:P:append")
    expect(options.method).toBe("POST")
  })

  it("sends 16 columns in correct order (A:P, Guest Details last)", async () => {
    mockSheets.mockResolvedValue({ ok: true })

    await appendRegistrationRow({
      ...sampleRow,
      guestDetails: '[{"name":"Asha","age":"29"}]',
    })

    const [, options] = mockSheets.mock.calls[0]
    const body = JSON.parse(options.body)
    const values = body.values[0]

    expect(values).toHaveLength(16)
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
      '[{"name":"Asha","age":"29"}]',
    ])
  })

  it("includes Authorization header with Bearer token", async () => {
    mockSheets.mockResolvedValue({ ok: true })

    await appendRegistrationRow(sampleRow)

    const [, options] = mockSheets.mock.calls[0]
    expect(options.headers).toMatchObject({
      Authorization: "Bearer mock-token",
    })
  })

  it("throws on non-ok response", async () => {
    mockSheets.mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve("Forbidden") })

    await expect(appendRegistrationRow(sampleRow)).rejects.toThrow("Sheets append failed: 403")
  })

  it("throws when VIDEOS_SHEET_ID is missing", async () => {
    delete process.env.VIDEOS_SHEET_ID

    await expect(appendRegistrationRow(sampleRow)).rejects.toThrow("VIDEOS_SHEET_ID not configured")
  })
})

describe("checkPaymentIdExists", () => {
  let mockSheets: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setSheetsEnv()
    mockSheets = vi.fn()
    global.fetch = mockFetchWithAuth(mockSheets)
  })

  it("returns true when Payment ID exists in sheet", async () => {
    mockSheets.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["N"], ["pay_123"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(true)
  })

  it("returns false when Payment ID does not exist", async () => {
    mockSheets.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["N"], ["pay_456"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(false)
  })

  it("queries column N (Payment ID) only", async () => {
    mockSheets.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [] }),
    })

    await checkPaymentIdExists("pay_123")

    const [url] = mockSheets.mock.calls[0]
    expect(url).toContain("Registrations!N:N")
  })

  it("skips header row when checking", async () => {
    mockSheets.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ values: [["Payment ID"], ["pay_123"]] }),
    })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(true)
  })

  it("returns false on API error (idempotency safe-fail)", async () => {
    mockSheets.mockResolvedValueOnce({ ok: false, status: 500 })

    const result = await checkPaymentIdExists("pay_123")
    expect(result).toBe(false)
  })

  it("throws when VIDEOS_SHEET_ID is missing", async () => {
    delete process.env.VIDEOS_SHEET_ID

    await expect(checkPaymentIdExists("pay_123")).rejects.toThrow("VIDEOS_SHEET_ID not configured")
  })
})
