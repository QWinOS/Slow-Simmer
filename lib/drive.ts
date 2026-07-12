export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Fetches the gallery image list from the server-side API route, which proxies
 * the Google Drive API using a service account.
 *
 * The Drive folder stays private — only the service account has access. No API
 * keys or folder ids are exposed to the client bundle.
 *
 * Mirrors fetchVideoLinks (lib/sheets.ts) in its fetch/fallback/throw contract.
 */
export async function fetchGalleryImages(): Promise<DriveFile[]> {
  const response = await fetch("/api/gallery");

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Failed to load images: ${response.status}`);
  }

  return response.json();
}

/**
 * URL for a single gallery image, served through the authenticated proxy route
 * (app/api/gallery/[id]) so private Drive files render without public sharing.
 */
export function getDriveImageUrl(fileId: string): string {
  return `/api/gallery/${encodeURIComponent(fileId)}`;
}
