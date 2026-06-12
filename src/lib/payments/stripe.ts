// Payments via Stripe Connect.
// ----------------------------------------------------------------------------
// Money flow on every sale:
//   - Customer pays the full sell price.
//   - The supplier cost + the FONCÉ platform fee are kept by the PLATFORM
//     (the owner's Stripe account) — this is the "VIP"/owner income.
//   - The creator's payout is transferred to the creator's connected account.
//
// With Stripe Connect "destination charges" + `application_fee_amount`, Stripe
// performs this split automatically. The application fee = supplierCost +
// platformFee (everything the owner controls); the remainder lands in the
// creator's connected account.
//
// DEMO mode (no STRIPE_SECRET_KEY): we skip Stripe entirely and mark orders
// paid immediately so the full pay -> fulfill flow is testable locally.
// ----------------------------------------------------------------------------

import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: "2024-06-20" });
  return _stripe;
}

export function isStripeLive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export interface CheckoutParams {
  orderId: string;
  productTitle: string;
  amountTotal: number; // cents, what customer pays
  ownerTake: number; // cents = supplierCost + platformFee (application fee)
  currency: string;
  creatorStripeAccountId: string | null;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutResult {
  // In live mode: a Stripe Checkout URL to redirect the customer to.
  // In demo mode: null (the caller treats the order as instantly paid).
  url: string | null;
  demo: boolean;
}

export async function createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    // DEMO: no real payment; caller marks the order paid + fulfills.
    return { url: null, demo: true };
  }

  // Live: a destination charge that automatically splits the money.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: params.currency.toLowerCase(),
          unit_amount: params.amountTotal,
          product_data: { name: params.productTitle },
        },
      },
    ],
    payment_intent_data: params.creatorStripeAccountId
      ? {
          application_fee_amount: params.ownerTake,
          transfer_data: { destination: params.creatorStripeAccountId },
        }
      : undefined, // if creator not yet connected, all funds stay with platform
    metadata: { orderId: params.orderId },
  });

  return { url: session.url, demo: false };
}

/** Create a Stripe Connect onboarding link for a creator to receive payouts. */
export async function createConnectOnboarding(opts: {
  existingAccountId: string | null;
  email: string;
  refreshUrl: string;
  returnUrl: string;
}): Promise<{ accountId: string; url: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  let accountId = opts.existingAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: opts.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    accountId = account.id;
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: opts.refreshUrl,
    return_url: opts.returnUrl,
    type: "account_onboarding",
  });

  return { accountId, url: link.url };
}
