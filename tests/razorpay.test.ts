/**
 * Unit tests for lib/razorpay.ts
 *
 * Per VALIDATION.md Per-Task Verification Map:
 * - createOrder  → PAY-01 (Order creation)
 * - verifyPaymentSignature  → PAY-02 (Signature verification)
 * - verifyWebhookSignature  → PAY-02 (Webhook signature verification)
 *
 * Strategy: Mock the third-party razorpay SDK for order creation tests.
 * Use real Node.js crypto for signature verification tests (no mock needed).
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import crypto from "crypto"

// ---- Setup env vars ----
process.env.RAZORPAY_KEY_SECRET = "test_key_secret"
process.env.RAZORPAY_KEY_ID = "rzp_test_key"

/**
 * Hoisted variable shared between the vi.mock factory and test bodies.
 * Must use `let` (not `const`) so the hoisted declaration reaches both scopes.
 * eslint-disable is needed because the variable is assigned in the mock
 * factory (vitest-hoisted) but read in test bodies.
 */
// eslint-disable-next-line prefer-const
let mockOrdersCreate: ReturnType<typeof vi.fn>

// Mock the razorpay SDK before importing the module under test.
// Must use a plain function (not arrow) as the constructor — arrow functions
// cannot be used with `new` (lib/razorpay.ts does `new Razorpay(...)`).
vi.mock("razorpay", () => {
  const fn = vi.fn()
  mockOrdersCreate = fn
  return {
    default: function () {
      return { orders: { create: fn } }
    },
  }
})

// Dynamic import so mocks are applied
const { createOrder, verifyPaymentSignature, verifyWebhookSignature } = await import("@/lib/razorpay")

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates order with correct amount and currency", async () => {
    mockOrdersCreate.mockResolvedValue({
      id: "order_123",
      amount: 50000,
      currency: "INR",
    })

    const result = await createOrder({ amount: 50000 })

    expect(result).toEqual({
      orderId: "order_123",
      amount: 50000,
      currency: "INR",
    })
  })

  it("passes notes to order creation", async () => {
    mockOrdersCreate.mockResolvedValue({
      id: "order_456",
      amount: 50000,
      currency: "INR",
    })

    await createOrder({
      amount: 50000,
      notes: { name: "Test", email: "test@test.com" },
    })

    expect(mockOrdersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        notes: expect.objectContaining({
          name: "Test",
          email: "test@test.com",
        }),
      }),
    )
  })

  it("throws when SDK fails", async () => {
    mockOrdersCreate.mockRejectedValue(new Error("API error"))

    await expect(createOrder({ amount: 50000 })).rejects.toThrow()
  })
})

describe("verifyPaymentSignature", () => {
  it("returns true for valid signature", () => {
    const orderId = "order_123"
    const paymentId = "pay_456"
    const body = orderId + "|" + paymentId
    const validSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex")

    const result = verifyPaymentSignature({
      orderId,
      paymentId,
      signature: validSignature,
    })

    expect(result).toBe(true)
  })

  it("returns false for invalid signature", () => {
    const result = verifyPaymentSignature({
      orderId: "order_123",
      paymentId: "pay_456",
      signature: "0000000000000000000000000000000000000000000000000000000000000000",
    })

    expect(result).toBe(false)
  })

  it("returns false for malformed signature input (non-hex string)", () => {
    const result = verifyPaymentSignature({
      orderId: "order_123",
      paymentId: "pay_456",
      signature: "not-a-valid-hex-string!!",
    })

    expect(result).toBe(false)
  })
})

describe("verifyWebhookSignature", () => {
  const webhookSecret = "test_webhook_secret"

  it("returns true for valid webhook signature", () => {
    const body = '{"event":"payment.captured","payload":{}}'
    const validSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex")

    const result = verifyWebhookSignature({
      body,
      signature: validSignature,
      secret: webhookSecret,
    })

    expect(result).toBe(true)
  })

  it("returns false for invalid webhook signature", () => {
    const body = '{"event":"payment.captured","payload":{}}'
    const invalidSignature = "f".repeat(64)

    const result = verifyWebhookSignature({
      body,
      signature: invalidSignature,
      secret: webhookSecret,
    })

    expect(result).toBe(false)
  })

  it("uses webhook secret parameter (not key_secret from env)", () => {
    const body = '{"event":"payment.captured"}'
    const specificSecret = "specific_webhook_secret"
    const validSignature = crypto
      .createHmac("sha256", specificSecret)
      .update(body)
      .digest("hex")

    // Should pass with the correct secret
    expect(
      verifyWebhookSignature({ body, signature: validSignature, secret: specificSecret }),
    ).toBe(true)

    // Should fail with a different secret
    expect(
      verifyWebhookSignature({
        body,
        signature: validSignature,
        secret: "wrong_secret",
      }),
    ).toBe(false)
  })
})
