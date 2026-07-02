"use client"

import { useState } from "react"
import { GalleryGrid } from "./GalleryGrid"
import { GalleryLightbox } from "./GalleryLightbox"
import type { DriveFile } from "@/lib/drive"

export default function GallerySection() {
  const [images, setImages] = useState<DriveFile[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  return (
    <section id="gallery" className="py-16 sm:py-24 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12 text-foreground">
          Gallery
        </h2>
        <GalleryGrid
          images={images}
          onImagesLoaded={setImages}
          onImageClick={openLightbox}
        />
      </div>
      {selectedIndex !== null && (
        <GalleryLightbox
          images={images}
          currentIndex={selectedIndex}
          onClose={closeLightbox}
          onNavigate={setSelectedIndex}
        />
      )}
    </section>
  )
}
