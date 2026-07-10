# Phase 4: Events & Tournaments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Events & Tournaments feature including database tables, event listing, registration, and payment integration via Midtrans.

**Architecture:** We will create new tables for `events` and `event_participants`. We will use Next.js App Router for the frontend, Server Actions for registration logic, and the existing Midtrans setup for payments. The webhook will be updated to handle event-specific order IDs.

**Tech Stack:** Next.js 15, Tailwind CSS, Supabase SSR, Midtrans Client

## Global Constraints

- Use Next.js App Router conventions (React Server Components by default).
- Do not use deprecated `middleware.ts`; the proxy is already set up.
- Ensure all API routes gracefully handle missing keys at build time.

---

### Task 1: Database Schema for Events

**Files:**
- Create: `supabase/schema-phase4.sql`

**Interfaces:**
- Produces: SQL for `events` and `event_participants` tables.

- [ ] **Step 1: Write the SQL schema**
Write the schema definition including tables, RLS policies, and triggers to update `current_participants`.
- [ ] **Step 2: Save the file**

### Task 2: Supabase Type Definitions

**Files:**
- Modify: `src/types/database.ts`

**Interfaces:**
- Consumes: Table definitions from Task 1.

- [ ] **Step 1: Update TypeScript definitions**
Add `Event` and `EventParticipant` interfaces based on the new tables.

### Task 3: Event Server Actions

**Files:**
- Create: `src/app/actions/event.ts`

**Interfaces:**
- Consumes: Supabase server client and Midtrans config.
- Produces: `registerEvent(eventId: string)` and `cancelEventRegistration(participantId: string)`.

- [ ] **Step 1: Implement Server Actions**
Write the server actions to insert into `event_participants` and generate Midtrans snap tokens. The `order_id` should have the prefix `EVT-`.

### Task 4: Webhook Update for Events

**Files:**
- Modify: `src/app/api/payment/notification/route.ts`

**Interfaces:**
- Consumes: Midtrans webhook payload.

- [ ] **Step 1: Update Webhook logic**
Modify the existing POST handler to check the `order_id` prefix. If it starts with `EVT-`, update `event_participants` instead of `bookings`.

### Task 5: Event UI (Listing and Detail)

**Files:**
- Create: `src/app/event/page.tsx`
- Create: `src/app/event/[id]/page.tsx`
- Create: `src/app/event/[id]/EventJoinButton.tsx`

**Interfaces:**
- Consumes: `registerEvent` action and Supabase client.

- [ ] **Step 1: Create Listing Page**
Fetch and display upcoming events in `src/app/event/page.tsx`.
- [ ] **Step 2: Create Detail Page & Join Button**
Build the detailed view and integrate the Midtrans Snap popup inside `EventJoinButton.tsx`.

### Task 6: Profile Page Update

**Files:**
- Modify: `src/app/profil/page.tsx`

**Interfaces:**
- Consumes: `event_participants` table data.

- [ ] **Step 1: Update Profile UI**
Fetch the user's event registrations and display them in a new section on the Profile page.

### Task 7: Build Testing

**Files:**
- N/A

- [ ] **Step 1: Run Build Test**
Run `npm run build` to verify there are no TypeScript, linting, or routing errors in the newly added phase.
