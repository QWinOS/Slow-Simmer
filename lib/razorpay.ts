import Razorpay from "razorpay"
import crypto from "crypto"

// ---- Types ----

export interface CreateOrderParams {
  amount: number       // in paise (e.g., 50000 = INR 500)
  notes?: Record<string, string>
}

export interface CreateOrderResult {
  orderId: string
  amount: number
  currency: string
}

// ---- RazorPay SDK instance ----

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// ---- Exported Functions ----

/**
 * Creates a RazorPay order server-side using the official SDK.
 * amount is in paise as required by RazorPay API.
 * notes carry registration data forwarded to the webhook payload.
 *
 * Per D-01: Order creation is always server-side — key_secret never reaches the browser.
 * Per RESEARCH.md: Use SDK orders.create() — not raw fetch.
 */
export async function createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
  const { amount, notes } = params

  const options = {
    amount,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
    notes: notes || {},
  }

  const order = await razorpay.orders.create(options)

      return {
        orderId: order.id,
        amount: Number(order.amount),
        currency: order.currency,
  }
}

/**
 * Verifies a client-side payment signature using HMAC-SHA256.
 * Called by the orders/verify endpoint when the RazorPay checkout modal
 * fires its success handler.
 *
 * Per RESEARCH.md: Uses key_secret (NOT webhook_secret) for payment verification.
 * Per D-02: Client-side verification is for UI feedback; webhook is source of truth.
 */
export function verifyPaymentSignature(params: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const { orderId, paymentId, signature } = params
  const body = orderId + "|" + paymentId
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex")

  // Use crypto.timingSafeEqual for constant-time comparison (per RESEARCH.md Pitfall 3)
  try {
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")
    if (sigBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}

/**
 * Verifies a RazorPay webhook signature using the webhook secret.
 * Called by the webhooks/razorpay route handler.
 *
 * Per RESEARCH.md Pitfall 2: Uses RAZORPAY_WEBHOOK_SECRET (NOT key_secret).
 * Per Pitfall 1: Takes the RAW body string (pre-parsed) — must be the exact bytes received.
 */
export function verifyWebhookSignature(params: {
  body: string       // raw request text, NOT JSON-stringified
  signature: string  // value of x-razorpay-signature header
  secret: string     // process.env.RAZORPAY_WEBHOOK_SECRET
}): boolean {
  const { body, signature, secret } = params

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  try {
    const sigBuffer = Buffer.from(signature, "hex")
    const expectedBuffer = Buffer.from(expectedSignature, "hex")
    if (sigBuffer.length !== expectedBuffer.length) return false
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  } catch {
    return false
  }
}
