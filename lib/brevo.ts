/**
 * Confirmation email sent immediately after webhook confirmation (D-08).
 * Uses raw fetch to Brevo REST API — no SDK dependency (per RESEARCH.md SUS flag on @getbrevo/brevo).
 * Per D-09: Subject "You're registered for Slow Simmer!", body includes location, date, time, guest name, contact number.
 * Per D-10: Config via env vars: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, CONTACT_NUMBER.
 */
export interface ConfirmationEmailParams {
  email: string
  name: string
  location: string
  eventDate: string
  eventTime: string
}

export async function sendConfirmationEmail(params: ConfirmationEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error("BREVO_API_KEY not configured")

  const contactNumber = process.env.CONTACT_NUMBER || ""

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME || "Slow Simmer",
      },
      to: [
        {
          email: params.email,
          name: params.name,
        },
      ],
      subject: "You're registered for Slow Simmer!",
      htmlContent: [
        '<div style="font-family: Karla, sans-serif; max-width: 600px; margin: 0 auto;">',
        '  <h1 style="font-family: \'Playfair Display SC\', serif; color: #A16207;">You\'re in!</h1>',
        `  <p>Hi <strong>${params.name}</strong>,</p>`,
        "  <p>Your registration for Slow Simmer is confirmed!</p>",
        '  <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 20px 0;">',
        `    <p><strong>Location:</strong> ${params.location}</p>`,
        `    <p><strong>Date:</strong> ${params.eventDate}</p>`,
        `    <p><strong>Time:</strong> ${params.eventTime}</p>`,
        "  </div>",
        "  <p>You'll receive remaining details within 24 hours.</p>",
        contactNumber ? `  <p>For queries, contact: <strong>${contactNumber}</strong></p>` : "",
        '  <p style="color: #666; margin-top: 30px;">— Slow Simmer Team</p>',
        "</div>",
      ].join("\n"),
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Brevo email failed: ${response.status} ${text}`)
  }
}
