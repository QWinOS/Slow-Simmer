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

    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Location_Date!A2:C1000`,
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

    const locations = rows
      .map((row) => {
        const location = row[0]?.trim()
        if (!location) return null
        return {
          location,
          date: row[1]?.trim() || "",
          time: row[2]?.trim() || "",
        }
      })
      .filter(Boolean)

    return Response.json(locations)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
