# FONCÉ

Link-in-bio **dropshipping storefronts for creators**. A creator pastes a
product link, sets their price, and FONCÉ builds their storefront. When a
customer buys, the order is placed with the supplier automatically — the
owner collects a platform fee on every sale.

## What's built

| Feature | Status |
| --- | --- |
| Creator signup/login + link-in-bio storefront at `/<username>` | ✅ |
| **Import a product from an AliExpress link** (auto-fills title, images, price, variants) | ✅ |
| **Locked original price** — creators set their markup but can never edit the supplier cost | ✅ enforced server-side |
| **Multiple variants** imported; creator edits name/price/stock/visibility per variant | ✅ |
| Customer checkout from the storefront | ✅ |
| **Money split** — supplier cost reserved, owner takes platform fee, creator gets the rest | ✅ |
| **Automatic order placement** with the supplier on successful payment | ✅ (simulated until AliExpress API keys are added) |
| **Owner/VIP admin** at `/admin` — all income, fees collected, analytics, per-creator leaderboard | ✅ |
| **Profile photo upload** | ✅ |
| Stripe Connect payout splitting | ✅ scaffolded (demo mode until keys added) |

The app runs in **demo mode** with zero external accounts so you can click
through the entire flow today. Real money and real supplier ordering switch on
when you add credentials (see below).

## Deploying live

See **[DEPLOY.md](./DEPLOY.md)** for click-by-click Vercel instructions
(database + photo storage + deploy, ~15 min, no coding).

## Run it locally

```bash
cp .env.example .env        # then paste a free Postgres URL into DATABASE_URL
                            # (get one at neon.tech — see DEPLOY.md Step 2)
npm install
npm run db:push             # create the database tables
npm run db:seed             # create the owner + a demo creator
npm run dev                 # http://localhost:3000
```

Seeded logins (change these in `.env`):

- **Owner / admin:** `owner@fonce.app` / `changeme123` → `/admin`
- **Demo creator:** `creator@demo.app` / `demo1234` → `/dashboard`, storefront `/demo`

### Try the full flow
1. Log in as the demo creator → **Import** tab → paste any AliExpress item URL.
2. See the variants and locked supplier cost; set your selling price.
3. Open your storefront `/demo`, pick a variant, and "Buy now".
4. In demo mode the order is instantly marked paid and auto-placed with the
   supplier. Check the **Orders** tab and the **/admin** income dashboard.

## Going live (what to add)

These are the only real-world integrations needed. Each has its hook ready:

1. **Database** — already Postgres. Set `DATABASE_URL`; tables are created
   automatically on deploy (`prisma migrate deploy` runs in the build).
2. **Payments (Stripe Connect)** — add `STRIPE_SECRET_KEY`,
   `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. Checkout becomes real and
   the fee split happens automatically. Point Stripe's `checkout.session.completed`
   webhook at `/api/webhooks/stripe`.
3. **AliExpress auto-ordering** — once your AliExpress Dropship API app is
   approved, add `ALIEXPRESS_APP_KEY` / `ALIEXPRESS_APP_SECRET` and implement
   the signed order call in `src/lib/fulfillment/aliexpress.ts` (`placeLiveOrder`).
   Live order parsing for imports lives in `src/lib/import/aliexpress.ts`.
4. **Profile photo storage** — local disk works in dev. On Vercel (read-only
   filesystem) swap `saveUpload()` in `src/app/api/profile/route.ts` for Vercel
   Blob / S3 / Supabase Storage.

## Architecture

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Prisma** ORM (SQLite locally, Postgres in prod)
- Money math in integer cents — `src/lib/money.ts` holds the fee-split rule
- Pricing lock enforced in `src/app/api/products/[id]/route.ts`
- Pluggable supplier import (`src/lib/import`) and fulfillment (`src/lib/fulfillment`)
