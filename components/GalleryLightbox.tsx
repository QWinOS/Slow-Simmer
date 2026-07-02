"use client"

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
  return null
}
