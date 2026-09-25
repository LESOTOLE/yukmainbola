# Yuk Main Bola

Yuk Main Bola is a modern web application and management platform built for futsal and football communities. It simplifies discovering match schedules, booking session slots for individuals or groups, managing payments securely, and administering venues and events.

## Features

### Player and Community Features
- Match Schedule Discovery: View upcoming futsal and football sessions with venue location, time, price, and remaining slots.
- Group and Single Booking: Reserve single or multiple player slots (up to 20 spots depending on availability) with optional guest names for field coordination.
- Live Slot Availability: Real-time updates on available slots powered by Supabase Realtime channels.
- Payment Integration: Seamless payment gateway integration with Midtrans supporting automated status callbacks.
- Loyalty and Rewards Program: Earn and redeem loyalty points during booking checkout.
- Community Engagement: Browse community gallery pictures, read verified player testimonials, and submit match reviews.
- Member Profile Management: Track match booking history, update user profile information, and review transaction receipts.

### Administrative Features
- Analytics Dashboard: Visual insights into registered users, total revenue, bookings, and performance trends using interactive Recharts.
- Venue Management: Add, update, and manage sports venues with facilities details, addresses, and map links.
- Schedule Management: Create and configure match sessions, set participant capacities, pricing, and operational statuses (open, full, cancelled, completed).
- Event Management: Organize special tournaments and community events.
- Testimonial and Gallery Moderation: Review and manage player testimonials and uploaded media.
- Role-Based Access Control: Granular access control for super administrators, administrators, and members backed by database Row Level Security.

## Tech Stack

- Frontend Framework: Next.js 16 (App Router)
- UI Library: React 19, TypeScript
- Styling: Tailwind CSS v4, Base UI, tw-animate-css
- Icons: Lucide React
- Database and Auth: Supabase (PostgreSQL, Supabase Auth, Row Level Security, Realtime, Storage)
- Payments: Midtrans Client SDK (Snap and Core API)
- Data Visualization: Recharts
- Schema Validation: Zod

## Architecture and Project Structure

```
yukmainbola/
├── public/                 # Static assets and images
├── src/
│   ├── app/                # Next.js App Router routes and pages
│   │   ├── (auth)/         # Authentication routes (login, register, callback)
│   │   ├── actions/        # Server actions for bookings, events, venues, admin
│   │   ├── admin/          # Admin portal pages and dashboard charts
│   │   ├── api/            # API endpoints (Midtrans payment webhooks, dev utilities)
│   │   ├── event/          # Event listings and details
│   │   ├── jadwal/         # Schedule listings and booking details
│   │   └── profil/         # User profile and booking history
│   ├── components/         # Reusable UI and section components
│   │   ├── home/           # Landing page sections
│   │   ├── landing/        # Marketing presentation components
│   │   ├── layout/         # Navigation bar, footer, and shell wrappers
│   │   └── ui/             # Core UI components (buttons, dialogs, cards, etc.)
│   ├── hooks/              # Custom React hooks (realtime slots, observer)
│   ├── lib/                # Client utilities, Supabase instances, Midtrans setup
│   ├── proxy.ts            # Route protection and role validation proxy
│   └── types/              # TypeScript definitions and database contracts
├── supabase/               # SQL schema migrations and seed scripts
├── .env.example            # Environment variables template
├── package.json            # Project dependencies and script declarations
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:
- Node.js 20 or later
- npm, pnpm, or yarn
- A Supabase project instance
- A Midtrans merchant account (Sandbox or Production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/LESOTOLE/yukmainbola.git
   cd yukmainbola
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```

### Environment Variables

| Variable | Description |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | The API URL of your Supabase project |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Supabase public/anon API key |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (used server-side for admin actions) |
| MIDTRANS_IS_PRODUCTION | Set to false for sandbox testing, true for production |
| MIDTRANS_SERVER_KEY | Midtrans Server Key from Merchant Dashboard |
| NEXT_PUBLIC_MIDTRANS_CLIENT_KEY | Midtrans Client Key for frontend Snap SDK |

### Database Setup

Run the SQL migration scripts in your Supabase SQL Editor in the following sequence:

1. `supabase/schema.sql` - Core schema, tables, and Row Level Security policies
2. `supabase/schema-phase2.sql` - Bookings and transactions
3. `supabase/schema-phase3.sql` - Payment status constraints
4. `supabase/schema-phase4.sql` - Community events
5. `supabase/schema-phase5-storage.sql` - Storage bucket configuration
6. `supabase/schema-phase7-realtime.sql` - Realtime publication replication
7. `supabase/schema-phase8-points.sql` - Loyalty points balance and ledger
8. `supabase/schema-phase9-group-booking.sql` - Multi-slot booking triggers and functions

Optional seed data:
- `supabase/seed.sql` - Initial sample data
- `supabase/seed-users.sql` - Test user accounts
- `supabase/seed-jakarta-selatan.sql` - Jakarta Selatan venue seeds
- `supabase/seed-dummy-jadwal.sql` - Mock schedule entries
- `supabase/seed-points.sql` - Loyalty points test records

### Running the Application

- Start development server:
  ```bash
  npm run dev
  ```
  Open http://localhost:3000 in your browser.

- Run type checking and linter:
  ```bash
  npm run lint
  ```

- Build production bundle:
  ```bash
  npm run build
  ```

- Start production server:
  ```bash
  npm run start
  ```

## Security and Access Control

- Data Protection: All database tables are protected with PostgreSQL Row Level Security (RLS) policies.
- Role Enforcement: Route access is validated through `proxy.ts`, redirecting unauthorized users from protected member (`/profil`) and administrator (`/admin`) routes.
- Webhook Verification: Payment notifications from Midtrans are verified server-side with transaction status checks before updating database state.

## License

This project is private and proprietary.
