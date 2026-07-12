import type { NextRequest } from "next/server"
import { getAccessToken } from "@/lib/google-auth"

export const dynamic = "force-dynamic"

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly"

/**
 * Streams the bytes of a single Drive image through the service account, so the
 * folder can be fully private. The <img> tags in components/GalleryGrid.tsx
 * point here (via lib/drive.ts::getDriveImageUrl).
 *
 * Before streaming, the file's metadata is validated: it must be an image AND
 * live in the configured DRIVE_FOLDER_ID. This stops the proxy from being used
 * to fetch arbitrary files the service account can otherwise see (e.g. the
 * videos sheet).
 */
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/gallery/[id]">,
) {
  const { id } = await ctx.params
  const folderId = process.env.DRIVE_FOLDER_ID

  if (!folderId) {
    return Response.json({ error: "DRIVE_FOLDER_ID not configured" }, { status: 500 })
  }

  try {
    const token = await getAccessToken(DRIVE_SCOPE)
    const authHeader = { Authorization: `Bearer ${token}` }

    // 1. Validate the file is an image inside the gallery folder.
    const metaUrl = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`,
    )
    metaUrl.searchParams.set("fields", "id,mimeType,parents")

    const metaRes = await fetch(metaUrl.toString(), { headers: authHeader })
    if (!metaRes.ok) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    const meta = (await metaRes.json()) as {
      mimeType?: string
      parents?: string[]
    }

    const isImage = meta.mimeType?.startsWith("image/")
    const inFolder = meta.parents?.includes(folderId)
    if (!isImage || !inFolder) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    // 2. Stream the raw bytes back to the browser.
    const mediaUrl = new URL(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}`,
    )
    mediaUrl.searchParams.set("alt", "media")

    const mediaRes = await fetch(mediaUrl.toString(), { headers: authHeader })
    if (!mediaRes.ok || !mediaRes.body) {
      return Response.json({ error: "Failed to load image" }, { status: 502 })
    }

    return new Response(mediaRes.body, {
      headers: {
        "Content-Type": meta.mimeType as string,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
