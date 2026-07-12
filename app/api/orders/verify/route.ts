import { verifyPaymentSignature } from "@/lib/razorpay"
import { appendRegistrationRow, checkPaymentIdExists } from "@/lib/sheets-write"
import { sendConfirmationEmail } from "@/lib/brevo"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type VerifyBody = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifyBody & Record<string, unknown>
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 },
      )
    }

    const isValid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      )
    }

    // Signature is valid — write registration to sheet and send email
    const notes = (body.notes || {}) as Record<string, string>

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
      paymentId: razorpay_payment_id,
      timestamp: new Date().toISOString(),
    }

    const emailParams = {
      email: notes.email,
      name: notes.name,
      location: notes.location,
      eventDate: notes.eventDate,
      eventTime: notes.eventTime,
    }

    // Fire-and-forget sheets write + email — don't block payment confirmation
    checkPaymentIdExists(razorpay_payment_id)
      .then((isDuplicate) => {
        if (!isDuplicate) {
          return appendRegistrationRow(registrationRow)
        }
      })
      .catch((err) => {
        console.error("Sheets append failed:", err)
      })

    sendConfirmationEmail(emailParams).catch((err) => {
      console.error("Confirmation email failed:", err)
    })

    return NextResponse.json({
      verified: true,
      paymentId: razorpay_payment_id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
