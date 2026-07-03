export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
}

export async function fetchGalleryImages(): Promise<DriveFile[]> {
  const folderId = process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!folderId || !apiKey) {
    console.warn("Drive API credentials not configured");
    return [];
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set(
    "q",
    `'${folderId}' in parents and mimeType contains 'image/'`
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("fields", "files(id,name,mimeType,webContentLink)");
  url.searchParams.set("pageSize", "50");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

export function getDriveImageUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`;
}
