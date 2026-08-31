# W3BB Shop

A storefront for handmade dream catchers, tie-dye, and DIY craft kits.
Browse, add to cart, and check out with either a card (via Stripe) or
Square — no account needed to shop. A small admin area lets you manage
products and see orders.

Built with React + TypeScript + Vite + Tailwind, backed by Supabase
(database, auth, storage, and the checkout/webhook logic), deployed as a
static site on Cloudflare Workers.

## Getting set up

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run [`docs/schema_v1_shop.sql`](docs/schema_v1_shop.sql) — creates the `products` and `orders` tables, the `product-images` storage bucket, and the admin-access setup.
3. Project Settings → API — copy the **Project URL** and **anon/public key** into a `.env` file (copy `.env.example` to `.env` first).
4. Once you've signed up for an admin account in the app (see "Becoming an admin" below), add secrets for the edge functions: Project Settings → Edge Functions → Secrets (or `supabase secrets set NAME=value` from the CLI):
   - `STRIPE_SECRET_KEY` — from your Stripe Dashboard (Developers → API keys)
   - `STRIPE_WEBHOOK_SECRET` — see "Stripe setup" below
   - `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` — from your Square Developer Dashboard
   - `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL` — see "Square setup" below
   - `SQUARE_ENVIRONMENT` — `sandbox` while testing, `production` once you're ready to take real payments
   - `SITE_URL` — your live site URL, e.g. `https://w3bb.shop` (used to build the checkout redirect links)
5. Deploy the edge functions:
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy stripe-webhook
   supabase functions deploy square-webhook
   ```

### 2. Becoming an admin

The admin area (`/admin`) is gated by the `admin_users` table — nobody
gets in just by signing up.

1. Run the app (or the deployed site), go to `/admin/login`, and sign up with your email and a password.
2. In the Supabase Dashboard → Authentication → Users, find your new account and copy its **User UID**.
3. In the SQL Editor, run:
   ```sql
   insert into admin_users (user_id) values ('<paste the UID here>');
   ```
4. Sign in again at `/admin/login` — you're in. Repeat this for anyone else (like your mom) who needs to manage products.

### 3. Stripe setup

1. Get your **Secret key** from the Stripe Dashboard (Developers → API keys) and set it as the `STRIPE_SECRET_KEY` function secret.
2. Developers → Webhooks → Add endpoint. URL: `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`. Event to listen for: `checkout.session.completed`.
3. Copy the **Signing secret** Stripe gives you and set it as `STRIPE_WEBHOOK_SECRET`.
4. Start in Stripe's test mode (test API keys) and use Stripe's test card `4242 4242 4242 4242` to place a test order before switching to live keys.

### 4. Square setup

1. In the Square Developer Dashboard, create an application. Get your **Access token** and **Location ID** — set as `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID`.
2. Webhooks → Add endpoint. URL: `https://<your-project-ref>.supabase.co/functions/v1/square-webhook`. Event to listen for: `payment.updated`.
3. Set that exact same URL as the `SQUARE_WEBHOOK_URL` secret (Square signs against the exact URL it's registered with, so these two must match character-for-character).
4. Copy the **Signature key** Square gives the webhook and set it as `SQUARE_WEBHOOK_SIGNATURE_KEY`.
5. Start with `SQUARE_ENVIRONMENT=sandbox` and Square's sandbox test card before going live.

### 5. Run it locally

```bash
npm install
npm run dev
```

## Deploying to Cloudflare + connecting w3bb.shop

This deploys as a static site through **Cloudflare Workers** (the `[assets]` setup in `wrangler.toml` serves the built app and routes every URL through React Router).

1. Install Wrangler if you haven't: `npm install -g wrangler` (already a project dependency, so `npx wrangler` also works without installing it globally).
2. Log in once: `npx wrangler login` — opens a browser to authorize.
3. Set your build-time environment variables so Cloudflare bakes them into the build. Easiest way: create a `.env` file locally (from `.env.example`) with your real Supabase URL/anon key before running `npm run deploy` — Vite reads `.env` at build time automatically.
4. Deploy:
   ```bash
   npm run deploy
   ```
   This runs `npm run build` then `wrangler deploy`. The first time, Wrangler creates the Worker (named `w3bb-shop`, from `wrangler.toml`) and gives you a `*.workers.dev` URL to test with.

### Connecting your `w3bb.shop` domain

Where you bought the domain changes the first step slightly:

**If you bought `w3bb.shop` through Cloudflare Registrar** — it's already using Cloudflare's nameservers, skip to step 2.

**If you bought it somewhere else** (GoDaddy, Namecheap, Google Domains, etc.):
1. In the Cloudflare dashboard, **Add a site** → enter `w3bb.shop`. Cloudflare scans for existing DNS records and gives you two nameservers (something like `aaron.ns.cloudflare.com` / `beth.ns.cloudflare.com`).
2. Go to wherever you bought the domain, find its DNS/nameserver settings, and replace the existing nameservers with the two Cloudflare gave you. This can take anywhere from a few minutes to a few hours to take effect.

Once the domain is on Cloudflare (either way):
1. Cloudflare Dashboard → **Workers & Pages** → click your `w3bb-shop` worker → **Settings** → **Domains & Routes** → **Add** → **Custom Domain**.
2. Enter `w3bb.shop` (and optionally add `www.w3bb.shop` the same way if you want both to work).
3. Cloudflare handles the DNS record and SSL certificate automatically — usually live within a couple of minutes.

After that, redeploying is just `npm run deploy` any time you push a change — the domain keeps pointing at the same worker.

## Project structure

```
src/
  pages/              Shop, ProductDetail, Cart, checkout success/cancel
  pages/admin/         Admin login, Products, Orders
  components/          ProductCard, layout (StoreLayout, AdminLayout)
  contexts/            AuthContext (admin sign-in), CartContext (localStorage cart)
  hooks/               useProducts, useOrders, useIsAdmin
supabase/functions/
  create-checkout/     public: builds a Stripe Checkout Session or a Square Payment Link
  stripe-webhook/       public (signature-verified): marks an order paid, decrements stock
  square-webhook/       public (signature-verified): same, for Square
docs/
  schema_v1_shop.sql   products, orders, admin_users tables + storage bucket + RLS
```

## What's built (v1)

- Public storefront — product grid with category filters (Dream Catchers, Tie-Dye, DIY Kits), product detail pages, a cart that persists in the browser.
- Checkout — customer enters shipping info, picks Stripe or Square, gets redirected to that provider's own hosted payment page. No card details ever touch this app directly.
- Orders — created as soon as checkout starts (`pending`), marked `paid` only once the matching webhook confirms the payment actually cleared. Stock (for items that track it) decrements at that point, never before.
- Inventory — each product is either made-to-order (always available) or stock-tracked (shows "Sold out" at zero, decrements automatically per paid order).
- Admin area (`/admin`) — add/edit/delete products with photo uploads, toggle visibility, and a read-only Orders list. Gated to accounts manually added to `admin_users`.

## Ideas for later

- Order confirmation emails (would reuse the same email-sending pattern as Project Flow).
- Shipping cost / tax calculation at checkout (v1 charges exactly the items' subtotal).
- Product variants (size/color) if a listing ever needs more than one option — schema note: this would need a `product_variants` table, not a fit for the current single-listing-per-item model.
- An installable app (PWA) shell, same approach as Project Flow.
