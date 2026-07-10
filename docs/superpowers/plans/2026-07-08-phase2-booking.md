# Phase 2: Booking Mabar — Implementation Plan
**Status**: In Progress

## Overview
Implementasi fitur booking (pendaftaran mabar) untuk Yuk Main Bola. Meliputi pembuatan tabel `bookings`, halaman profil member, dan halaman detail jadwal.

## Tasks

### Task 1: Database Schema (Bookings)
- [ ] Buat `supabase/schema-phase2.sql` untuk tabel `bookings`.
- [ ] Tentukan kolom: `id`, `schedule_id` (FK schedules), `user_id` (FK profiles), `status` (booked, cancelled), `created_at`.
- [ ] Buat RLS Policies untuk `bookings` (member bisa insert, admin bisa kelola).
- [ ] Buat Database Triggers:
  - Saat `bookings` insert → update `schedules.current_players` + 1.
  - Saat `bookings` dibatalkan (status='cancelled') → update `schedules.current_players` - 1.

### Task 2: Supabase Type Definitions
- [ ] Update `src/types/database.ts` dengan interface `Bookings`.
- [ ] Tambahkan tipe join (misal: `BookingWithSchedule`).

### Task 3: Halaman Detail Jadwal (`/jadwal/[id]`)
- [ ] Buat Dynamic Route `src/app/jadwal/[id]/page.tsx`.
- [ ] Fetch data jadwal berdasarkan ID (sertakan info venue).
- [ ] Fetch daftar member yang sudah booking.
- [ ] Tampilkan UI Detail Jadwal (Waktu, Tempat, Sisa Slot).
- [ ] Buat tombol "Join Mabar" dengan kondisi:
  - Disabled jika slot penuh (`full`).
  - Disabled jika user belum login (arahkan ke `/login`).
  - Disabled jika user sudah terdaftar di jadwal tersebut.

### Task 4: Logika Booking & Server Actions
- [ ] Buat `src/app/actions/booking.ts` (Next.js Server Actions) untuk proses join mabar.
- [ ] Validasi backend: Cek ketersediaan slot sebelum insert ke tabel `bookings`.
- [ ] Tangani state loading & pesan sukses/error (toast).

### Task 5: Halaman Profil Member (`/profil`)
- [ ] Update `src/app/profil/page.tsx`.
- [ ] Fetch data profil user dari Supabase Auth + tabel `profiles`.
- [ ] Fetch daftar `bookings` milik user (join dengan `schedules` & `venues`).
- [ ] Tampilkan 2 tab/seksi: "Jadwal Mendatang" dan "Riwayat Mabar".
- [ ] Tambahkan fitur "Batal Ikut" (cancel booking) untuk jadwal yang masih *open*.

### Task 6: Review & Verification
- [ ] Compile TypeScript (`tsc --noEmit`).
- [ ] Uji coba flow: Login -> Buka Jadwal -> Join Mabar -> Cek Profil -> Batal Join.
