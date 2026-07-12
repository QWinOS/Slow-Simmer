import crypto from "crypto"

/**
 * Shared Google service-account auth for server routes.
 *
 * Mints a short-lived OAuth access token from the service-account credentials
 * using a hand-rolled RS256 JWT (no `googleapis` dependency — matches the rest
 * of the project). Tokens are cached per scope so Sheets and Drive each keep
 * their own token.
 *
 * SERVER-ONLY: reads GOOGLE_PRIVATE_KEY. Import only from route handlers
 * (app/api/**), never from client components — the private key must not reach
 * the browser bundle.
 */

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url")
}

function createJWT(payload: Record<string, unknown>, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedPayload = base64url(JSON.stringify(payload))
  const data = `${encodedHeader}.${encodedPayload}`
  const sig = crypto.sign("sha256", Buffer.from(data), privateKey)
  return `${data}.${sig.toString("base64url")}`
}

const tokenCache = new Map<string, { token: string; expiresAt: number }>()

/**
 * Returns a valid access token for the given OAuth scope, minting a new one
 * only when the cached token for that scope is missing or about to expire.
 */
export async function getAccessToken(scope: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  const cached = tokenCache.get(scope)
  if (cached && cached.expiresAt > now + 60) {
    return cached.token
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n")

  if (!email || !privateKey) {
    throw new Error("Google service account not configured")
  }

  const jwt = createJWT(
    {
      iss: email,
      scope,
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
  tokenCache.set(scope, {
    token: data.access_token,
    expiresAt: now + data.expires_in,
  })
  return data.access_token
}
