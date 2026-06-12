# Deploying FONCÉ to Vercel (step by step)

This gets your app live on a real URL. No coding required — just clicking and
pasting. Takes about 15 minutes. Everything stays in **demo mode** (no real
money, no real supplier orders) until you add Stripe and AliExpress later, so
it's safe to deploy now and just see it working.

You'll set up 3 things: **a database**, **photo storage**, and **the deploy
itself**. Do them in this order.

---

## Step 1 — Push your code to GitHub
Your code is already committed on this branch. Make sure it's on GitHub (this
repo: `Pradatrim/veryfonce`). If you opened a pull request, you can deploy from
the branch directly.

---

## Step 2 — Create a free Postgres database (Neon)
This is where products, creators, orders, and income are stored.

1. Go to **https://neon.tech** and sign up (free).
2. Click **Create project** (any name, e.g. "fonce"). Pick a region near you.
3. After it's created, find **Connection string** on the dashboard.
4. Copy it. It looks like:
   `postgresql://user:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require`
5. **Keep this tab open** — you'll paste this in Step 4.

---

## Step 3 — Deploy on Vercel
1. Go to **https://vercel.com** and sign up with your **GitHub** account.
2. Click **Add New… → Project**.
3. Find **veryfonce** in the list and click **Import**.
4. Before clicking Deploy, open the **Environment Variables** section and add
   these (Name → Value). Copy them exactly:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | *(paste your Neon connection string from Step 2)* |
   | `AUTH_SECRET` | *(any long random text, e.g. mash your keyboard 40+ chars)* |
   | `ADMIN_EMAIL` | *(your email — this becomes the OWNER login)* |
   | `ADMIN_PASSWORD` | *(a strong password you'll remember)* |
   | `PLATFORM_FEE_PERCENT` | `10` |
   | `NEXT_PUBLIC_APP_URL` | `https://veryfonce.vercel.app` *(adjust after you see your real URL)* |

5. Click **Deploy**. Wait ~2 minutes. The build automatically creates all the
   database tables for you.

When it finishes you'll get a live URL like `https://veryfonce.vercel.app`.

---

## Step 4 — Turn on photo storage (so profile photos work in production)
1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Database → Blob** → **Create**. Accept the defaults.
3. Vercel automatically adds the `BLOB_READ_WRITE_TOKEN` variable for you.
4. Go to **Deployments → … (top deployment) → Redeploy** so it picks up the
   new storage. Done — photo uploads now save to the cloud.

*(If you skip this, everything else still works; only profile photos won't
persist.)*

---

## Step 5 — Log in and use it
- **Owner / income dashboard:** go to `your-url/login`, sign in with the
  `ADMIN_EMAIL` + `ADMIN_PASSWORD` you set. Your owner account is created
  automatically on that first login. You land on `/admin`.
- **Creators:** anyone can go to `your-url/signup` to make a storefront.
- Try it: sign up as a creator → **Import** a product (paste an AliExpress
  link) → set your price → open your storefront → **Buy now**. In demo mode the
  sale is recorded and shows up in your `/admin` income dashboard instantly.

---

## What's still "demo" until you do the next parts
- **Payments:** sales are recorded but no real money moves yet. Add Stripe keys
  (`STRIPE_SECRET_KEY`, etc.) in Vercel → Settings → Environment Variables to go
  live. See the README.
- **Supplier auto-ordering:** orders are marked "ordered" with a demo ID. Real
  AliExpress ordering switches on once your Dropship API app is approved and the
  `ALIEXPRESS_*` keys are added.

---

## Updating your custom domain (fonce.app / fonceee.vercel.app)
In Vercel → your project → **Settings → Domains**, add your domain and follow
the DNS instructions. Then update `NEXT_PUBLIC_APP_URL` to match and redeploy.

## Troubleshooting
- **Build failed mentioning the database?** Your `DATABASE_URL` is missing or
  wrong — re-check Step 2/3, fix the variable, and redeploy.
- **Profile photo doesn't stick?** You skipped Step 4 (Blob storage).
- **Can't log in as owner?** Make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are
  set in Vercel and you're typing them exactly.
