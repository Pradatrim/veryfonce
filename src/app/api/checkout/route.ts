import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { computeSplit } from "@/lib/money";
import { createCheckout } from "@/lib/payments/stripe";
import { fulfillOrder } from "@/lib/fulfillment/aliexpress";

const schema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(99).default(1),
  email: z.string().email(),
  name: z.string().min(1).max(120),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postal: z.string().min(1),
    country: z.string().min(2),
  }),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const input = parsed.data;

  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { variants: true, creator: true },
  });
  if (!product || !product.active) {
    return NextResponse.json({ error: "Product unavailable" }, { status: 404 });
  }

  // Resolve the selected variant (if the product has variants, one is required).
  let variant = null;
  if (product.variants.length > 0) {
    variant = product.variants.find((v) => v.id === input.variantId && v.active) ?? null;
    if (!variant) {
      return NextResponse.json({ error: "Please choose an available option" }, { status: 400 });
    }
  }

  const sellPrice = variant ? variant.sellPrice : product.sellPrice;
  const sourcePrice = variant ? variant.sourcePrice : product.sourcePrice;

  // Server-side money math — never trust client prices.
  const split = computeSplit({
    sellPriceDollars: sellPrice,
    sourcePriceDollars: sourcePrice,
    quantity: input.quantity,
  });

  // Create the order (pending until payment confirms).
  const order = await db.order.create({
    data: {
      creatorId: product.creatorId,
      productId: product.id,
      variantId: variant?.id,
      quantity: input.quantity,
      customerEmail: input.email,
      customerName: input.name,
      shipName: input.name,
      shipLine1: input.address.line1,
      shipLine2: input.address.line2,
      shipCity: input.address.city,
      shipState: input.address.state,
      shipPostal: input.address.postal,
      shipCountry: input.address.country,
      currency: product.currency,
      amountTotal: split.amountTotal,
      supplierCost: split.supplierCost,
      platformFee: split.platformFee,
      creatorPayout: split.creatorPayout,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  // The owner's take = supplier cost + platform fee (kept by the platform);
  // the rest is transferred to the creator's connected account.
  const checkout = await createCheckout({
    orderId: order.id,
    productTitle: product.title,
    amountTotal: split.amountTotal,
    ownerTake: split.supplierCost + split.platformFee,
    currency: product.currency,
    creatorStripeAccountId: product.creator.stripeAccountId,
    successUrl: `${appUrl}/order/${order.id}`,
    cancelUrl: `${appUrl}/${product.creator.username}/p/${product.id}`,
    customerEmail: input.email,
  });

  if (checkout.demo) {
    // DEMO mode: no real Stripe. Mark paid and auto-place the supplier order now
    // so the whole flow (pay -> auto-fulfill) is demonstrable immediately.
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: "paid" },
    });
    await fulfillOrder(order.id);
    return NextResponse.json({ ok: true, demo: true, orderId: order.id, redirect: `/order/${order.id}` });
  }

  return NextResponse.json({ ok: true, demo: false, orderId: order.id, redirect: checkout.url });
}
