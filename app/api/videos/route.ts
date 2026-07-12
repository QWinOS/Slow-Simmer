import {
  detectVideoPlatform,
  getYouTubeVideoIdFromUrl,
  getInstagramPostIdFromUrl,
} from "@/lib/video"
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
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Video!A2:B1000`,
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

    const videos: Array<{
      id: string
      platform: "youtube" | "instagram"
      videoId: string
      title: string
    }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rawUrl = row[0]?.trim()
      if (!rawUrl) continue

      const platform = detectVideoPlatform(rawUrl)
      if (!platform) continue

      const videoId =
        platform === "youtube"
          ? getYouTubeVideoIdFromUrl(rawUrl)
          : getInstagramPostIdFromUrl(rawUrl)
      if (!videoId) continue

      const title = row[1]?.trim() || "Slow Simmer Video"
      videos.push({ id: `video-${i}`, platform, videoId, title })
    }

    return Response.json(videos)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
