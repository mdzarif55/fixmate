# FixMate — Smart Device & Home Appliance Repair Service Platform

> **"Repair smarter. Track every step. Pay when it's done."**

FixMate is a full-stack on-demand device and home appliance repair marketplace built with Next.js App Router, Express.js, MongoDB, BetterAuth (JWT + session persistence), Stripe Checkout + Webhooks, ImgBB image uploads, Recharts analytics, and complete Dark Mode & Light Mode support.

---

## Live URLs & Repositories

- **Live Web App (Vercel):** https://fixmate-sable-eta.vercel.app
- **Live API Server (Vercel):** https://fixmate-server-silk-pi.vercel.app
- **Frontend Repository:** https://github.com/mdzarif55/fixmate/tree/main/client
- **Backend / Monorepo Repository:** https://github.com/mdzarif55/fixmate

---

## Key Features

### Customer
- Browse approved & available repair services across 7 categories (`Smartphone`, `Laptop & PC`, `AC`, `Refrigerator`, `TV`, `Washing Machine`, `Electrical`)
- Server-side search, category filter, service mode filter (`Home Visit` / `Shop Drop-off`), price/newest sorting, and MongoDB `skip()`/`limit()` pagination with persistent URL query parameters
- Submit repair requests with validation, duplicate active booking prevention, and customer-only enforcement
- Track job progress timeline (`Requested → Accepted → In Progress → Completed → Paid`)
- Cancel bookings while in `requested` status
- Pay securely online via Stripe Checkout **only after** the job is marked `completed`
- Download PDF invoices and leave 1–5 star verified reviews for paid bookings

### Technician
- Register as a technician and manage a personal workspace
- Upload service images via ImgBB (`POST /api/services`), toggle public availability, edit or delete services (edits reset `approvalStatus` to `pending`)
- Free plan (up to 3 services) and Pro Technician Plan (unlimited services + Verified Pro badge)
- Manage repair requests and enforce status progression (`Accept / Reject → Start Work → Mark Completed` with final repair amount > 0)

### Admin
- Platform overview with real-time statistics and Recharts visualizations
- Manage users and update user roles (cannot change own admin role)
- Review, approve, or reject technician service submissions (pending prioritized)
- Monitor all platform bookings and verified Stripe transactions + total revenue

### Design & Theme System
- Complete **Light Mode**, **Dark Mode**, and **System** theme switching via `next-themes` with zero hydration mismatch and reload persistence
- Responsive mobile-first layouts across public pages, auth pages, and collapsible role dashboards

---

## Technology Stack

### Frontend (`client/`)
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + CSS variables + Radix UI primitives (shadcn/ui style)
- **Icons & Charts:** Lucide React, Recharts
- **Forms & Validation:** React Hook Form, Zod, `@hookform/resolvers`
- **Notifications & Theme:** Sonner, `next-themes`
- **PDF Invoices:** `jspdf`

### Backend (`server/`)
- **Runtime & Framework:** Node.js + Express.js + TypeScript (ESM)
- **Database:** MongoDB (official `mongodb` driver, Atlas compatible)
- **Authentication:** BetterAuth (`@better-auth/mongo-adapter`, `jwt()` plugin, `jose` JWKS verification)
- **Payments:** Stripe Checkout + Stripe Webhooks (`stripe`)
- **Validation & Security:** Zod, Helmet, CORS

---

## Architecture & Database Design

### Authentication & JWT Flow
1. BetterAuth is mounted on Express at `/api/auth/*` using `@better-auth/mongo-adapter` and `jwt()`.
2. Next.js exposes a first-party proxy route at `client/app/api/auth/[...all]/route.ts` forwarding cookies and headers cleanly so session cookies remain first-party across Vercel and Render deployments.
3. On signup, `databaseHooks.user.create.before` strictly permits `customer` and `technician` roles only and blocks `admin` registration.
4. Protected frontend API calls fetch a signed JWT via `authClient.token()` (`/api/auth/token`) and attach `Authorization: Bearer <token>`.
5. Express `verifyToken` middleware verifies the JWT signature, issuer, and audience against BetterAuth's JWKS using `jose`, then loads the live user record from MongoDB `users` so role changes take effect immediately.

### Exactly Four Business Collections
1. `users` (shared with BetterAuth `user.modelName: "users"`)
2. `services`
3. `bookings` (with embedded `statusHistory` and `review`)
4. `payments` (unique indexes on `stripeSessionId` and `bookingId`)

*(BetterAuth internal collections `session`, `account`, `verification`, and `jwks` are managed automatically by BetterAuth.)*

---

## Folder Structure

```text
FIXMATE/
├── client/
│   ├── app/
│   │   ├── (auth)/             # /sign-in, /sign-up
│   │   ├── (public)/           # /, /about, /services, /services/[id]
│   │   ├── api/auth/[...all]/  # First-party BetterAuth proxy
│   │   ├── dashboard/          # /customer/*, /technician/*, /admin/*, /profile
│   │   └── payment/            # /payment/success, /payment/cancel
│   ├── components/
│   │   ├── booking/            # RepairRequestForm, BookingTimeline, ReviewModal
│   │   ├── dashboard/          # StatCard, AdminCharts
│   │   ├── home/               # Hero, FeaturedServices, Categories, HowItWorks, WhyChoose, Testimonials, CTA
│   │   ├── layout/             # Navbar, Footer, DashboardShell
│   │   ├── services/           # ServiceCard, ServicesBrowser, ServiceDetailsView
│   │   ├── shared/             # ThemeToggle, StatusBadge, ConfirmModal, ImageUploadField, etc.
│   │   └── ui/                 # Reusable UI primitives
│   ├── hooks/
│   ├── lib/
│   ├── providers/
│   └── types/
└── server/
    └── src/
        ├── config/             # env.ts, auth.ts, stripe.ts
        ├── controllers/
        ├── database/           # mongo.ts, seed.ts
        ├── middleware/         # auth.middleware.ts, validate.middleware.ts, error.middleware.ts
        ├── routes/
        ├── services/
        ├── tests/              # Vitest + Supertest + MongoMemoryServer integration tests
        ├── types/
        ├── utils/
        ├── validators/
        ├── webhooks/           # stripe.webhook.ts (raw body verification)
        ├── app.ts
        └── server.ts
```

---

## Local Setup & Installation

### 1. Prerequisites
- Node.js 20+ and npm 10+
- MongoDB Atlas cluster (or local MongoDB instance)
- Stripe account (Test Mode keys)
- ImgBB account API key

### 2. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` in both folders and fill in real credentials (**never commit `.env` or `.env.local`**):

#### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/fixmate?retryWrites=true&w=majority
JWT_SECRET=your-64-char-secret
BETTER_AUTH_SECRET=your-64-char-secret
BETTER_AUTH_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
IMGBB_API_KEY=your-imgbb-api-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

#### `client/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
BACKEND_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key
```

---

## External Services Setup

### MongoDB Atlas
1. Create a free M0 cluster in MongoDB Atlas and create a database user.
2. Allow network access (or your hosting provider's outbound IPs / `0.0.0.0/0` for Render).
3. Copy the SRV connection string into `server/.env` as `MONGODB_URI` (including database name `/fixmate`).

### BetterAuth & Optional Google OAuth
- Generate strong 32+ character secrets for `BETTER_AUTH_SECRET` and `JWT_SECRET`.
- Set `BETTER_AUTH_URL` to your frontend origin (`http://localhost:3000` in dev, `https://your-app.vercel.app` in production).
- For optional Google login, add an OAuth redirect URI: `<BETTER_AUTH_URL>/api/auth/callback/google`.

### ImgBB Setup
1. Sign in at `https://api.imgbb.com/` and generate an API key.
2. Add the key to `client/.env.local` (`NEXT_PUBLIC_IMGBB_API_KEY`) and `server/.env` (`IMGBB_API_KEY`).

### Stripe Checkout & Webhook Setup
1. Switch Stripe Dashboard to **Test Mode** and copy your Secret Key (`sk_test_...`) to `server/.env` as `STRIPE_SECRET_KEY`.
2. **Local Webhook Testing (Stripe CLI):**
   ```bash
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
   Copy the generated `whsec_...` secret into `server/.env` as `STRIPE_WEBHOOK_SECRET`.
3. **Production Webhook (Stripe Dashboard):**
   - Go to **Developers → Webhooks → Add endpoint**.
   - URL: `https://<your-backend-domain>/api/webhooks/stripe`
   - Events to listen for: `checkout.session.completed`, `checkout.session.async_payment_succeeded`.
   - Copy the Signing Secret to `STRIPE_WEBHOOK_SECRET` on Render.
4. **Stripe Test Card:** `4242 4242 4242 4242`, any future expiry, any 3-digit CVC.

---

## Seeding Demo Data & Running Locally

### Seed the Database
```bash
cd server
npm run seed
```
This idempotently creates an Admin account, 3 Technicians (2 Pro, 1 Free), 1 Customer, 14 Services across all 7 categories (13 approved, 1 pending), sample bookings across pipeline stages, and a sample verified Stripe payment record.

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@fixmate.app` | `Admin@1234` |
| **Technician (Pro)** | `tech1@fixmate.app` | `Tech@1234` |
| **Technician (Pro)** | `tech2@fixmate.app` | `Tech@1234` |
| **Technician (Free)** | `tech3@fixmate.app` | `Tech@1234` |
| **Customer** | `customer@fixmate.app` | `Customer@1234` |

### Run Development Servers
```bash
# Terminal 1 (Backend on :5000)
cd server
npm run dev

# Terminal 2 (Frontend on :3000)
cd client
npm run dev
```

### Run Backend Integration Tests
```bash
cd server
npm test
```

---

## REST API Endpoints

### Public
- `GET /api/health` — API health check
- `GET /api/services` — Server-side search, category/mode filters, sort, and skip/limit pagination (`approved` & `isAvailable` only)
- `GET /api/services/:id` — Service details, technician profile, and paid booking reviews

### Customer (`verifyToken` + `verifyCustomer`)
- `POST /api/bookings` — Create repair request (prevents duplicate active requests)
- `GET /api/bookings/my` — Customer bookings & dashboard stats
- `PATCH /api/bookings/:id/cancel` — Cancel `requested` booking
- `POST /api/bookings/:id/review` — Submit 1–5 star review on completed & paid booking
- `POST /api/payments/create-checkout-session` — Create Stripe Checkout session from DB `finalAmount`
- `GET /api/payments/verify-session?session_id=...` — Server-side session verification & idempotent payment recording
- `GET /api/payments/my` — Customer payment history

### Technician (`verifyToken` + `verifyTechnician`)
- `POST /api/services` — Create service (`pending` approval, Free plan 3-service cap)
- `GET /api/services/technician/my` — Technician's own services & stats
- `PATCH /api/services/:id` — Update own service (resets `approvalStatus` to `pending` on detail edits) or toggle `isAvailable`
- `DELETE /api/services/:id` — Delete own service
- `GET /api/bookings/technician` — Technician's assigned requests
- `PATCH /api/bookings/:id/status` — Enforce job pipeline (`accepted`, `rejected`, `in-progress`, `completed` + `finalAmount > 0`)
- `POST /api/users/pro-upgrade` — Activate Pro Technician Plan

### Admin (`verifyToken` + `verifyAdmin`)
- `GET /api/admin/overview` — Platform totals & Recharts datasets
- `GET /api/admin/users` — List all users
- `PATCH /api/admin/users/:id/role` — Update user role (self-role change blocked)
- `GET /api/admin/services` — List all services (pending prioritized)
- `PATCH /api/admin/services/:id/approval` — Approve or reject service
- `GET /api/admin/bookings` — Monitor all bookings
- `GET /api/admin/payments` — Monitor all transactions & total revenue

### Shared (`verifyToken`)
- `GET /api/users/me` — Authenticated user profile
- `PATCH /api/users/profile` — Update name, phone, area, bio, and profile photo

### Webhooks
- `POST /api/webhooks/stripe` — Raw-body Stripe signature verification & idempotent payment completion

---

## Deployment Guide

### Backend on Render
1. Create a Web Service pointing to `server/` (or use `server/render.yaml`).
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Set all production environment variables (`MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL=https://your-app.vercel.app`, `CLIENT_URL=https://your-app.vercel.app`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `IMGBB_API_KEY`).

### Frontend on Vercel
1. Import the project in Vercel and set Root Directory to `client`.
2. Set `NEXT_PUBLIC_API_URL`, `BACKEND_API_URL`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_IMGBB_API_KEY`.
3. Deploy and verify reload persistence, Stripe Checkout redirect, and Dark/Light themes.

---

## Key Packages Used
- **Client:** `next`, `react`, `tailwindcss`, `next-themes`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `sonner`, `recharts`, `better-auth`, `jspdf`, `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Server:** `express`, `mongodb`, `better-auth`, `@better-auth/mongo-adapter`, `jose`, `stripe`, `zod`, `cors`, `helmet`, `dotenv`, `tsx`, `vitest`, `supertest`, `mongodb-memory-server`
