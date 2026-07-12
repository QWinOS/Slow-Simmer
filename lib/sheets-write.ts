import { getAccessToken } from "@/lib/google-auth"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

/**
 * Schema per D-05: Location, Event Date, Event Time, Name, Contact, Email,
 * Aadhar, Bringing Guest, Guest Name, Guest Age, About, Social, Payment Status,
 * Payment ID, Timestamp.
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
  guestName: string
  guestAge: string
  about: string
  social: string
  paymentStatus: string
  paymentId: string
  timestamp: string
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

  const token = await getAccessToken(SHEETS_SCOPE)

  const values = [[
    row.location,
    row.eventDate,
    row.eventTime,
    row.name,
    row.contact,
    row.email,
    row.aadhar,
    row.bringingGuest,
    row.guestName,
    row.guestAge,
    row.about,
    row.social,
    row.paymentStatus,
    row.paymentId,
    row.timestamp,
  ]]

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Registrations!A:O:append`,
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

  const token = await getAccessToken(SHEETS_SCOPE)

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
