import { getLocationCapacity, setLocationCapacity } from "@/lib/location-capacity"

export interface Guest {
  name: string
  age: string
}

/** guests JSON from Razorpay order notes → normalized [{name, age}]. */
export function parseGuests(raw: string | undefined): Guest[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
      .map((g) => ({
        name: String(g?.name ?? "").trim(),
        age: String(g?.age ?? "").trim(),
      }))
      .filter((g) => g.name || g.age)
  } catch {
    return []
  }
}

/**
 * Decrements a location's remaining capacity by the party size after a booking.
 * party = 1 (registrant) + guest count. Floored at 0.
 *
 * ponytail: read-then-write, no transaction (Google Sheets has none) — two
 * concurrent last-seat bookings can oversell by one. Fine at this volume; the
 * host sees the rows and the sold-out check at order-create is the front line.
 * Never throws — capacity drift must not fail an already-paid registration.
 */
export async function decrementCapacity(location: string, guestCount: number): Promise<void> {
  if (!location) return
  try {
    const cap = await getLocationCapacity(location)
    if (!cap || cap.maxCol < 0) return
    const party = 1 + Math.max(0, guestCount)
    await setLocationCapacity(cap.rowNumber, cap.maxCol, cap.maxMember - party)
  } catch (err) {
    console.error("Capacity decrement failed:", err)
  }
}
