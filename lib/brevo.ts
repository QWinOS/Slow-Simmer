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
  const whatsappNumberLink = process.env.NEXT_PUBLIC_WHATSAPP_URL || "";
  const whatsappDisplay = whatsappNumberLink.replace(
    /^https?:\/\/wa\.me\//,
    "",
  );
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
        "<!DOCTYPE html>",
        '<html lang="en" style="color-scheme: light dark;">',
        "<head>",
        '  <meta name="color-scheme" content="light dark" />',
        '  <meta name="supported-color-schemes" content="light dark" />',
        "  <style>",
        "    @media (prefers-color-scheme: dark) {",
        "      .e-bg { background: #121212 !important; }",
        "      .e-card { background: #1e1e1e !important; }",
        "      .e-card2 { background: #242424 !important; }",
        "      .e-gold { color: #d4b87a !important; }",
        "      .e-line { background: #d4b87a !important; }",
        "      .e-body { color: #c0bfbc !important; }",
        "      .e-dark { color: #e0dfdc !important; }",
        "      .e-border { border-color: #333 !important; }",
        "      .e-sub { color: #999 !important; }",
        "    }",
        "    [data-ogsc] .e-bg { background: #121212 !important; }",
        "    [data-ogsc] .e-card { background: #1e1e1e !important; }",
        "    [data-ogsc] .e-card2 { background: #242424 !important; }",
        "    [data-ogsc] .e-gold { color: #d4b87a !important; }",
        "    [data-ogsc] .e-body { color: #c0bfbc !important; }",
        "    [data-ogsc] .e-dark { color: #e0dfdc !important; }",
        "    [data-ogsc] .e-border { border-color: #333 !important; }",
        "    [data-ogsc] .e-sub { color: #999 !important; }",
        "  </style>",
        "</head>",
        '<body class="e-bg" style="margin: 0; padding: 0; background: #f5f3ef; -webkit-font-smoothing: antialiased;">',
        '<table align="center" role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Karla, -apple-system, sans-serif; color: #2c2c2c;">',
        `  <tr>`,
        `    <td class="e-card" style="background: #ffffff; padding: 0;">`,
        `      <table role="presentation" style="width: 100%; border-collapse: collapse;">`,
        `        <tr>`,
        `          <td style="padding: 40px 44px 0; text-align: center;">`,
        `            <p class="e-sub" style="font-size: 10px; color: #c9a96e; letter-spacing: 3.5px; text-transform: uppercase; margin: 0 0 20px;">slow simmer · private dining</p>`,
        `            <div class="e-line" style="width: 32px; height: 1.5px; background: #c9a96e; margin: 0 auto 24px;"></div>`,
        `            <h1 class="e-dark" style="font-family: 'Playfair Display SC', Georgia, serif; font-size: 28px; font-weight: 400; color: #1a1a1a; margin: 0; line-height: 1.35; letter-spacing: 0.2px;">Your reservation is confirmed</h1>`,
        `            <p class="e-body" style="font-size: 14px; line-height: 1.7; color: #666; margin: 16px 0 0; max-width: 400px; margin-left: auto; margin-right: auto;">${params.name}, ${bodyLine.toLowerCase()}</p>`,
        `          </td>`,
        `        </tr>`,
        `        <tr>`,
        `          <td style="padding: 28px 44px 4px;">`,
        `            <table role="presentation" style="width: 100%; border-collapse: collapse;">`,
        `              <tr>`,
        `                <td class="e-card2 e-border" style="background: #faf8f4; border: 1px solid #e8e0d4; padding: 0;">`,
        `                  <table role="presentation" style="width: 100%; border-collapse: collapse;">`,
        `                    <tr>`,
        `                      <td class="e-border" style="padding: 18px 24px; border-bottom: 1px solid #e8e0d4;">`,
        `                        <p class="e-sub" style="font-size: 10px; color: #c9a96e; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px;">date</p>`,
        `                        <p class="e-dark" style="font-size: 15px; color: #2c2c2c; margin: 0; font-weight: 500;">${params.eventDate}</p>`,
        `                      </td>`,
        `                    </tr>`,
        `                    <tr>`,
        `                      <td class="e-border" style="padding: 18px 24px; border-bottom: 1px solid #e8e0d4;">`,
        `                        <p class="e-sub" style="font-size: 10px; color: #c9a96e; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px;">time</p>`,
        `                        <p class="e-dark" style="font-size: 15px; color: #2c2c2c; margin: 0; font-weight: 500;">${params.eventTime}</p>`,
        `                      </td>`,
        `                    </tr>`,
        `                    <tr>`,
        `                      <td style="padding: 18px 24px;">`,
        `                        <p class="e-sub" style="font-size: 10px; color: #c9a96e; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 3px;">location</p>`,
        `                        <p class="e-dark" style="font-size: 15px; color: #2c2c2c; margin: 0; font-weight: 500;">${params.location}</p>`,
        `                      </td>`,
        `                    </tr>`,
        `                  </table>`,
        `                </td>`,
        `              </tr>`,
        `            </table>`,
        `          </td>`,
        `        </tr>`,
        `        <tr>`,
        `          <td style="padding: 24px 44px 36px;">`,
        `            <p class="e-body" style="font-size: 14px; line-height: 1.7; color: #555; margin: 0;">The exact address and final details will arrive 24 hours before. A member of our team will be in touch if anything is needed before then.</p>`,
        contactNumber
          ? `            <div class="e-border" style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e0d8;">` +
            `              <table role="presentation" style="width: 100%;">` +
            `                <tr>` +
            `                  <td class="e-sub" style="font-size: 13px; color: #888; padding: 4px 0; letter-spacing: 0.3px;">Call</td>` +
            `                  <td class="e-dark" style="font-size: 14px; color: #2c2c2c; padding: 4px 0; text-align: right; letter-spacing: 0.3px;">${contactNumber}</td>` +
            `                </tr>` +
            `                <tr>` +
            `                  <td class="e-sub" style="font-size: 13px; color: #888; padding: 4px 0; letter-spacing: 0.3px;">Whatsapp</td>` +
            `                  <td style="font-size: 14px; padding: 4px 0; text-align: right; letter-spacing: 0.3px;"><a href="${whatsappNumberLink}" class="e-gold" style="color: #c9a96e; text-decoration: none; border-bottom: 1px solid #e0d5c2;">${whatsappDisplay}</a></td>` +
            `                </tr>` +
            `              </table>` +
            `            </div>`
          : "",
        `            <div class="e-card2 e-border" style="margin-top: 28px; background: #faf8f4; border: 1px solid #e8e0d4; padding: 18px 22px;">`,
        `              <p class="e-sub" style="font-size: 10px; color: #c9a96e; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 6px;">security check</p>`,
        `              <p class="e-body" style="font-size: 13px; line-height: 1.7; color: #555; margin: 0;">To ensure the safety and privacy of all guests, please <strong> Reply To </strong>this email with a clear photo of your Aadhaar Card. If you are attending with a guest, kindly include a clear photo of their Aadhaar Card as well. Identity verification is mandatory for entry. </p>`,
        `            </div>`,
        `            <div class="e-line" style="width: 24px; height: 1px; background: #ddd; margin: 28px auto 0;"></div>`,
        `            <p class="e-sub" style="font-size: 11px; color: #bbb; margin: 16px 0 0; text-align: center; letter-spacing: 1.2px;">${signature}</p>`,
        `          </td>`,
        `        </tr>`,
        `      </table>`,
        `    </td>`,
        `  </tr>`,
        "</table>",
        "</body>",
        "</html>",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Brevo email failed: ${response.status} ${text}`);
  }
}
