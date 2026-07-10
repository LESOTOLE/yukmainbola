# Loyalty Points System Design
Date: 2026-07-10

## Overview
Implement a "Capped Discount" Loyalty Points System for Yuk Main Bola to drive business growth and user retention. Users will earn points for every successful booking and can redeem them for up to a 50% discount on future bookings.

## Core Mechanics
- **Earning Points:** 10% of the *cash amount paid* (excluding points used) is converted into points.
- **Redeeming Points:** 1 Point = Rp 1.
- **Redemption Cap:** Points can be used to cover a maximum of 50% of a booking's gross price.

## Database Schema Changes
1. **`profiles` table updates:**
   - Add column `points_balance` (INT, default 0).
2. **`point_transactions` table (New):**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to profiles)
   - `amount` (INT, positive for earned, negative for redeemed/refunded)
   - `type` (TEXT: 'earned' | 'redeemed' | 'refunded')
   - `reference_id` (TEXT, e.g., 'YMB-...', 'EVT-...')
   - `description` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - RLS: Users can SELECT their own transactions. Insert/Update restricted to service_role.

## Data Flow & Architecture

### 1. Checkout Flow (Redemption)
- **UI Updates:** 
  - Update `JoinButton` and `EventCard` checkout flows. Instead of immediately processing the transaction and opening Midtrans, show a confirmation modal displaying:
    - Original Price
    - Available Points & Max Usable Points
    - A toggle to "Gunakan Poin" (Use Points)
    - Final Price
- **Server Actions (`joinMabar`, `registerEvent`):**
  - Accept a new `usePoints: boolean` parameter.
  - If `usePoints` is true:
    - Fetch user's `points_balance`.
    - Calculate `points_to_use` = MIN(points_balance, price * 0.5).
    - Deduct `points_to_use` from user's `points_balance`.
    - Insert a 'redeemed' record into `point_transactions`.
    - Update `gross_amount` for Midtrans = `price - points_to_use`.

### 2. Webhook Flow (Earning & Refunding)
- **File:** `src/app/api/payment/notification/route.ts`
- **When Payment is Settled (`settlement` / `capture`):**
  - Calculate points to award: 10% of the actual paid `gross_amount`.
  - Add to `points_balance`.
  - Insert an 'earned' record into `point_transactions`.
- **When Payment is Cancelled/Expired (`cancel` / `expire` / `deny`):**
  - Check if points were redeemed for this order (by querying `point_transactions` where `reference_id = orderId` and `type = 'redeemed'`).
  - If yes, refund the points back to `points_balance` and add a 'refunded' record.

### 3. Profile Page (UI)
- Add a "Poin Saya" (My Points) section showing current balance.
- Display a small transaction history (recent 5 points earned/redeemed).

## Security & Constraints
- Database RLS prevents users from manually altering their `points_balance`.
- Earning and redeeming are calculated strictly on the server-side (`actions` and `webhook`) to prevent client-side tampering.
- Midtrans payload acts as the source of truth for actual amount paid during point calculations.
