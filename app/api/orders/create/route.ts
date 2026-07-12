import { createOrder } from "@/lib/razorpay"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { amount, notes } = (await request.json()) as {
      amount: number
      notes?: Record<string, string>
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 },
      )
    }

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
