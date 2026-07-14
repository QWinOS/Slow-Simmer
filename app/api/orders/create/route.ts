import { createOrder } from "@/lib/razorpay"
import { getLocationCapacity } from "@/lib/location-capacity"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { location, guestCount, notes } = (await request.json()) as {
      location?: string
      guestCount?: number
      notes?: Record<string, string>
    }

    if (!location) {
      return NextResponse.json({ error: "Missing location" }, { status: 400 })
    }

    // guests = extra people beyond the registrant; party = 1 + guests.
    const guests = Math.max(0, Math.floor(Number(guestCount) || 0))
    const party = 1 + guests

    // Price + remaining capacity are read server-side so the client can't
    // under-pay or overbook by editing its own amount/count.
    const cap = await getLocationCapacity(location)
    if (!cap) {
      return NextResponse.json({ error: "Unknown location" }, { status: 400 })
    }
    if (cap.price <= 0) {
      return NextResponse.json({ error: "Location not bookable" }, { status: 400 })
    }
    if (cap.maxMember < party) {
      return NextResponse.json(
        {
          error:
            cap.maxMember <= 0
              ? "Sold out — no seats left for this event."
              : `Only ${cap.maxMember} seat(s) left for this event.`,
          soldOut: true,
          seatsLeft: cap.maxMember,
        },
        { status: 409 },
      )
    }

    const amount = cap.price * party // paise, authoritative

    const order = await createOrder({ amount, notes })

    return NextResponse.json({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
