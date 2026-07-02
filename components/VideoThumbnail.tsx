"use client"

import { Card } from "@/components/ui/card"
import {
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getInstagramEmbedUrl,
} from "@/lib/video"
import { RiPlayCircleFill, RiCloseLine, RiVideoLine } from "@remixicon/react"
import type { VideoItem } from "@/lib/video"

interface VideoThumbnailProps {
  video: VideoItem
  isPlaying: boolean
  onPlay: () => void
}

export function VideoThumbnail({ video, isPlaying, onPlay }: VideoThumbnailProps) {
  if (isPlaying) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <iframe
          src={
            video.platform === "youtube"
              ? getYouTubeEmbedUrl(video.videoId, true)
              : getInstagramEmbedUrl(video.videoId)
          }
          className="w-full h-full rounded-xl border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPlay()
          }}
          className="absolute top-2 right-2 z-10 bg-black/60 rounded-full p-1 text-white hover:bg-black/80"
          aria-label="Close video"
        >
          <RiCloseLine className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <Card
      className="aspect-video overflow-hidden rounded-xl bg-transparent ring-0 cursor-pointer group relative"
      onClick={onPlay}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onPlay()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Play ${video.title}`}
    >
      {/* Thumbnail image */}
      {video.platform === "youtube" ? (
        <img
          src={getYouTubeThumbnailUrl(video.videoId)}
          alt={video.title}
          className="w-full h-full object-cover group-hover:brightness-110 transition-all"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-pink-800 to-orange-800 flex items-center justify-center">
          <RiVideoLine size={48} className="text-white/40" />
        </div>
      )}

      {/* Play overlay icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <RiPlayCircleFill
          size={52}
          className="text-accent z-10 drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
        />
      </div>

      {/* Bottom gradient overlay with title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8">
        <p className="text-white text-sm font-medium">{video.title}</p>
      </div>
    </Card>
  )
}
