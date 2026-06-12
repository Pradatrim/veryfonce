# Turning on real payments (Stripe)

This switches FONCÉ from demo mode to **real money**. When a customer buys:

- They pay the full price on a secure Stripe checkout page.
- **You (the owner) automatically keep** the supplier cost + your platform fee.
- The creator automatically receives their markup in their own bank account.

Stripe does the split for you using **Stripe Connect**. The code is already
wired — you just create the account and paste a couple of keys.

> Do everything in **Test mode** first (fake money, test cards). Flip to Live
> mode only when you're ready to take real payments. The steps are identical.

---

## Step 1 — Create your Stripe account
1. Go to **https://stripe.com** and sign up.
2. You'll land in the **Dashboard**. Top-right, make sure the **Test mode**
   toggle is ON while you set things up.

## Step 2 — Enable Connect (the marketplace feature)
1. In the Stripe Dashboard search bar, type **Connect** and open it.
2. Click **Get started / Enable Connect**. Choose **Platform or marketplace**
   when asked what you're building. (This is what lets you pay creators and take
   a fee.)

## Step 3 — Get your secret key
1. In the Dashboard, go to **Developers → API keys**.
2. Copy the **Secret key** (starts with `sk_test_…` in test mode).

## Step 4 — Add the key to Vercel
1. In your Vercel project: **Settings → Environment Variables**.
2. Add:

   | Name | Value |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | *(paste your `sk_test_…` key)* |

3. Don't redeploy yet — do Step 5 first so you can add the webhook secret in the
   same go.

## Step 5 — Set up the webhook (so paid orders auto-fulfill)
Stripe needs to tell your app when a payment succeeds.

1. In Stripe: **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL:** `https://YOUR-VERCEL-URL/api/webhooks/stripe`
   (use your real Vercel URL).
3. **Events to send:** click *Select events*, search and add
   **`checkout.session.completed`**. Add the endpoint.
4. On the new endpoint's page, click **Reveal** under *Signing secret* and copy
   it (starts with `whsec_…`).
5. Back in Vercel → Environment Variables, add:

   | Name | Value |
   | --- | --- |
   | `STRIPE_WEBHOOK_SECRET` | *(paste your `whsec_…` secret)* |

6. Now **Redeploy** (Deployments → … → Redeploy) so both keys take effect.

## Step 6 — Creators connect their payout account
Each creator does this once, from their dashboard:
1. Log in → **Payouts** tab → **Connect payouts**.
2. Stripe walks them through a short form (bank details). In test mode you can
   use Stripe's fake values — it auto-fills a **[Skip]** / test option.
3. When done, their tab shows **✓ connected** and they'll be paid automatically.

> Until a creator finishes this, their sales still go through — their share is
> just held by the platform and can be paid out once they connect.

## Step 7 — Test a real (test-mode) purchase
1. Open a creator storefront → a product → **Buy now**.
2. On the Stripe page, use the test card:
   **`4242 4242 4242 4242`**, any future expiry, any CVC, any ZIP.
3. After paying you're sent to the order confirmation. The order auto-fulfills
   (simulated supplier order) and appears in your **/admin** income dashboard
   with your fee counted.

---

## Going live (real money)
1. In Stripe, complete **business verification / activate your account**
   (Settings → Account). Stripe needs your real business + bank details.
2. Switch the Dashboard to **Live mode** and repeat **Steps 3–6** with the
   **live** keys (`sk_live_…`) and a **live** webhook endpoint + secret.
3. Update those two variables in Vercel and redeploy.

That's it — you're taking real payments, your fee lands in your Stripe balance
on every sale, and creators get paid automatically.

## Notes
- You don't need `STRIPE_PUBLISHABLE_KEY` — FONCÉ uses Stripe's hosted checkout
  page, so the secret key + webhook secret are all that's required.
- Payouts to your bank follow your Stripe payout schedule (default: daily/2-day
  rolling). Set it under **Settings → Payouts**.
