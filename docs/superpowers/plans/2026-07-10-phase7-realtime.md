# Phase 7: Real-time Updates & Notifications

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate the user experience by providing live quota updates without page reloads using Supabase Realtime, and set the groundwork for email/WhatsApp notifications.

**Tech Stack:** Next.js 15 App Router, Supabase Realtime (WebSockets), (Optional) Resend API for emails.

---

### Task 1: Enable Database Realtime

**Actions required in Supabase Dashboard (or via SQL):**
- Enable `REPLICA IDENTITY FULL` on the `schedules` and `events` tables.
- Turn on the "Realtime" toggle for both tables in the Supabase Dashboard (Database -> Publications -> `supabase_realtime`).

### Task 2: Build Real-time Hooks

**Files:**
- Create: `src/hooks/useRealtimeSlots.ts`

**Details:**
- Create a custom React hook that initializes a Supabase channel subscription (`supabase.channel('custom-all-channel')`).
- Listen for `UPDATE` events on the `schedules` and `events` tables.
- Return the live `current_players` or `current_participants` state.

### Task 3: Integrate Live UI

**Files:**
- Update: `src/components/home/ScheduleCard.tsx`
- Update: `src/components/home/EventCard.tsx`
- Update: `src/app/jadwal/[id]/page.tsx`

**Details:**
- Use the `useRealtimeSlots` hook inside these client components.
- When a payload arrives indicating that a slot was taken (e.g., someone else paid successfully), visually update the progress bar instantly without requiring the user to refresh the page.
- Show a brief toast notification if the slot becomes full while the user is viewing the page.

### Task 4: Setup Email Notification Service (Optional)

**Files:**
- Update: `src/app/api/payment/notification/route.ts`

**Details:**
- Integrate an email service (like Resend or SendGrid).
- Upon receiving a successful Midtrans webhook (`transaction_status == 'settlement'`), dispatch an automated "Booking Confirmed" email to the user's registered email address.
- The email should contain the Venue name, Date, Time, and a QR Code (or Booking ID) for verification on the field.
