# Phase 3: Payment Integration (Midtrans) — Implementation Plan
**Status**: In Progress

## Overview
Implementasi sistem pembayaran menggunakan Midtrans Snap API. User harus membayar untuk mengkonfirmasi partisipasi mabar mereka.

## Tasks

### Task 1: Environment & Dependencies
- [ ] Instal `midtrans-client` via npm.
- [ ] Tambahkan Midtrans Keys (Server Key & Client Key) ke `.env.local`.

### Task 2: Database Schema Update
- [ ] Buat file `supabase/schema-phase3.sql`.
- [ ] Alter tabel `bookings`:
  - Tambahkan `payment_status` (pending, paid, failed, expired) dengan default 'pending'.
  - Tambahkan `snap_token` (TEXT).
  - Tambahkan `snap_redirect_url` (TEXT).
- [ ] Update Trigger `handle_booking_change`:
  - Hanya tambah `current_players` jika `status` = 'booked' AND `payment_status` = 'paid' (atau biarkan saat pending untuk *reserve* slot). 
  - *Keputusan*: Kita akan *reserve* slot saat status 'booked' (meskipun payment 'pending'). Jika payment 'expired'/'failed', webhook akan mengubah status menjadi 'cancelled', sehingga slot kembali kosong.

### Task 3: Backend Token Generation
- [ ] Buat file config Midtrans di `src/lib/midtrans.ts`.
- [ ] Modifikasi `src/app/actions/booking.ts`:
  - Saat `joinMabar` dipanggil, insert ke `bookings` dengan `payment_status` = 'pending'.
  - Gunakan `midtrans-client` untuk membuat transaksi ke API Midtrans.
  - Simpan `snap_token` yang dikembalikan ke tabel `bookings`.
  - Kembalikan `snap_token` ke frontend.

### Task 4: Frontend Snap Integration
- [ ] Tambahkan script Midtrans Snap `<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="...">` di `app/layout.tsx`.
- [ ] Update `JoinButton.tsx`:
  - Setelah berhasil memanggil `joinMabar`, jalankan `window.snap.pay(token)`.
  - Handle callback `onSuccess`, `onPending`, dan `onError` dari Midtrans.
- [ ] Update `profil/page.tsx` untuk menampilkan badge status pembayaran (Belum Dibayar, Lunas, dsb.) dan tombol "Bayar Sekarang" jika masih pending.

### Task 5: Webhook Notification (Server-to-Server)
- [ ] Buat API Route `src/app/api/payment/notification/route.ts`.
- [ ] Terima POST request dari Midtrans.
- [ ] Validasi signature key Midtrans.
- [ ] Update `payment_status` di tabel `bookings` berdasarkan `transaction_status` dari Midtrans.
  - settlement/capture -> paid
  - expire/cancel/deny -> failed, lalu otomatis set `status` booking menjadi 'cancelled' (melepas slot).
