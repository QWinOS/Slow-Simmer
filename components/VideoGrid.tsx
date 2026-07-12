"use client"

import { useRef } from "react"
import { VideoThumbnail } from "./VideoThumbnail"
import { Skeleton } from "@/components/ui/skeleton"
import { RiVideoLine, RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import type { VideoItem } from "@/lib/video"

interface VideoGridProps {
  videos: VideoItem[]
  playingId: string | null
  onPlay: (id: string | null) => void
  loading?: boolean
  error?: string | null
}

export function VideoGrid({ videos, playingId, onPlay, loading = true, error }: VideoGridProps) {
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

  // Error state — show before empty since an error also means no videos
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RiVideoLine size={48} className="text-destructive mb-4" />
        <p className="text-lg font-heading font-bold text-destructive mb-1">
          Failed to load videos
        </p>
        <p className="text-muted-foreground max-w-md">
          {error}. Make sure the Google Sheets API is enabled and the sheet is shared publicly.
        </p>
      </div>
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

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollSlider = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  // Loaded state
  const playingVideo = playingId ? videos.find((v) => v.id === playingId) : null

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-none">
        {videos.map((video) =>
          video.id === playingId ? null : (
            <div key={video.id} className="min-w-[280px] w-[80vw] flex-shrink-0 snap-center">
              <VideoThumbnail
                video={video}
                isPlaying={false}
                onPlay={() => onPlay(video.id)}
              />
            </div>
          ),
        )}
      </div>
      {/* Desktop: slider */}
      <div className="hidden md:block relative group">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory"
        >
          {videos.map((video) =>
            video.id === playingId ? null : (
              <div
                key={video.id}
                className="min-w-[320px] w-[calc(50%-12px)] flex-shrink-0 snap-start"
              >
                <VideoThumbnail
                  video={video}
                  isPlaying={false}
                  onPlay={() => onPlay(video.id)}
                />
              </div>
            ),
          )}
        </div>
        {videos.length > 2 && (
          <>
            <button
              onClick={() => scrollSlider("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 size-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Previous"
            >
              <RiArrowLeftSLine className="size-6" />
            </button>
            <button
              onClick={() => scrollSlider("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 size-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Next"
            >
              <RiArrowRightSLine className="size-6" />
            </button>
          </>
        )}
      </div>
      {/* Playing video iframe — rendered once */}
      {playingVideo && (
        <div className="mt-6 max-w-4xl mx-auto">
          <VideoThumbnail
            video={playingVideo}
            isPlaying
            onPlay={() => onPlay(null)}
          />
        </div>
      )}
    </>
  )
}
