# WaTrack — Personal KSEB Electricity Bill Manager

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-green)](https://orm.drizzle.team/)
[![Neon Database](https://img.shields.io/badge/Neon-Serverless_Postgres-00e599?logo=postgresql)](https://neon.tech/)
[![Vitest](https://img.shields.io/badge/Tested_with-Vitest-yellow?logo=vitest)](https://vitest.dev/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

A production-ready, owner-only personal electricity bill tracking web application designed specifically for **Kerala State Electricity Board (KSEB)** spot billing, bi-monthly domestic cycles, Time-of-Day (TOD) meter readings, and payment reconciliation.

---

## ⚡ Highlights & Features

### 1. Authentic KSEB Spot Notice Digital Twin
- Exact 1-to-1 digital representation of physical KSEB thermal spot bill receipts (as issued under *Reg-122 of Kerala Electricity Supply Code 2014*).
- Displays bilingual Malayalm/English labels: *ബിൽ നം, കൺസ്യൂമർ ഐഡി, പേര്, വിലാസം, എനർജി ചാർജ്, ഡ്യൂട്ടി, ഫ്യുവൽ സർചാർജ്, ഫിക്സഡ് ചാർജ്, മീറ്റർ വാടക, റൗണ്ട് ഓഫ്, അടയ്ക്കേണ്ട തുക*.
- Simulated barcode and printable thermal slip view.

### 2. Full KSEB Domestic Billing & Time-Of-Day (TOD) Support
- **13-digit Consumer Number** format (e.g., `1156241018150`).
- **Bi-Monthly Cycle Handling**: Accurate modeling of Kerala's 60-day billing intervals (e.g. August 17 to October 17).
- **Time-of-Day (TOD) Tariff breakdown**:
  - **Normal Zone**: 6:00 AM – 6:00 PM (`KWH-NL`)
  - **Peak Zone**: 6:00 PM – 10:00 PM (`KWH-PK`)
  - **Off-Peak Zone**: 10:00 PM – 6:00 AM (`KWH-OP`)
- Automatic units computation (`Current Reading - Previous Reading`) with custom override capability.
- Auto-calculation of 10% Kerala Electricity Duty, Fuel Surcharge, Fixed Charges, and Round-Off adjustments.

### 3. Payment Tracking & Partial Payments
- Complete settlement ledger tracking full payments, partial payments, and remaining balances.
- Automatic status machine: `UNPAID`, `PARTIALLY_PAID`, `PAID`, and `OVERDUE` (based on Asia/Kolkata current date vs penalty/due date).
- Multiple payment channels: KSEB Web Portal (`wss.kseb.in`), UPI (GPay/PhonePe), NetBanking, and Section Cash Counter.

### 4. Interactive Analytics & Normalized Monthly Consumption
- **Bi-Monthly Cycles vs. Normalized Monthly View**: Toggle between actual billing periods and mathematically normalized calendar months so consumption is not artificially grouped into single months.
- **TOD Consumption Pie Chart**: Visual breakdown of day, peak, and night usage.
- **Expenditure Area Chart**: Historical cost trends and effective cost per unit (`₹/kWh`).
- **Year-over-Year (YoY) Growth**: Side-by-side comparison of 2025 vs. 2026 total units and expenditure.

### 5. Secure Private Document Storage
- Private document repository outside the public web root for bill scans and PDF attachments.
- Strict MIME type verification (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) with a 10MB limit.
- Server-side authenticated streaming endpoint (`GET /api/documents/[filename]`) ensuring only the household owner can view and download attached documents.

### 6. Single-Owner Security Architecture
- Strictly **zero public registration**.
- First-run initial setup mode for the household owner.
- Session tokens signed with `jose` (JWT) stored in HTTP-only, secure, `SameSite=Lax` cookies.
- BCrypt master password hashing with in-app password update.

### 7. Precise Financials & Indian Numbering
- All amounts formatted using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` (e.g., `₹6,020.00`).
- Date formatting handled in `Asia/Kolkata` timezone.
- Export all bills and payments to CSV with a single click.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any` runtime escapes)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom dark/light theme design system
- **Components**: [shadcn/ui](https://ui.shadcn.com/) patterns with Radix UI & [Lucide React](https://lucide.dev/) icons
- **Database & ORM**: [Neon PostgreSQL](https://neon.tech/) + [Drizzle ORM](https://orm.drizzle.team/) (with automatic fallback to local persistent storage for offline development)
- **Charting**: [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/watrack.git
cd watrack
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Configure your variables in `.env.local`:

```env
# Neon PostgreSQL URL (optional for local dev; SQLite fallback is used if not supplied)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/watrack?sslmode=require"

# Secret for signing JWT session cookies (32+ chars)
AUTH_SECRET="your-super-secret-random-32-char-key-for-jwt-session"

# Default owner credentials
OWNER_EMAIL="owner@watrack.local"
OWNER_PASSWORD="watrack123"
```

### 3. Run Database Migrations (Neon PostgreSQL)

Generate and apply Drizzle migrations:

```bash
# Generate SQL migrations
npx drizzle-kit generate

# Push schema directly to Neon Postgres
npx drizzle-kit push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- Sign in with:
  - **Email**: `owner@watrack.local`
  - **Password**: `watrack123`

*(The sample KSEB bill from the Pala Section, Kuriyakose Alexander, #5624261012132, ₹6,020.00 is pre-seeded along with past cycles for immediate testing!)*

---

## 🧪 Testing & Validation

Run unit and integration test suite:

```bash
npm test
```

Run TypeScript compiler type check:

```bash
npx tsc --noEmit
```

Run ESLint verification:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

---

## ☁️ Vercel Deployment Guide

Deploying WaTrack to Vercel with Neon PostgreSQL takes under 3 minutes:

### 1. Create a Neon PostgreSQL Database
1. Go to [Neon.tech](https://neon.tech) and create a free PostgreSQL project named `watrack`.
2. Copy the **Pooled connection string** (e.g. `postgresql://...pooler.../watrack?sslmode=require`).

### 2. Push Schema to Neon
From your local terminal, apply the schema to Neon:

```bash
DATABASE_URL="postgresql://[user]:[password]@[neon-host]/watrack?sslmode=require" npx drizzle-kit push
```

### 3. Deploy to Vercel
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/new), import the repository.
3. In **Environment Variables**, set:
   - `DATABASE_URL`: Your Neon PostgreSQL pooled connection string.
   - `AUTH_SECRET`: A secure 32+ character string (generate using `openssl rand -base64 32`).
   - `OWNER_EMAIL`: `owner@watrack.local` (or your personal email).
   - `OWNER_PASSWORD`: Your chosen master password.
4. Click **Deploy**.

---

## 📄 License

MIT © [Tom Kurian](https://github.com/tomkurian). Built for Kerala State Electricity Board (KSEB) consumer billing management.
