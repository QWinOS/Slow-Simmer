export interface VideoItem {
  id: string
  platform: "youtube" | "instagram"
  videoId: string
  title: string
  thumbnailUrl?: string
}

/**
 * Extract a YouTube video ID from various YouTube URL formats:
 * - https://www.youtube.com/watch?v=<id>
 * - https://youtu.be/<id>
 * - https://www.youtube.com/shorts/<id>
 * - A bare 11-character YouTube video ID
 */
export function getYouTubeVideoIdFromUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  // Bare ID: no protocol, no path separators, no dots, matches YouTube ID charset
  if (
    !trimmed.includes("://") &&
    !trimmed.includes("/") &&
    !trimmed.includes(".")
  ) {
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
    return null
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, "")

  if (host === "youtube.com" || host === "m.youtube.com") {
    // /watch?v=<id>
    const v = parsed.searchParams.get("v")
    if (v) return v

    // /shorts/<id>
    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shortsMatch) return shortsMatch[1]

    return null
  }

  if (host === "youtu.be") {
    const path = parsed.pathname.replace(/^\//, "").split("/")[0]
    return path || null
  }

  return null
}

/**
 * Extract an Instagram post/reel ID from Instagram URL formats:
 * - https://www.instagram.com/p/<id>/
 * - https://instagram.com/reel/<id>
 */
export function getInstagramPostIdFromUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const host = parsed.hostname.replace(/^www\./, "")
  if (host !== "instagram.com") return null

  // Match /p/<id> or /reel/<id>
  const match = parsed.pathname.match(/^\/(p|reel)\/([^/?]+)/)
  return match ? match[2] : null
}

/**
 * Detect the video platform from a URL.
 * Returns "youtube" for YouTube URLs, "instagram" for Instagram URLs, null otherwise.
 *
 * Order: YouTube check first. Only bare tokens (no host) match YouTube's bare-ID
 * branch, so an Instagram URL with a host never falsely matches YouTube.
 */
export function detectVideoPlatform(url: string): "youtube" | "instagram" | null {
  if (getYouTubeVideoIdFromUrl(url)) return "youtube"
  if (getInstagramPostIdFromUrl(url)) return "instagram"
  return null
}

export function getYouTubeEmbedUrl(
  videoId: string,
  autoplay?: boolean
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
  });
  if (autoplay) {
    params.set("autoplay", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getInstagramEmbedUrl(postId: string): string {
  return `https://www.instagram.com/p/${postId}/embed`;
}
