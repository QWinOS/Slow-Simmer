"use client"

import { useState } from "react"
import { VideoGrid } from "./VideoGrid"
import Reveal from "@/components/Reveal"
import type { VideoItem } from "@/lib/video"

// Video configuration — defined inline as a typed constant array
// Replace these IDs with actual event video IDs as content becomes available
const VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    platform: "youtube",
    videoId: "dQw4w9WgXcQ",
    title: "Past Event Highlights",
  },
  {
    id: "vid-2",
    platform: "instagram",
    videoId: "CxYxZzABCDe",
    title: "Behind the Scenes",
  },
]

export default function VideoSection() {
  const [playingId, setPlayingId] = useState<string | null>(null)

  return (
    <section
      id="videos"
      className="relative py-16 sm:py-24 scroll-mt-16 bg-muted/30"
    >
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[55vmin] max-w-[600px] rounded-full bg-gradient-to-br from-amber-100/40 via-amber-50/30 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12 text-foreground">
            Videos
          </h2>
        </Reveal>

        <Reveal delay={150}>
          <VideoGrid
            videos={VIDEOS}
            playingId={playingId}
            onPlay={setPlayingId}
          />
        </Reveal>
      </div>
    </section>
  )
}
