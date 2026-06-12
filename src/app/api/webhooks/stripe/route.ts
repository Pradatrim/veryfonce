import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/payments/stripe";
import { fulfillOrder } from "@/lib/fulfillment/aliexpress";

// Stripe calls this when a Checkout payment completes. We mark the order paid
// and auto-place the supplier order. This is the live-mode equivalent of the
// demo-mode auto-fulfill in /api/checkout.
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; payment_intent?: string; metadata?: { orderId?: string } };
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "paid",
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        },
      });
      // Automatic fulfillment — no manual step.
      await fulfillOrder(orderId);
    }
  }

  return NextResponse.json({ received: true });
}
