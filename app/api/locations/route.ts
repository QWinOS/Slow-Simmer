import { getAccessToken } from "@/lib/google-auth"

export const dynamic = "force-dynamic"

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"

export async function GET() {
  const sheetId = process.env.VIDEOS_SHEET_ID

  if (!sheetId) {
    return Response.json({ error: "VIDEOS_SHEET_ID not configured" }, { status: 500 })
  }

  try {
    const token = await getAccessToken(SHEETS_SCOPE)

    // Read from row 1 so we can locate the "Max Member" capacity column by its
    // header name rather than a fixed position (sheet columns may be reordered).
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Location_Date!A1:Z1000`,
    )

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        { error: `Sheets API error: ${response.status}`, detail: text },
        { status: response.status },
      )
    }

    const data = await response.json()
    const rows: string[][] = data.values || []
    const header = (rows[0] || []).map((h) => h?.trim().toLowerCase())
    // Location/Date/Time/Price stay positional (A-D) as before; only capacity
    // is looked up by header. Match any "max ..." header (Max Guest / Max
    // Member / Max Guests) — Location_Date only has one such column.
    const maxCol = header.findIndex((h) => h?.includes("max"))

    const locations = rows
      .slice(1)
      .map((row) => {
        const location = row[0]?.trim()
        if (!location) return null
        const rawPrice = row[3]?.trim()
        const rawMax = maxCol >= 0 ? row[maxCol]?.trim() : undefined
        const maxMember = rawMax ? parseInt(rawMax, 10) : 0
        return {
          location,
          date: row[1]?.trim() || "",
          time: row[2]?.trim() || "",
          price: rawPrice ? parseInt(rawPrice, 10) * 100 : 0,
          maxMember: Number.isFinite(maxMember) ? maxMember : 0,
        }
      })
      .filter(Boolean)

    return Response.json(locations)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
