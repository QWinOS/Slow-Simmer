import type { VideoItem } from "@/lib/video"

/**
 * Fetches video links from the server-side API route,
 * which proxies the Google Sheets API using a service account.
 *
 * The sheet stays private — only the service account has access.
 * No API keys or sheet IDs are exposed to the client bundle.
 *
 * Mirrors fetchGalleryImages (lib/drive.ts) in its fetch/fallback/throw contract.
 */
export async function fetchVideoLinks(): Promise<VideoItem[]> {
  const response = await fetch("/api/videos")

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to load videos: ${response.status}`)
  }

  return response.json()
}
