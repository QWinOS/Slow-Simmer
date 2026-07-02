"use client"

import { useEffect, useState } from "react"
import { VideoThumbnail } from "./VideoThumbnail"
import { Skeleton } from "@/components/ui/skeleton"
import { RiVideoLine } from "@remixicon/react"
import type { VideoItem } from "@/lib/video"

interface VideoGridProps {
  videos: VideoItem[]
  playingId: string | null
  onPlay: (id: string | null) => void
}

export function VideoGrid({ videos, playingId, onPlay }: VideoGridProps) {
  const [loading, setLoading] = useState(true)

  // Brief artificial loading to show skeleton state for first-time visitors
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Loading state — skeleton cards matching grid layout
  if (loading) {
    return (
      <>
        <div className="flex md:hidden gap-3 overflow-x-auto -mx-4 px-4 scrollbar-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="aspect-video min-w-[280px] w-[80vw] flex-shrink-0">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="aspect-video">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          ))}
        </div>
      </>
    )
  }

  // Empty state
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RiVideoLine size={48} className="text-muted-foreground mb-4" />
        <p className="text-lg font-heading font-bold text-foreground mb-1">
          No videos yet
        </p>
        <p className="text-muted-foreground">
          Video content will be added after future events.
        </p>
      </div>
    )
  }

  // Loaded state
  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-none">
        {videos.map((video) => (
          <div key={video.id} className="min-w-[280px] w-[80vw] flex-shrink-0 snap-center">
            <VideoThumbnail
              video={video}
              isPlaying={playingId === video.id}
              onPlay={() => onPlay(playingId === video.id ? null : video.id)}
            />
          </div>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {videos.map((video) => (
          <VideoThumbnail
            key={video.id}
            video={video}
            isPlaying={playingId === video.id}
            onPlay={() => onPlay(playingId === video.id ? null : video.id)}
          />
        ))}
      </div>
    </>
  )
}
