"use client"

import { useState, useCallback, useEffect } from "react"
import { VideoGrid } from "./VideoGrid"
import Reveal from "@/components/Reveal"
import { fetchVideoLinks } from "@/lib/sheets"
import type { VideoItem } from "@/lib/video"

export default function VideoSection() {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchVideoLinks()
      setVideos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos")
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

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
            videos={videos}
            playingId={playingId}
            onPlay={setPlayingId}
            loading={loading}
            error={error}
          />
        </Reveal>
      </div>
    </section>
  )
}
