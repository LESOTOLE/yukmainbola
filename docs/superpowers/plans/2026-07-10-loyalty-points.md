# Loyalty Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Loyalty Points system where users earn 10% back in points and can redeem them for up to a 50% discount on future bookings.

**Architecture:** We will add `points_balance` to `profiles`, create a new `point_transactions` table to track history, modify Midtrans payment webhook to grant points on successful payments, and add UI toggles to the checkout flow to redeem points before generating a Snap token.

**Tech Stack:** Next.js 14, Supabase (PostgreSQL), Midtrans Node.js Client, Tailwind CSS.

## Global Constraints

- Must securely calculate points on the server (never trust client amounts).
- Must bypass RLS gracefully in webhooks where necessary using `supabaseAdmin`.

---

### Task 1: Database Schema & Types

**Files:**
- Create: `supabase/schema-phase8-points.sql`
- Modify: `src/types/database.ts`

**Interfaces:**
- Consumes: N/A
- Produces: SQL script for the user to run, updated TypeScript definitions.

- [ ] **Step 1: Write SQL Schema**
Create `supabase/schema-phase8-points.sql` with SQL commands to add `points_balance` to `profiles` and create the `point_transactions` table with appropriate RLS policies.

- [ ] **Step 2: Update TypeScript Types**
Modify `src/types/database.ts` to include `points_balance: number` in the `Profile` interface and create a new `PointTransaction` interface.

---

### Task 2: Profile Page UI

**Files:**
- Modify: `src/app/profil/page.tsx`

**Interfaces:**
- Consumes: `points_balance` from `Profile` interface.
- Produces: A new card in the Profile page displaying the points.

- [ ] **Step 1: Fetch and display points**
Update `src/app/profil/page.tsx` to display the user's `points_balance`. Create a visually appealing "Poin Saya" card next to the user's basic info. Include an icon (e.g., `Coins` or `Star` from `lucide-react`).

---

### Task 3: Backend Logic Updates (Server Actions)

**Files:**
- Modify: `src/app/actions/booking.ts`
- Modify: `src/app/actions/event.ts`

**Interfaces:**
- Consumes: `usePoints?: boolean` as a new parameter for `joinMabar` and `registerEvent`.
- Produces: Updated server actions that deduct points and calculate discounted `gross_amount`.

- [ ] **Step 1: Update `joinMabar`**
In `src/app/actions/booking.ts`, add a `usePoints = false` argument to `joinMabar`. Fetch the user's `points_balance`. If `usePoints` is true, calculate `pointsToUse = Math.min(profile.points_balance || 0, Math.floor(schedule.price_per_person * 0.5))`. Update the Midtrans `gross_amount`. Deduct points using `supabaseAdmin` and insert into `point_transactions`.

- [ ] **Step 2: Update `registerEvent`**
In `src/app/actions/event.ts`, repeat the exact same logic for event registration. Update the `gross_amount` for the event price and deduct the points using `supabaseAdmin` if `usePoints` is true.

---

### Task 4: Checkout UI Updates

**Files:**
- Modify: `src/app/jadwal/[id]/JoinButton.tsx`
- Modify: `src/components/events/EventCard.tsx`

**Interfaces:**
- Consumes: Updated server actions from Task 3.
- Produces: A confirmation modal before Midtrans opens.

- [ ] **Step 1: Update `JoinButton.tsx`**
Refactor the button click handler to first open a confirmation modal. The modal should show the original price, the user's `points_balance`, and a toggle (or checkbox) to "Gunakan Poin" (Use Points). Show the final price. When confirmed, call `joinMabar(scheduleId, usePoints)`.

- [ ] **Step 2: Update `EventCard.tsx`**
Refactor the "Daftar" button to do the same thing. Fetch the user's profile points (if not already fetched) or pass it down as a prop. Open a confirmation modal with the toggle, then call `registerEvent(event.id, usePoints)`.

---

### Task 5: Webhook Updates (Earning Points)

**Files:**
- Modify: `src/app/api/payment/notification/route.ts`

**Interfaces:**
- Consumes: Midtrans payload.
- Produces: Points credited to the user on success.

- [ ] **Step 1: Handle Settlement**
When status is `settlement` or `capture`, calculate `pointsEarned = Math.floor(gross_amount * 0.10)`. Look up the booking/event registration by `order_id` to find the `user_id`. Add `pointsEarned` to the user's `points_balance` using `supabaseAdmin` and insert a record into `point_transactions` with type `earned`.

- [ ] **Step 2: Handle Expiry/Cancellation (Refund Points)**
When status is `cancel`, `expire`, or `deny`, query `point_transactions` to see if points were redeemed for this `order_id`. If so, refund the points back to `points_balance` and log a `refunded` transaction.
