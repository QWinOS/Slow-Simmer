"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Image from "next/image"
import { fetchGalleryImages, getDriveImageUrl } from "@/lib/drive"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react"
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

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollSlider = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

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
        <AlertTriangle
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
        <ImageIcon size={48} className="text-muted-foreground mb-4" />
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
            <Image
              src={getDriveImageUrl(image.id)}
              alt={image.name || "Slow Simmer event photo"}
              width={400}
              height={300}
              sizes="80vw"
              quality={60}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </Card>
        ))}
      </div>
      {/* Desktop: slider */}
      <div className="hidden sm:block relative group">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory"
        >
          {images.map((image, index) => (
            <Card
              key={image.id}
              className="aspect-[4/3] min-w-[240px] w-[calc(25%-12px)] flex-shrink-0 overflow-hidden bg-transparent ring-0 cursor-pointer snap-start"
              onClick={() => onImageClick(index)}
            >
              <Image
                src={getDriveImageUrl(image.id)}
                alt={image.name || "Slow Simmer event photo"}
                width={400}
                height={300}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 80vw"
                quality={60}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </Card>
          ))}
        </div>
        {images.length > 4 && (
          <>
            <button
              onClick={() => scrollSlider("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 size-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Previous"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              onClick={() => scrollSlider("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 size-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Next"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
    </>
  )
}
