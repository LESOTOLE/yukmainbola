# Product Requirements Document (PRD)
**Project Name:** Yuk Main Bola  
**Version:** 1.0.0  
**Date:** July 2026

## 1. Pendahuluan (Introduction)
**Yuk Main Bola** adalah sebuah platform aplikasi web yang dirancang untuk mempermudah komunitas futsal dan sepak bola dalam mencari jadwal pertandingan, memesan slot bermain, dan mengelola pembayaran. Sistem ini juga memiliki fitur manajemen untuk admin dalam mengatur lapangan (venues), jadwal sesi (schedules), dan sistem reward/poin untuk pemain.

## 2. Tech Stack (Teknologi yang Digunakan)
- **Frontend Framework:** Next.js (v16.2.x - App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS v4, Shadcn UI, Class Variance Authority (CVA).
- **Backend / Database:** Supabase (PostgreSQL), Supabase Auth, SSR (Server-Side Rendering).
- **Payment Gateway:** Midtrans (midtrans-client).
- **Validation:** Zod.
- **Data Visualization:** Recharts (untuk Dashboard Admin).

## 3. User Roles & Permissions
Sistem mengadopsi struktur peran (Role-Based Access Control) yang terintegrasi dengan Row Level Security (RLS) di Supabase:
1. **Super Admin:** Memiliki akses penuh ke seluruh sistem dan dapat mengubah hak akses admin lain.
2. **Admin:** Mengelola jadwal (schedules), lapangan (venues), booking, dan melihat laporan (dashboard).
3. **Member:** Pengguna terdaftar yang dapat melihat jadwal terbuka, melakukan booking slot, mengunggah profil, dan mendapatkan poin/reward.
4. **Guest (Anon):** Pengguna tidak terdaftar yang hanya dapat melihat jadwal dan informasi lapangan.

## 4. Fitur Utama (Core Features)

### A. Autentikasi & Profil (Authentication & Profile)
- Registrasi dan Login menggunakan Supabase Auth.
- Pembuatan otomatis data `profiles` melalui Trigger di PostgreSQL ketika user baru mendaftar.
- Halaman profil pengguna untuk melihat riwayat booking, mengubah avatar, bio, dan nomor telepon.

### B. Manajemen Jadwal & Lapangan (Venues & Schedules)
- **Venues:** Daftar lokasi lapangan beserta fasilitas, alamat, dan link Google Maps.
- **Schedules:** Admin dapat membuka jadwal pertandingan dengan detail:
  - Tanggal & Waktu (start_time, end_time)
  - Kapasitas maksimal pemain (max_players)
  - Jumlah pemain saat ini (current_players)
  - Harga per orang (price_per_person)
  - Status (open, full, cancelled, completed)

### C. Booking & Pembayaran (Booking & Payments)
- Member dapat memesan (booking) slot pada jadwal yang berstatus `open`.
- **Group Booking:** Member bisa mendaftar untuk 1–20 orang sekaligus (tergantung slot tersedia).
  - Pilihan jumlah orang via counter (+/-) di modal konfirmasi.
  - Input nama teman (opsional) untuk membantu admin di lapangan.
  - Total harga otomatis dihitung: `price_per_person × quantity`.
  - Trigger database otomatis menambah/kurangi `current_players` sesuai `quantity`.
- Integrasi Midtrans untuk pemrosesan pembayaran tiket/slot pertandingan secara instan.
- Validasi sisa slot (`max_players` vs `current_players`) sebelum dan sesudah insert.

### D. Gamifikasi & Komunitas (Community & Rewards)
- **Points System:** Pengguna bisa mendapatkan dan menggunakan poin (loyalty program) yang tersimpan dalam sistem.
- **Gallery & Testimonials:** Pengguna dapat membagikan testimoni dan melihat dokumentasi/galeri dari pertandingan sebelumnya.

### E. Admin Dashboard
- Halaman panel admin (`/admin`) untuk statistik pendapatan, jumlah user, dan manajemen keseluruhan sistem (menggunakan Recharts untuk grafik).

## 5. Struktur Database (Supabase PostgreSQL)
Database dibagi ke dalam beberapa fase skema:
1. `profiles`: Menyimpan data user (full_name, phone, avatar_url, role).
2. `venues`: Data lokasi lapangan futsal/bola.
3. `schedules`: Data sesi bermain (terhubung dengan venues).
4. `gallery` & `testimonials`: Untuk aset dokumentasi dan ulasan pengguna.
5. (Phase Lanjutan): Tabel booking, payments, realtime updates, storage untuk avatar/gambar, dan sistem poin.

*Catatan: Seluruh tabel mengimplementasikan Row Level Security (RLS) untuk keamanan akses data dari sisi client.*
