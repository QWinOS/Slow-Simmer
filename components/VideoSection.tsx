"use client"

import { useState } from "react"
import { VideoGrid } from "./VideoGrid"

export interface VideoItem {
  id: string
  platform: "youtube" | "instagram"
  videoId: string
  title: string
  thumbnailUrl?: string
}

// Video configuration — defined inline as a typed constant array
// Replace these IDs with actual event video IDs as content becomes available
const VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    platform: "youtube",
    videoId: "dQw4w9WgXcQ", // Example — REPLACE with actual video ID
    title: "Past Event Highlights",
  },
  {
    id: "vid-2",
    platform: "instagram",
    videoId: "CxYxZzABCDe", // Example — REPLACE with actual Instagram post ID
    title: "Behind the Scenes",
  },
]

export default function VideoSection() {
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <section
      id="videos"
      className="py-16 sm:py-24 scroll-mt-16 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12 text-foreground">
          Videos
        </h2>
        <VideoGrid
          videos={VIDEOS}
          playingId={playingId}
          onPlay={setPlayingId}
        />
      </div>
    </section>
  )
}
