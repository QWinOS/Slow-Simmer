"use client"

import { useState } from "react"
import { GalleryGrid } from "./GalleryGrid"
import { GalleryLightbox } from "./GalleryLightbox"
import type { DriveFile } from "@/lib/drive"
import Reveal from "@/components/Reveal"

export default function GallerySection() {
  const [images, setImages] = useState<DriveFile[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setSelectedIndex(index)
  const closeLightbox = () => setSelectedIndex(null)

  return (
    <section id="gallery" className="relative py-16 sm:py-24 scroll-mt-16">
      {/* Background accent */}
      <div className="absolute top-1/3 right-0 size-[45vmin] max-w-[500px] rounded-full bg-gradient-to-l from-amber-100/50 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />
      <div className="absolute -bottom-1/4 left-0 size-[40vmin] max-w-[400px] rounded-full bg-gradient-to-r from-amber-100/40 to-transparent dark:from-amber-500/5 blur-3xl -z-10" />

      <Reveal>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-center mb-12 text-foreground">
          Gallery
        </h2>
      </Reveal>

      <Reveal delay={150}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryGrid
            images={images}
            onImagesLoaded={setImages}
            onImageClick={openLightbox}
          />
        </div>
      </Reveal>
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
