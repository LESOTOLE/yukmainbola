# Phase 1: Foundation — Design Spec

**Project**: Yuk Main Bola — Website Komunitas Minisoccer  
**Date**: 2026-07-08  
**Status**: Approved  
**Reference**: [blaxfootball.id](https://blaxfootball.id)

---

## 1. Overview

Build the foundation for "Yuk Main Bola", a public-facing minisoccer community website. Phase 1 covers project setup, database schema, authentication, and a fully designed landing page with 6 content sections.

### Success Criteria

- Next.js 15 project running locally at `localhost:3000`
- Supabase database connected with all Phase 1 tables + RLS policies
- Auth system working (register, login, logout, session management)
- Landing page with all 6 sections rendering real data from Supabase
- Route protection via middleware (guest vs member vs admin vs super_admin)
- Responsive on mobile, tablet, and desktop
- Dark theme with green grass accent applied consistently

### Out of Scope (Later Phases)

- Booking system (Phase 2)
- Payment / Midtrans integration (Phase 3)
- Event & tournament management (Phase 4)
- Admin panel CRUD (Phase 5)
- Notifications, PWA, SEO polish (Phase 6)

---

## 2. Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | TailwindCSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Storage | Supabase Storage (images) |
| Validation | Zod |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
| Approach | Supabase Client SDK directly in Next.js (Approach A) |

---

## 3. Project Structure

```
D:\yukmainbola\
├── app/
│   ├── layout.tsx                ← Root layout (font, theme, navbar, footer)
│   ├── page.tsx                  ← Landing page
│   ├── globals.css               ← Global styles + CSS variables
│   ├── login/
│   │   └── page.tsx              ← Login page
│   ├── register/
│   │   └── page.tsx              ← Register page
│   ├── profil/
│   │   └── page.tsx              ← Profile page (protected)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts          ← Auth callback handler
│   ├── not-found.tsx             ← Custom 404 page
│   └── error.tsx                 ← Global error boundary
│
├── components/
│   ├── ui/                       ← shadcn/ui primitives (Button, Card, Input, etc.)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── landing/
│       ├── HeroSection.tsx
│       ├── JadwalPreview.tsx
│       ├── StatsSection.tsx
│       ├── GaleriSection.tsx
│       ├── TestimoniSection.tsx
│       └── VenueSection.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             ← createBrowserClient()
│   │   ├── server.ts             ← createServerClient()
│   │   └── middleware.ts         ← Session refresh helper
│   ├── validations/
│   │   ├── auth.ts               ← Login/register Zod schemas
│   │   └── profile.ts            ← Profile update Zod schema
│   └── utils.ts                  ← formatDate, formatCurrency, cn()
│
├── types/
│   └── database.ts               ← TypeScript types matching DB schema
│
├── middleware.ts                  ← Next.js middleware (route protection)
├── tailwind.config.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── .env.local                    ← NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 4. Design System

### Color Palette (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0f1a` | Page background |
| `--surface` | `#111827` | Cards, containers |
| `--surface-hover` | `#1a2332` | Card hover state |
| `--primary` | `#22c55e` | Primary buttons, key accents |
| `--primary-hover` | `#4ade80` | Primary hover |
| `--primary-muted` | `rgba(34,197,94,0.1)` | Subtle primary backgrounds |
| `--accent` | `#10b981` | Secondary accents (emerald) |
| `--text` | `#f1f5f9` | Primary text |
| `--text-muted` | `#94a3b8` | Secondary text |
| `--border` | `#1e293b` | Borders, dividers |
| `--danger` | `#ef4444` | Errors, destructive actions |
| `--danger-hover` | `#dc2626` | Error hover |

### Typography

- **Font**: Inter (Google Fonts)
- **Headings**: font-bold, tracking-tight
- **Body**: font-normal, text-base (16px)
- **Small**: text-sm (14px), text-muted color

### Spacing & Radius

- Section padding: `py-20 px-4`
- Card padding: `p-6`
- Border radius: `rounded-xl` (12px) for cards, `rounded-lg` (8px) for buttons
- Max content width: `max-w-7xl mx-auto`

### Animations

- Fade-in on scroll (Intersection Observer)
- Count-up animation for stats
- Hover scale on cards (`hover:scale-[1.02]`)
- Smooth transitions: `transition-all duration-300`

---

## 5. Database Schema

### Table: `profiles`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, references `auth.users(id)` ON DELETE CASCADE |
| `full_name` | `TEXT` | NOT NULL |
| `phone` | `TEXT` | nullable |
| `avatar_url` | `TEXT` | nullable |
| `role` | `TEXT` | NOT NULL, DEFAULT `'member'`, CHECK IN (`super_admin`, `admin`, `member`, `guest`) |
| `bio` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Trigger**: On `auth.users` INSERT → auto-create `profiles` row with `role = 'member'`.

### Table: `venues`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL |
| `address` | `TEXT` | NOT NULL |
| `maps_url` | `TEXT` | nullable |
| `image_url` | `TEXT` | nullable |
| `facilities` | `JSONB` | DEFAULT `'[]'` (e.g. `["parkir","toilet","kantin"]`) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

### Table: `schedules`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `venue_id` | `UUID` | FK → `venues(id)` ON DELETE CASCADE |
| `date` | `DATE` | NOT NULL |
| `start_time` | `TIME` | NOT NULL |
| `end_time` | `TIME` | NOT NULL |
| `max_players` | `INT` | NOT NULL, CHECK > 0 |
| `current_players` | `INT` | NOT NULL, DEFAULT `0`, CHECK >= 0 |
| `price_per_person` | `DECIMAL(10,2)` | NOT NULL, CHECK >= 0 |
| `status` | `TEXT` | NOT NULL, DEFAULT `'open'`, CHECK IN (`open`, `full`, `cancelled`, `completed`) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

### Table: `gallery`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `image_url` | `TEXT` | NOT NULL |
| `caption` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

### Table: `testimonials`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `user_id` | `UUID` | FK → `profiles(id)` ON DELETE CASCADE |
| `content` | `TEXT` | NOT NULL |
| `rating` | `INT` | NOT NULL, CHECK BETWEEN 1 AND 5 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

---

## 6. Row Level Security (RLS) Policies

### `profiles`

| Policy | Action | Who | Condition |
|--------|--------|-----|-----------|
| `profiles_select_own` | SELECT | authenticated | `auth.uid() = id` |
| `profiles_select_admin` | SELECT | authenticated | caller's role IN (`admin`, `super_admin`) |
| `profiles_update_own` | UPDATE | authenticated | `auth.uid() = id` AND cannot change own `role` |
| `profiles_update_super` | UPDATE | authenticated | caller's role = `super_admin` |

### `venues`, `schedules`, `gallery`

| Policy | Action | Who | Condition |
|--------|--------|-----|-----------|
| `*_select_public` | SELECT | anon, authenticated | `true` (public read) |
| `*_insert_admin` | INSERT | authenticated | caller's role IN (`admin`, `super_admin`) |
| `*_update_admin` | UPDATE | authenticated | caller's role IN (`admin`, `super_admin`) |
| `*_delete_admin` | DELETE | authenticated | caller's role IN (`admin`, `super_admin`) |

### `testimonials`

| Policy | Action | Who | Condition |
|--------|--------|-----|-----------|
| `testimonials_select_public` | SELECT | anon, authenticated | `true` |
| `testimonials_insert_member` | INSERT | authenticated | `auth.uid() = user_id` |
| `testimonials_update_own` | UPDATE | authenticated | `auth.uid() = user_id` |
| `testimonials_delete_admin` | DELETE | authenticated | caller's role IN (`admin`, `super_admin`) |

**Helper function** `get_user_role()`: Returns the role of the current authenticated user from `profiles` table.

---

## 7. Authentication System

### Registration Flow

1. User fills form: full_name, email, password, phone
2. Client-side validation (Zod):
   - email: valid format
   - password: min 8 chars, at least 1 letter + 1 number
   - full_name: min 2 chars
   - phone: optional, Indonesian format
3. Call `supabase.auth.signUp({ email, password, options: { data: { full_name, phone } } })`
4. Database trigger creates `profiles` row (role = `member`)
5. Confirmation email sent (Supabase default)
6. User clicks link → account verified → redirect to `/login`

### Login Flow

1. User fills email + password
2. Client-side validation (Zod)
3. Call `supabase.auth.signInWithPassword({ email, password })`
4. On success: session cookie set via `@supabase/ssr`, redirect to `/`
5. On failure: show error message (invalid credentials)

### Session Management

- `@supabase/ssr` handles cookie-based sessions
- `middleware.ts` refreshes session on every request
- Session expires after Supabase default (1 hour access token, auto-refreshed)

### Logout

- Call `supabase.auth.signOut()`
- Clear cookies, redirect to `/`

---

## 8. Route Protection (middleware.ts)

```
Incoming request
      ↓
middleware.ts runs
      ↓
Refresh session (supabase.auth.getUser())
      ↓
Check route:
  /login, /register → if logged in, redirect to /
  /profil/*         → if not logged in, redirect to /login
  /admin/*          → if not logged in, redirect to /login
                    → if logged in but role not admin/super_admin, redirect to /
  everything else   → pass through
```

---

## 9. Landing Page Sections

### 9.1 Navbar

- **Layout**: Fixed top, full width, z-50
- **Left**: Logo image + "Yuk Main Bola" text
- **Center**: Nav links — Jadwal, Event, Galeri, Tentang (smooth scroll to sections)
- **Right**: 
  - Not logged in: `Login` (ghost) + `Daftar` (primary) buttons
  - Logged in: Avatar + dropdown (Profil, Admin panel if admin, Logout)
- **Behavior**: Transparent on top → solid `background` color on scroll (via scroll listener)
- **Mobile**: Hamburger icon → slide-in menu from right

### 9.2 Hero Section

- **Background**: Dark gradient overlay on football field image (generated via AI)
- **Content**: Centered vertically
  - H1: "Yuk Main Bola" (text-5xl md:text-7xl, font-bold, gradient text green-to-emerald)
  - Subtitle: "Komunitas Minisoccer Terbuka Untuk Semua" (text-xl, text-muted)
  - 2 CTAs: `Gabung Sekarang` (primary solid) | `Lihat Jadwal` (outline)
- **Animation**: Fade-in + slide-up on load
- **Height**: `min-h-screen`

### 9.3 Jadwal Preview

- **Heading**: "Jadwal Mabar Terdekat" + subtext
- **Data**: Query `schedules` WHERE status = 'open' AND date >= today, ORDER BY date, LIMIT 3, JOIN venues
- **Card layout**: 3 columns (1 on mobile)
- **Each card**: venue name, date (formatted Indonesian), time range, sisa slot (badge), price (formatted Rupiah)
- **Empty state**: "Belum ada jadwal tersedia saat ini — stay tuned! ⚽"
- **Footer**: "Lihat Semua Jadwal →" link

### 9.4 Stats Section

- **Layout**: 4 stats in a row (2x2 on mobile)
- **Stats**:
  - Total Member → `COUNT(*)` from `profiles` where role = 'member'
  - Total Mabar → `COUNT(*)` from `schedules` where status = 'completed'
  - Total Event → hardcoded `0` for Phase 1 (no events table logic yet)
  - Venue Partner → `COUNT(*)` from `venues`
- **Animation**: Count-up from 0 to target number when section enters viewport
- **Icon**: Lucide icon above each number

### 9.5 Gallery Section

- **Heading**: "Galeri Kegiatan"
- **Data**: Query `gallery` ORDER BY created_at DESC, LIMIT 9
- **Layout**: Masonry-style grid, 3 columns (2 on mobile)
- **Interaction**: Click image → lightbox modal (full-size view with caption)
- **Empty state**: "Belum ada foto — segera hadir!"

### 9.6 Testimonials Section

- **Heading**: "Kata Mereka"
- **Data**: Query `testimonials` JOIN `profiles`, ORDER BY created_at DESC, LIMIT 6
- **Layout**: Horizontal scroll carousel (auto-play, pausable)
- **Each card**: Avatar, full_name, star rating (filled/empty stars), content text
- **Empty state**: "Belum ada testimoni."

### 9.7 Venue Section

- **Heading**: "Venue Partner Kami"
- **Data**: Query `venues` ORDER BY name
- **Layout**: Card grid, 2-3 columns
- **Each card**: Image, name, address, facilities as badges/icons, "Buka di Maps" button (opens maps_url in new tab)
- **Empty state**: "Info venue segera hadir."

### 9.8 Footer

- **Layout**: 3 columns (stacked on mobile)
  - Col 1: Logo + short description of community
  - Col 2: Quick links (Jadwal, Event, Galeri, Login, Daftar)
  - Col 3: Contact (WhatsApp link, Instagram link, Email)
- **Bottom bar**: "© 2026 Yuk Main Bola. All rights reserved."

---

## 10. Error Handling

| Scenario | Handling |
|----------|----------|
| Registration: email taken | Form error: "Email sudah terdaftar" |
| Registration: weak password | Zod validation: "Password minimal 8 karakter, harus ada huruf dan angka" |
| Login: wrong credentials | Form error: "Email atau password salah" |
| Session expired | Middleware auto-refresh; if refresh fails → redirect to `/login` |
| Database query fails | Try-catch, show generic error message, log to console |
| Image fails to load | `<Image>` onError → show placeholder |
| 404 page | Custom branded 404 with "Kembali ke Beranda" button |
| Network error | Toast notification: "Koneksi bermasalah, coba lagi" |
| Empty data | Per-section empty state messages (defined above) |

---

## 11. Seed Data

Phase 1 will include seed data for demo/development:

- **2 venues**: With real-looking names, addresses, facilities
- **5 schedules**: Various dates, times, venues, slot counts
- **6 gallery images**: AI-generated football/minisoccer images
- **4 testimonials**: Placeholder member reviews
- **1 super_admin account**: Created manually in Supabase dashboard

---

## 12. Phase Roadmap (Full Project)

| Phase | Scope | Depends on |
|-------|-------|-----------|
| **Phase 1** (this spec) | Foundation: setup, DB, auth, landing page | — |
| **Phase 2** | Booking mabar: join/cancel schedule, slot management | Phase 1 |
| **Phase 3** | Payment: Midtrans integration for booking | Phase 2 |
| **Phase 4** | Events & tournaments: CRUD, registration, payment | Phase 3 |
| **Phase 5** | Admin panel: full dashboard CRUD for all entities | Phase 1 |
| **Phase 6** | Polish: notifications (WA/email), PWA, SEO, performance | Phase 5 |
