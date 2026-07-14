import crypto from "crypto"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url")
}

function createJWT(payload: Record<string, unknown>, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`
  const sig = crypto.sign("sha256", Buffer.from(data), privateKey)
  return `${data}.${sig.toString("base64url")}`
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>()

export async function getSheetsToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const cached = tokenCache.get("sheets")
  if (cached && cached.expiresAt > now + 60) return cached.token

  const email = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL
    || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = (process.env.GOOGLE_SHEETS_PRIVATE_KEY
    || process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  if (!email || !privateKey) {
    throw new Error("Google service account not configured for sheets")
  }

  const jwt = createJWT(
    { iss: email, scope: SHEETS_SCOPE, aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now },
    privateKey,
  )

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Sheets token exchange failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  tokenCache.set("sheets", { token: data.access_token, expiresAt: now + data.expires_in })
  return data.access_token
}

/**
 * Schema: Location, Event Date, Event Time, Name, Contact, Email, Aadhar,
 * Bringing Guest, About, Social, Payment Status, Payment ID, Timestamp,
 * Guest Details.
 */
export interface RegistrationRow {
  location: string
  eventDate: string
  eventTime: string
  name: string
  contact: string
  email: string
  aadhar: string
  bringingGuest: string  // "Yes" or "No"
  about: string
  social: string
  paymentStatus: string
  paymentId: string
  timestamp: string
  guestDetails: string   // JSON array of { name, age }
}

/**
 * Appends a registration row to the Registrations sheet tab.
 * Uses the write scope (not .readonly) — different from locations/ sheets read.
 * Per D-04: Writes to the same spreadsheet (VIDEOS_SHEET_ID) in Registrations tab.
 * Per SHEET-02: Writes all 15 columns in the correct order.
 * Throws on failure — caller (webhook handler) handles retry per D-07.
 */
export async function appendRegistrationRow(row: RegistrationRow): Promise<void> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getSheetsToken()

  const values = [[
    row.location,
    row.eventDate,
    row.eventTime,
    row.name,
    row.contact,
    row.email,
    row.aadhar,
    row.bringingGuest,
    row.about,
    row.social,
    row.paymentStatus,
    row.paymentId,
    row.timestamp,
    row.guestDetails,
  ]]

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Registrations!A:N:append`,
  )
  url.searchParams.set("valueInputOption", "USER_ENTERED")
  url.searchParams.set("insertDataOption", "INSERT_ROWS")

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Sheets append failed: ${response.status} ${text}`)
  }
}

/**
 * Idempotency check per D-06.
 * Queries the Registrations tab's Payment ID column (N) for an existing value.
 * Returns true if the Payment ID already exists (duplicate webhook callback).
 * Per SHEET-03: Guards against duplicate webhook callbacks adding duplicate rows.
 * On API error, returns false (assume not duplicate to avoid blocking the write).
 */
export async function checkPaymentIdExists(paymentId: string): Promise<boolean> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getSheetsToken()

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Registrations!N:N`,
  )

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) return false

  const data = await response.json()
  const rows: string[][] = data.values || []

  // Skip header row (index 0), check all Payment ID values (column N)
  return rows.slice(1).some((row) => row[0]?.trim() === paymentId)
}
