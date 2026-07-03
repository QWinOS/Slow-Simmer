"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchGalleryImages, getDriveImageUrl } from "@/lib/drive"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RiErrorWarningLine, RiImageLine } from "@remixicon/react"
import type { DriveFile } from "@/lib/drive"

interface GalleryGridProps {
  images: DriveFile[]
  onImagesLoaded: (images: DriveFile[]) => void
  onImageClick: (index: number) => void
}

export function GalleryGrid({
  images,
  onImagesLoaded,
  onImageClick,
}: GalleryGridProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchGalleryImages()
      onImagesLoaded(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images")
    } finally {
      setLoading(false)
    }
  }, [onImagesLoaded])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Loading state
  if (loading && images.length === 0) {
    return (
      <>
        <div className="flex sm:hidden gap-3 overflow-x-auto -mx-4 px-4 scrollbar-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] min-w-[280px] w-[80vw] flex-shrink-0 rounded-xl" />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </>
    )
  }

  // Error state
  if (error !== null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RiErrorWarningLine
          size={48}
          className="text-muted-foreground mb-4"
        />
        <p className="text-muted-foreground mb-4">
          Unable to load gallery. Please try again later.
        </p>
        <Button variant="outline" onClick={fetchImages}>
          Retry
        </Button>
      </div>
    )
  }

  // Empty state
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RiImageLine size={48} className="text-muted-foreground mb-4" />
        <p className="text-lg font-heading font-bold text-foreground mb-1">
          No photos yet
        </p>
        <p className="text-muted-foreground">
          Check back soon — new photos will appear here automatically.
        </p>
      </div>
    )
  }

  // Loaded state
  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex sm:hidden gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scrollbar-none">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="aspect-[4/3] min-w-[280px] w-[80vw] flex-shrink-0 overflow-hidden bg-transparent ring-0 cursor-pointer snap-center"
            onClick={() => onImageClick(index)}
          >
            <img
              src={getDriveImageUrl(image.id)}
              alt={image.name || "Slow Simmer event photo"}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Card>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card
            key={image.id}
            className="aspect-[4/3] overflow-hidden bg-transparent ring-0 cursor-pointer"
            onClick={() => onImageClick(index)}
          >
            <img
              src={getDriveImageUrl(image.id)}
              alt={image.name || "Slow Simmer event photo"}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Card>
        ))}
      </div>
    </>
  )
}
