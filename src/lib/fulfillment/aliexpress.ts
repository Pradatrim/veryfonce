// Automatic order fulfillment to AliExpress.
// ----------------------------------------------------------------------------
// When a customer's payment succeeds, we automatically place the corresponding
// order with the supplier — no manual action by the creator or anyone.
//
// LIVE mode (when ALIEXPRESS credentials are set) is where the AliExpress
// Dropship "place order" API call goes. That program requires business
// approval, so the call is stubbed with the exact shape it needs and clearly
// marked. DEMO mode simulates a successful placement so the end-to-end flow
// (pay -> auto-order -> ordered) works today.
// ----------------------------------------------------------------------------

import { db } from "@/lib/db";

export interface FulfillmentResult {
  ok: boolean;
  supplierOrderId?: string;
  trackingNumber?: string;
  error?: string;
}

interface FulfillmentInput {
  orderId: string;
  sourceItemId: string | null;
  sourceVariantId: string | null;
  quantity: number;
  ship: {
    name?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal?: string | null;
    country?: string | null;
  };
}

function hasLiveCredentials(): boolean {
  return Boolean(process.env.ALIEXPRESS_APP_KEY && process.env.ALIEXPRESS_APP_SECRET);
}

async function placeLiveOrder(input: FulfillmentInput): Promise<FulfillmentResult> {
  // ── AliExpress Dropship API integration point ──────────────────────────
  // Once your AliExpress dropship/affiliate app is approved, implement the
  // signed request to `aliexpress.ds.order.create` here, e.g.:
  //
  //   const params = {
  //     method: "aliexpress.trade.buy.placeorder",
  //     app_key: process.env.ALIEXPRESS_APP_KEY,
  //     param_place_order_request4_open_api_d_t_o: JSON.stringify({
  //       logistics_address: { ...input.ship },
  //       product_items: [{
  //         product_id: input.sourceItemId,
  //         sku_attr: input.sourceVariantId,
  //         product_count: input.quantity,
  //       }],
  //     }),
  //   };
  //   const signed = signAliExpress(params, process.env.ALIEXPRESS_APP_SECRET!);
  //   const res = await fetch("https://api-sg.aliexpress.com/sync", { ... });
  //
  // Parse the response for the order id + tracking and return it below.
  // Until that is wired, fail loudly so orders are not silently lost.
  return {
    ok: false,
    error:
      "AliExpress live ordering not yet implemented — add the signed Dropship API call in placeLiveOrder().",
  };
}

function simulateOrder(input: FulfillmentInput): FulfillmentResult {
  // Deterministic-ish fake order id for the demo.
  const supplierOrderId = `AE-DEMO-${input.orderId.slice(-6).toUpperCase()}`;
  return { ok: true, supplierOrderId };
}

/**
 * Auto-place the supplier order for a paid Order, and record the result on the
 * Order row. Safe to call once per paid order (idempotent-ish: it only acts on
 * orders that are paid and not already ordered).
 */
export async function fulfillOrder(orderId: string): Promise<FulfillmentResult> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { product: true, variant: true },
  });
  if (!order) return { ok: false, error: "order not found" };
  if (order.paymentStatus !== "paid") {
    return { ok: false, error: "order not paid yet" };
  }
  if (order.fulfillmentStatus === "ordered" || order.fulfillmentStatus === "shipped") {
    return { ok: true, supplierOrderId: order.supplierOrderId ?? undefined };
  }

  await db.order.update({
    where: { id: orderId },
    data: { fulfillmentStatus: "queued" },
  });

  const input: FulfillmentInput = {
    orderId: order.id,
    sourceItemId: order.product.sourceItemId,
    sourceVariantId: order.variant?.sourceVariantId ?? null,
    quantity: order.quantity,
    ship: {
      name: order.shipName,
      line1: order.shipLine1,
      line2: order.shipLine2,
      city: order.shipCity,
      state: order.shipState,
      postal: order.shipPostal,
      country: order.shipCountry,
    },
  };

  const result = hasLiveCredentials()
    ? await placeLiveOrder(input)
    : simulateOrder(input);

  await db.order.update({
    where: { id: orderId },
    data: result.ok
      ? {
          fulfillmentStatus: "ordered",
          supplierOrderId: result.supplierOrderId,
          trackingNumber: result.trackingNumber,
          fulfillmentError: null,
        }
      : {
          fulfillmentStatus: "failed",
          fulfillmentError: result.error ?? "unknown error",
        },
  });

  return result;
}
