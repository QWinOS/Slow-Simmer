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
  return null // stub — implement in GREEN phase
}

/**
 * Extract an Instagram post/reel ID from Instagram URL formats:
 * - https://www.instagram.com/p/<id>/
 * - https://instagram.com/reel/<id>
 */
export function getInstagramPostIdFromUrl(url: string): string | null {
  return null // stub — implement in GREEN phase
}

/**
 * Detect the video platform from a URL.
 * Returns "youtube" for YouTube URLs, "instagram" for Instagram URLs, null otherwise.
 */
export function detectVideoPlatform(url: string): "youtube" | "instagram" | null {
  return null // stub — implement in GREEN phase
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
