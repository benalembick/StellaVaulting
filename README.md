# Stella Vaulting Academy — Website

A modern, premium website for Stella Vaulting Academy — an elite equestrian vaulting club in Western Australia.

**Stack:** React + Vite · Tailwind CSS · Supabase (auth, database, storage) · Stripe (payments)

---

## Features

- **Public website** — Home, About, Team, Events, Sponsorship, Fundraising, Stella Gallery, Community Gallery
- **Donation shop** — Add fundraising items to cart, checkout via Stripe
- **Community Gallery** — Watermarked previews with high-res purchase via Stripe
- **Admin CMS** — Secure admin area to manage all content without code changes
- **Content management** — Pages, sections, posts, team members, events, galleries, orders, sponsorship
- **Responsive** — Mobile-first design, hamburger menu, cart drawer
- **Brand design** — Black/gold/pink premium equestrian aesthetic

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_SITE_URL=http://localhost:5173
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Supabase Setup

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon key** from **Settings → API** into `.env`

### Run Database Migrations

In the Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Paste the contents of supabase/migrations/001_initial_schema.sql
```

### Run Seed Data

After migrations, run the seed data:

```sql
-- Paste the contents of supabase/seed.sql
```

### Create Storage Buckets

In the Supabase dashboard, go to **Storage** and create these buckets:

| Bucket name | Public |
|---|---|
| `images` | ✅ Public |
| `gallery` | ✅ Public |
| `community-gallery` | ❌ Private (high-res photos) |

Add a storage policy for the `images` and `gallery` buckets:
- Allow public read: `bucket_id = 'images'`
- Allow authenticated uploads: `bucket_id = 'images' AND auth.role() = 'authenticated'`

### Create the First Admin User

1. In Supabase dashboard → **Authentication → Users**, create a new user with email and password
2. Copy the user's UUID
3. In **SQL Editor**, run:

```sql
INSERT INTO admin_users (user_id, email)
VALUES ('paste-user-uuid-here', 'admin@stellavaulting.com.au');
```

4. Sign in at `/admin/login` with those credentials

### Manage Admin Users (Invite/Remove)

Additional admins can be invited and removed from **Admin → Admin Users** in the dashboard. This requires deploying the `admin-users` Edge Function, which uses the service role key server-side (never exposed to the browser):

```bash
supabase login
supabase link --project-ref your-project-ref
supabase secrets set SITE_URL=https://your-production-url.com
supabase functions deploy admin-users
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by Supabase for Edge Functions — you only need to set `SITE_URL` so invite emails link to the right place.

---

## Stripe Setup

### Test Mode

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Copy your **Publishable Key** (starts with `pk_test_`) into `.env`

> **Note:** The Stripe checkout in this app uses `redirectToCheckout` with `price_data` (dynamic pricing), which requires Stripe to be in **test mode** or your account to have this feature enabled.
>
> For production, you should set up a backend (Edge Function or server) to create Checkout Sessions securely, as client-side secret keys must never be exposed.

### Stripe Webhook (Production)

For production, set up a webhook to confirm payment and update order status:

1. In Stripe → **Developers → Webhooks**, add endpoint: `https://your-domain.com/api/stripe-webhook`
2. Listen for `checkout.session.completed`
3. Update the corresponding order status to `paid` in Supabase

---

## Admin CMS Guide

Access the admin panel at `/admin/login`.

### Admin Sections

| Section | What you can do |
|---|---|
| **Dashboard** | Overview stats and quick links |
| **Pages** | Create pages with modular sections (hero, text, image+text, CTA, countdown) |
| **Posts & Pinned** | Create news posts; pin them to the homepage |
| **Team Members** | Add/edit athlete and coach profiles with photos |
| **Events** | Add events with countdown timer and fundraising targets |
| **Fundraising** | Manage donation products in the shop |
| **Stella Gallery** | Upload and organise academy photos into albums |
| **Community Gallery** | Upload community event photos for purchase |
| **Orders** | View donation and photo purchase orders |
| **Sponsorship** | Manage sponsorship packages and opportunities |

### Page Section Types

When editing a page, you can add these modular sections:

- **Hero Banner** — Full-width hero with background image, title, subtitle, and CTA button
- **Text Block** — Heading and body text
- **Image + Text** — Side-by-side image and text (image left or right)
- **Call to Action** — Highlighted panel with title, body, and button
- **Event Countdown** — Live countdown timer to a specified event

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Netlify

```bash
npm run build
```

Deploy the `dist/` folder to Netlify. Add environment variables in **Site Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
```

Serve the `dist/` directory with any static web server (nginx, Apache, Caddy).

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # AdminLayout sidebar
│   ├── CartDrawer.jsx  # Shopping cart slide-out
│   ├── CountdownTimer.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── ImageUpload.jsx # Drag & drop image uploader
│   ├── Logo.jsx
│   ├── PageRenderer.jsx # Dynamic CMS section renderer
│   ├── ProtectedRoute.jsx
│   └── SectionHeading.jsx
├── context/
│   ├── AuthContext.jsx  # Supabase auth + admin check
│   └── CartContext.jsx  # Shopping cart state
├── lib/
│   ├── supabase.js
│   └── stripe.js
├── pages/
│   ├── admin/          # All admin CMS pages
│   ├── AboutPage.jsx
│   ├── CheckoutPage.jsx
│   ├── CheckoutSuccessPage.jsx
│   ├── CommunityGalleryPage.jsx
│   ├── EventsPage.jsx
│   ├── FundraisingPage.jsx
│   ├── HomePage.jsx
│   ├── PostPage.jsx
│   ├── SponsorshipPage.jsx
│   ├── StellaGalleryPage.jsx
│   └── TeamPage.jsx
├── App.jsx
├── index.css
└── main.jsx
supabase/
├── migrations/
│   └── 001_initial_schema.sql
└── seed.sql
```

---

## Brand Colours

| Colour | Hex | Usage |
|---|---|---|
| Black | `#1F1D1D` | Backgrounds |
| Gold | `#B08D3C` | Accents, borders, buttons |
| Pink | `#C2ADB8` | Highlights, panels |
| Off-white | `#FAF8F6` | Text |

---

## Notes

- All content is managed through Supabase — no hard-coded text in components (except fallback defaults on About page)
- Cart persists in localStorage across page loads
- Community gallery previews show a visible watermark overlay — high-res files are stored in a private bucket
- Admin authentication uses Supabase Auth + a separate `admin_users` table for role checking
- Row-level security (RLS) is enabled on all tables — public can only read published content; admins have full access
