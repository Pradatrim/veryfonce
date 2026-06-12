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

export interface AccountStatus {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

/** Check whether a creator's connected account can receive money yet. */
export async function getAccountStatus(accountId: string): Promise<AccountStatus | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const a = await stripe.accounts.retrieve(accountId);
    return {
      chargesEnabled: Boolean(a.charges_enabled),
      payoutsEnabled: Boolean(a.payouts_enabled),
      detailsSubmitted: Boolean(a.details_submitted),
    };
  } catch {
    return null;
  }
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

  // Only split to the creator when (a) they have a connected account, (b) it's
  // finished onboarding and can receive money, and (c) there's an actual payout
  // to send. Otherwise the payment still succeeds with all funds held by the
  // platform (owner), and the creator can be paid out once they're set up.
  let splitToCreator = false;
  if (params.creatorStripeAccountId && params.ownerTake < params.amountTotal) {
    const status = await getAccountStatus(params.creatorStripeAccountId);
    splitToCreator = Boolean(status?.chargesEnabled && status?.payoutsEnabled);
  }

  // Destination charge: the platform is merchant of record, takes the
  // application fee (owner's take), and the rest is transferred to the creator.
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
    payment_intent_data: splitToCreator
      ? {
          application_fee_amount: params.ownerTake,
          transfer_data: { destination: params.creatorStripeAccountId! },
        }
      : undefined,
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
