import { getAccessToken } from "@/lib/google-auth"
import { getSheetsToken } from "@/lib/sheets-write"

const SHEETS_RW_SCOPE = "https://www.googleapis.com/auth/spreadsheets"

export interface LocationCapacity {
  location: string
  price: number // paise (Price column × 100)
  maxMember: number // seats still available (incl. registrant)
  rowNumber: number // 1-based sheet row, for the decrement write-back
  maxCol: number // 0-based index of the "Max Member" column
}

/**
 * Reads Location_Date once and returns the price + remaining capacity for one
 * location, plus enough position info to write the decremented capacity back.
 * "Max Member" is located by header name (any column); Location/Price stay A/D.
 *
 * Server-only: used by the order + verify routes to make amount and sold-out
 * authoritative, so the client can't under-pay or overbook by editing its copy.
 */
export async function getLocationCapacity(
  location: string,
): Promise<LocationCapacity | null> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")

  const token = await getAccessToken(SHEETS_RW_SCOPE)
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Location_Date!A1:Z1000`,
  )
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Location_Date read failed: ${res.status}`)
  }

  const data = await res.json()
  const rows: string[][] = data.values || []
  // Match any "max ..." header (Max Guest / Max Member) — one such column.
  const header = (rows[0] || []).map((h) => h?.trim().toLowerCase())
  const maxCol = header.findIndex((h) => h?.includes("max"))

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (row[0]?.trim() !== location) continue
    const rawPrice = row[3]?.trim()
    const rawMax = maxCol >= 0 ? row[maxCol]?.trim() : undefined
    const maxMember = rawMax ? parseInt(rawMax, 10) : 0
    return {
      location,
      price: rawPrice ? parseInt(rawPrice, 10) * 100 : 0,
      maxMember: Number.isFinite(maxMember) ? maxMember : 0,
      rowNumber: i + 1, // sheet rows are 1-based
      maxCol: maxCol >= 0 ? maxCol : -1,
    }
  }
  return null
}

/** 0-based column index → A1 letter (0→A, 25→Z). Sheet caps at Z here. */
function colLetter(idx: number): string {
  return String.fromCharCode(65 + idx)
}

/**
 * Writes a new remaining-capacity value into the Max Member cell for a row.
 * ponytail: Sheets has no transactions — a check-then-write here can oversell
 * by one under simultaneous last-seat bookings. Acceptable at supper-club
 * volume; move capacity to a real DB with a conditional update if that changes.
 */
export async function setLocationCapacity(
  rowNumber: number,
  maxCol: number,
  newValue: number,
): Promise<void> {
  const sheetId = process.env.VIDEOS_SHEET_ID
  if (!sheetId) throw new Error("VIDEOS_SHEET_ID not configured")
  if (maxCol < 0) return // no Max Member column → nothing to decrement

  const token = await getSheetsToken()
  const cell = `Location_Date!${colLetter(maxCol)}${rowNumber}`
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${cell}`,
  )
  url.searchParams.set("valueInputOption", "USER_ENTERED")

  const res = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [[Math.max(0, newValue)]] }),
  })
  if (!res.ok) {
    throw new Error(`Capacity update failed: ${res.status}`)
  }
}
