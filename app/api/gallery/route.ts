import { getAccessToken } from "@/lib/google-auth"
import type { DriveFile } from "@/lib/drive"

export const dynamic = "force-dynamic"

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.readonly"

/**
 * Lists image files in the configured Drive folder using the service account,
 * so the folder can stay private (shared only with the service-account email).
 *
 * Mirrors app/api/videos/route.ts. The client (lib/drive.ts) fetches this and
 * renders each file through the /api/gallery/[id] image proxy — no API key or
 * folder id is exposed to the browser.
 */
export async function GET() {
  const folderId = process.env.DRIVE_FOLDER_ID

  if (!folderId) {
    return Response.json({ error: "DRIVE_FOLDER_ID not configured" }, { status: 500 })
  }

  try {
    const token = await getAccessToken(DRIVE_SCOPE)

    const url = new URL("https://www.googleapis.com/drive/v3/files")
    url.searchParams.set(
      "q",
      `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    )
    url.searchParams.set("fields", "files(id,name,mimeType)")
    url.searchParams.set("orderBy", "name")
    url.searchParams.set("pageSize", "50")

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        { error: `Drive API error: ${response.status}`, detail: text },
        { status: response.status },
      )
    }

    const data = await response.json()
    const files: DriveFile[] = data.files || []

    return Response.json(files)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
