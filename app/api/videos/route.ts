import crypto from "crypto"
import {
  detectVideoPlatform,
  getYouTubeVideoIdFromUrl,
  getInstagramPostIdFromUrl,
} from "@/lib/video"

export const dynamic = "force-dynamic"

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url")
}

function base64urlFromBuffer(buf: Buffer): string {
  return buf.toString("base64url")
}

function createJWT(payload: Record<string, unknown>, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`
  const sig = crypto.sign("sha256", Buffer.from(data), privateKey)
  return `${data}.${base64urlFromBuffer(sig)}`
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  if (cachedToken && cachedToken.expiresAt > now + 60) {
    return cachedToken.token
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  if (!email || !privateKey) {
    throw new Error("Google service account not configured")
  }

  const jwt = createJWT(
    {
      iss: email,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    privateKey,
  )

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  cachedToken = { token: data.access_token, expiresAt: now + data.expires_in }
  return data.access_token
}

export async function GET() {
  const sheetId = process.env.VIDEOS_SHEET_ID

  if (!sheetId) {
    return Response.json({ error: "VIDEOS_SHEET_ID not configured" }, { status: 500 })
  }

  try {
    const token = await getAccessToken()

    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A2:B1000`,
    )

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        { error: `Sheets API error: ${response.status}`, detail: text },
        { status: response.status },
      )
    }

    const data = await response.json()
    const rows: string[][] = data.values || []

    const videos: Array<{
      id: string
      platform: "youtube" | "instagram"
      videoId: string
      title: string
    }> = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rawUrl = row[0]?.trim()
      if (!rawUrl) continue

      const platform = detectVideoPlatform(rawUrl)
      if (!platform) continue

      const videoId =
        platform === "youtube"
          ? getYouTubeVideoIdFromUrl(rawUrl)
          : getInstagramPostIdFromUrl(rawUrl)
      if (!videoId) continue

      const title = row[1]?.trim() || "Slow Simmer Video"
      videos.push({ id: `video-${i}`, platform, videoId, title })
    }

    return Response.json(videos)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return Response.json({ error: message }, { status: 500 })
  }
}
