# Phase 6: Front-End Polish & Content Management

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the landing page with dynamic Gallery and Testimonial sections, and build their respective Admin management tools.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, Supabase Storage & Database.

---

### Task 1: Admin Gallery Management

**Files:**
- Create: `src/app/actions/admin-gallery.ts`
- Create: `src/app/admin/gallery/page.tsx`
- Create: `src/app/admin/gallery/GalleryFormSheet.tsx`

**Details:**
- Build Server Actions for uploading images to the `gallery` bucket and inserting records into the `gallery` table.
- Build the Admin UI to view and delete gallery images.
- Ensure the sidebar navigation in `src/app/admin/layout.tsx` includes a link to `/admin/gallery`.

### Task 2: Admin Testimonials Management

**Files:**
- Create: `src/app/actions/admin-testimonials.ts`
- Create: `src/app/admin/testimonials/page.tsx`

**Details:**
- Build Server Actions for deleting testimonials (using `supabaseAdmin`).
- Build the Admin UI to view all user testimonials and moderate (delete) inappropriate ones.
- Update `src/app/admin/layout.tsx` to include `/admin/testimonials`.

### Task 3: Member Testimonial Submission

**Files:**
- Create: `src/app/actions/user-testimonials.ts`
- Update: `src/app/profil/page.tsx` (or a dedicated component `TestimonialForm.tsx`)

**Details:**
- Allow authenticated members to submit a rating (1-5) and a review.
- Save to the `testimonials` table with their user ID.

### Task 4: Landing Page Integration

**Files:**
- Create: `src/components/home/GallerySection.tsx`
- Create: `src/components/home/TestimonialsSection.tsx`
- Update: `src/app/page.tsx`

**Details:**
- Fetch data from `gallery` and `testimonials` tables in `page.tsx`.
- Pass data to the new dynamic sections on the landing page.
- Apply modern, premium styling (micro-animations, gradients, grid layouts).

### Task 5: Build Testing

- Run `npm run build` to verify typings and ensure a successful production build.
