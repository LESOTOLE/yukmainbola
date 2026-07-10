# Phase 5: Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a secure Admin Panel dashboard for managing all application data (Users, Venues, Schedules, Events, and Transactions).

**Architecture:** We will create a nested route `/admin` that is protected by the existing `proxy.ts` middleware. The admin section will have its own layout with a sidebar navigation. We will build CRUD (Create, Read, Update, Delete) interfaces using shadcn/ui components.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, Supabase Admin Client.

## Global Constraints
- Only users with `role === 'admin'` or `super_admin` can access these routes (already enforced by middleware).
- Operations that modify data across users must use `supabaseAdmin` to bypass RLS safely on the server side.
- All forms should use React Server Actions for mutations.

---

### Task 1: Admin Layout & Dashboard Overview

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Produces: An admin sidebar with links to Users, Venues, Schedules, and Events. The overview page shows basic statistics.

- [ ] **Step 1: Create Admin Layout**
Build `layout.tsx` with a responsive sidebar containing navigation links.
- [ ] **Step 2: Create Dashboard Overview**
Build `page.tsx` to fetch basic counts (Total Users, Total Schedules, Total Events) and display them in summary cards.

### Task 2: User Management

**Files:**
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/actions/admin-users.ts`

**Interfaces:**
- Produces: Server actions to fetch profiles and update user roles.

- [ ] **Step 1: Create User Actions**
Write `updateUserRole(userId, newRole)` in `admin-users.ts`.
- [ ] **Step 2: Create Users Table UI**
Build the data table in `page.tsx` displaying users, their roles, and a dropdown to change roles.

### Task 3: Venue Management

**Files:**
- Create: `src/app/admin/venues/page.tsx`
- Create: `src/app/actions/admin-venues.ts`

**Interfaces:**
- Produces: Server actions for CRUD on `venues` table.

- [ ] **Step 1: Create Venue Actions**
Write actions to `addVenue`, `updateVenue`, and `deleteVenue`.
- [ ] **Step 2: Create Venues UI**
Build the list and form modal in `page.tsx`.

### Task 4: Schedule (Mabar) Management

**Files:**
- Create: `src/app/admin/schedules/page.tsx`
- Create: `src/app/actions/admin-schedules.ts`

**Interfaces:**
- Produces: CRUD on `schedules` table.

- [ ] **Step 1: Create Schedule Actions**
Write actions to `createSchedule`, `updateScheduleStatus`, and `deleteSchedule`.
- [ ] **Step 2: Create Schedules UI**
Build the interface to manage schedules.

### Task 5: Event & Tournament Management

**Files:**
- Create: `src/app/admin/events/page.tsx`
- Create: `src/app/actions/admin-events.ts`

**Interfaces:**
- Produces: CRUD on `events` table.

- [ ] **Step 1: Create Event Actions**
Write actions to `createEvent`, `updateEventStatus`, and `deleteEvent`.
- [ ] **Step 2: Create Events UI**
Build the interface to manage events.

### Task 6: Build Testing

- [ ] **Step 1: Run Build Test**
Run `npm run build` to verify there are no TypeScript, linting, or routing errors.
