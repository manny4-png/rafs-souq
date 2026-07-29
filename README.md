# Raf's Souq — Luxury E-Commerce

> *"Elegance Woven Into Every Thread"*

A premium luxury e-commerce website for turbans and modest fashion, built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Cloudflare Workers Deployment

The Next.js storefront is configured for Cloudflare Workers with OpenNext. The
Django API, PostgreSQL database, and Redis cache remain on Render.

In Cloudflare Workers Builds, set this build variable before deploying:

```text
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-API-DOMAIN/api
```

Use the following commands locally:

```bash
# Build and preview in the Cloudflare workerd runtime
npm run preview

# Build and deploy to Cloudflare Workers
npm run deploy
```

The production storefront URL must also be added to the Render environment
variables `DJANGO_CORS_ALLOWED_ORIGINS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, and
`FRONTEND_SITE_URL`. Set `PAYSTACK_CALLBACK_URL` to the storefront URL followed
by `/payment/callback`.

---

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (fonts, metadata, navbar, cart)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles & design tokens
│   ├── shop/page.tsx           # Shop with filter/sort/search
│   ├── product/[id]/page.tsx   # Product detail page
│   ├── collections/page.tsx    # Collections grid
│   ├── about/page.tsx          # Brand story
│   ├── contact/page.tsx        # Contact form
│   ├── checkout/page.tsx       # Multi-step checkout
│   ├── wishlist/page.tsx       # Wishlist
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Sticky navbar with scroll effect + mobile menu
│   │   ├── CartDrawer.tsx      # Slide-out cart with animations
│   │   └── Footer.tsx          # Premium footer
│   ├── sections/
│   │   ├── Hero.tsx            # Full-screen hero with canvas turban animation
│   │   ├── Marquee.tsx         # Infinite ticker
│   │   ├── CollectionsGrid.tsx # Editorial collections layout
│   │   ├── BestSellers.tsx     # Filterable product grid
│   │   ├── BrandStory.tsx      # Brand philosophy + stats
│   │   ├── Reviews.tsx         # Testimonials (grid + mobile slider)
│   │   ├── InstagramShowcase.tsx # Masonry photo grid
│   │   └── Newsletter.tsx      # Email signup
│   └── ui/
│       ├── ProductCard.tsx     # Product card with hover effects
│       └── Toast.tsx           # Global toast notification system
│
├── hooks/
│   └── useReveal.ts            # Intersection Observer scroll reveal
│
├── lib/
│   ├── data.ts                 # All product, collection & review data
│   ├── store.ts                # Zustand cart + wishlist state
│   └── utils.ts                # Utility functions
│
└── types/
    └── index.ts                # TypeScript types
```

---

## 🎨 Brand Design System

| Token | Value |
|-------|-------|
| Cream | `#F8F4EE` |
| Sand Beige | `#D8C3A5` |
| Warm Gold | `#C9A227` |
| Charcoal Black | `#1A1A1A` |
| Soft White | `#FFFFFF` |

**Fonts:**
- Headings: `Playfair Display` (serif)
- Body: `Inter` (sans-serif)
- Accent: `Cormorant Garamond` (serif italic)

---

## ✨ Features

### Pages
- **Homepage** — Hero, marquee, collections, bestsellers, brand story, reviews, Instagram, newsletter
- **Shop** — Filtering by category, price, badge; sorting; search
- **Product Detail** — Image gallery, colour/size selectors, add to cart, reviews accordion, related products
- **Collections** — Editorial grid layout
- **Cart** — Slide-out drawer with quantity controls, persistent state
- **Checkout** — 4-step: Bag → Delivery → Payment → Confirm
- **Wishlist** — Persistent saved items
- **About** — Brand story editorial
- **Contact** — Contact form with validation

### Technical
- **Next.js 15** App Router with TypeScript
- **Framer Motion** — page transitions, reveal animations, cart drawer
- **Canvas API** — animated hero turban illustration + fabric wave background
- **Zustand** — persistent cart & wishlist (localStorage)
- **Scroll reveal** — IntersectionObserver-based fade-up animations
- **Responsive** — mobile-first, fully responsive
- **Accessible** — ARIA labels, keyboard navigation, focus styles
- **SEO** — metadata, Open Graph, semantic HTML

---

## 🛍️ Adding Real Products

Edit `src/lib/data.ts` to update the `PRODUCTS` array with real data and Unsplash/CDN image URLs.

## 💳 Payment Integration

Replace the payment step in `src/app/checkout/page.tsx` with Stripe Elements or your preferred payment provider.

## 📦 CMS Integration

The `PRODUCTS`, `COLLECTIONS`, and `REVIEWS` arrays in `src/lib/data.ts` can be replaced with API calls to Sanity, Contentful, Shopify, or any headless CMS.

---

## 📄 License

Built for Raf's Souq. All rights reserved.
