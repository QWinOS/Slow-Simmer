import type { VideoItem } from "@/lib/video"
import {
  detectVideoPlatform,
  getYouTubeVideoIdFromUrl,
  getInstagramPostIdFromUrl,
} from "@/lib/video"

/**
 * Fetches video links from a public Google Sheet at runtime.
 *
 * Sheet schema:
 * - Column A: video URL (YouTube or Instagram link)
 * - Column B: optional title (defaults to "Slow Simmer Video")
 *
 * The sheet must be shared "Anyone with the link can view".
 * Credentials: NEXT_PUBLIC_VIDEOS_SHEET_ID + NEXT_PUBLIC_GOOGLE_API_KEY.
 *
 * Mirrors fetchGalleryImages (lib/drive.ts) in its fetch/fallback/throw contract:
 * missing creds → console.warn + return []; bad response → throw; success → typed array or [].
 */
export async function fetchVideoLinks(): Promise<VideoItem[]> {
  const sheetId = process.env.NEXT_PUBLIC_VIDEOS_SHEET_ID
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY

  if (!sheetId || !apiKey) {
    console.warn("Google Sheets credentials not configured")
    return []
  }

  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:B1000`
  )
  url.searchParams.set("key", apiKey)

  const response = await fetch(url.toString())

  if (!response.ok) {
    throw new Error(`Sheets API error: ${response.status}`)
  }

  const data = await response.json()
  const rows: string[][] = data.values || []

  const videos: VideoItem[] = []

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
    videos.push({
      id: `video-${i}`,
      platform,
      videoId,
      title,
    })
  }

  return videos
}
