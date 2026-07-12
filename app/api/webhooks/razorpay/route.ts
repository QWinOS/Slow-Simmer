import { verifyWebhookSignature } from "@/lib/razorpay"
import { appendRegistrationRow, checkPaymentIdExists } from "@/lib/sheets-write"
import { sendConfirmationEmail } from "@/lib/brevo"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// In-memory retry queue per D-07: maps Payment ID → pending data
const pendingWrites = new Map<string, {
  row: Parameters<typeof appendRegistrationRow>[0]
  emailParams: Parameters<typeof sendConfirmationEmail>[0]
  retries: number
}>()

async function processPendingWrites() {
  for (const [paymentId, pending] of pendingWrites) {
    try {
      await appendRegistrationRow(pending.row)
      pendingWrites.delete(paymentId)
    } catch {
      pending.retries++
      if (pending.retries > 5) {
        console.error(`Giving up on payment ${paymentId} after 5 retries`)
        pendingWrites.delete(paymentId)
      }
    }
  }
}

export async function POST(request: Request) {
  // Process queued writes from previous failures (D-07)
  await processPendingWrites()

  try {
    // 1. Read RAW body — BEFORE any other body access (Pitfall 1)
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 })
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // 2. Verify HMAC-SHA256 signature using webhook secret (NOT key_secret — Pitfall 2)
    const isValid = verifyWebhookSignature({
      body: rawBody,
      signature,
      secret: webhookSecret,
    })

    if (!isValid) {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 401 })
    }

    // 3. Parse verified payload
    const event = JSON.parse(rawBody)

    // Only process payment.captured events
    if (event.event !== "payment.captured") {
      return NextResponse.json({ received: true })
    }

    const payment = event.payload.payment.entity
    const paymentId = payment.id
    const notes = payment.notes || {}

    // 4. Idempotency check (D-06, SHEET-03)
    const isDuplicate = await checkPaymentIdExists(paymentId).catch(() => false)
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    // 5. Prepare registration row data from order notes
    const registrationRow = {
      location: notes.location || "",
      eventDate: notes.eventDate || "",
      eventTime: notes.eventTime || "",
      name: notes.name || "",
      contact: notes.contact || "",
      email: notes.email || "",
      aadhar: notes.aadhar || "",
      bringingGuest: notes.bringingGuest === "true" ? "Yes" : "No",
      guestName: notes.guestName || "",
      guestAge: notes.guestAge || "",
      about: notes.about || "",
      social: notes.social || "",
      paymentStatus: "captured",
      paymentId,
      timestamp: new Date().toISOString(),
    }

    const emailParams = {
      email: notes.email,
      name: notes.name,
      location: notes.location,
      eventDate: notes.eventDate,
      eventTime: notes.eventTime,
    }

    // 6. Write to Sheets — if it fails, queue for retry (D-07)
    try {
      await appendRegistrationRow(registrationRow)
    } catch (sheetsErr) {
      console.error("Sheets append failed, queuing for retry:", sheetsErr)
      pendingWrites.set(paymentId, { row: registrationRow, emailParams, retries: 0 })
    }

    // 7. Send confirmation email — must await on Vercel serverless
    await sendConfirmationEmail(emailParams).catch((err) => {
      console.error("Confirmation email failed:", err)
    })

    // 8. Always return 200 to acknowledge receipt (Pitfall 5)
    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook error:", message)
    // Always return 200 — RazorPay retries on non-2xx (Pitfall 5)
    return NextResponse.json({ received: true, error: message })
  }
}
