"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getDriveImageUrl } from "@/lib/drive"
import {
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiZoomInLine,
  RiZoomOutLine,
} from "@remixicon/react"
import type { DriveFile } from "@/lib/drive"

interface GalleryLightboxProps {
  images: DriveFile[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function GalleryLightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const lastTap = useRef(0)

  const prevIndex =
    (currentIndex - 1 + images.length) % images.length
  const nextIndex =
    (currentIndex + 1) % images.length

  const toggleZoom = useCallback(() => {
    setZoomed((prev) => !prev)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setZoomed(false)
        onNavigate(prevIndex)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setZoomed(false)
        onNavigate(nextIndex)
      } else if (e.key === "Escape") {
        setZoomed(false)
      }
    },
    [onNavigate, prevIndex, nextIndex]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      toggleZoom()
    },
    [toggleZoom]
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoomed) return
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const now = Date.now()
    const dt = now - lastTap.current
    lastTap.current = now

    if (dt < 300 && dt > 0) {
      toggleZoom()
      touchStartX.current = null
      touchEndX.current = null
      return
    }

    if (zoomed || touchStartX.current === null || touchEndX.current === null) return
    const diff = touchEndX.current - touchStartX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNavigate(prevIndex)
      } else {
        onNavigate(nextIndex)
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="max-w-5xl w-[95vw] p-0 bg-black/95 border-none"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Photo viewer</DialogTitle>
        <DialogDescription className="sr-only">
          Viewing photo {currentIndex + 1} of {images.length}
        </DialogDescription>

        {/* Top toolbar */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleZoom}
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
          >
            {zoomed ? <RiZoomOutLine /> : <RiZoomInLine />}
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <RiCloseLine />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </div>

        {/* Navigation arrows - hidden on mobile */}
        <button
          onClick={() => onNavigate(prevIndex)}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center size-10 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
          aria-label="Previous photo"
        >
          <RiArrowLeftSLine size={28} />
        </button>

        <button
          onClick={() => onNavigate(nextIndex)}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center size-10 rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-colors"
          aria-label="Next photo"
        >
          <RiArrowRightSLine size={28} />
        </button>

        {/* Image */}
        <div
          className={`flex items-center justify-center select-none ${
            zoomed ? "h-[80vh] cursor-zoom-out" : "min-h-[50vh] cursor-zoom-in"
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={getDriveImageUrl(images[currentIndex].id)}
            alt={images[currentIndex].name || "Slow Simmer event photo"}
            onClick={handleImageClick}
            className={`transition-all duration-200 ease-in-out ${
              zoomed
                ? "h-full w-full object-cover"
                : "max-h-[85vh] w-full object-contain"
            }`}
            draggable={false}
          />
        </div>

        {/* Image counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  )
}
