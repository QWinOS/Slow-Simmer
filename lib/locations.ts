export interface LocationEvent {
  location: string
  date: string
  time: string
  price: number
  maxMember: number  // remaining seats, incl. registrant
}

export async function fetchLocations(): Promise<LocationEvent[]> {
  const response = await fetch("/api/locations")

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Failed to load locations: ${response.status}`)
  }

  return response.json()
}
