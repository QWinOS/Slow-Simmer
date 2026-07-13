/**
 * Confirmation email sent immediately after webhook confirmation (D-08).
 * Uses raw fetch to Brevo REST API — no SDK dependency (per RESEARCH.md SUS flag on @getbrevo/brevo).
 * Per D-09: Subject "You're registered for Slow Simmer!", body includes location, date, time, guest name, contact number.
 * Per D-10: Config via env vars: BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME, CONTACT_NUMBER.
 */
export interface ConfirmationEmailParams {
  email: string;
  name: string;
  location: string;
  eventDate: string;
  eventTime: string;
}

export async function sendConfirmationEmail(
  params: ConfirmationEmailParams,
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");

  const contactNumber = process.env.CONTACT_NUMBER || "";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_URL || "";
  // Email copy — env-driven, falls back to current text. Server-only (no
  // NEXT_PUBLIC_ prefix): this runs in the API route, never the browser.
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "Slow Simmer";
  const subject =
    process.env.BREVO_EMAIL_SUBJECT?.trim() ||
    `You're registered for ${brand}!`;
  const bodyLine =
    process.env.BREVO_EMAIL_BODY?.trim() ||
    `Your registration for ${brand} is confirmed!`;
  const signature =
    process.env.BREVO_EMAIL_SIGNATURE?.trim() || `— ${brand} Team`;

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
      subject,
      htmlContent: [
        '<div style="font-family: Karla, sans-serif; max-width: 600px; margin: 0 auto;">',
        "  <h1 style=\"font-family: 'Playfair Display SC', serif; color: #A16207;\">You're in!</h1>",
        `  <p>Hi <strong>${params.name}</strong>,</p>`,
        `  <p>${bodyLine}</p>`,
        '  <div style="background: #FEF2F2; border-radius: 12px; padding: 20px; margin: 20px 0;">',
        `    <p><strong>Location:</strong> ${params.location}</p>`,
        `    <p><strong>Date:</strong> ${params.eventDate}</p>`,
        `    <p><strong>Time:</strong> ${params.eventTime}</p>`,
        "  </div>",
        "  <p>You'll receive remaining details within 24 hours.</p>",
        contactNumber
          ? `  <or>For queries, contact: <strong>${contactNumber}</strong> or Whatsapp: <strong>${whatsappNumber}></strong> </p> `
          : "",
        `  <p style="color: #666; margin-top: 30px;">${signature}</p>`,
        "</div>",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo email failed: ${response.status} ${text}`);
  }
}
