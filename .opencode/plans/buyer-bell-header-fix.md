# Plan: Perbaiki Bell Notifikasi Buyer (header yang benar)

## Diagnosis (terverifikasi)

Buyer memakai layout **`AppHeaderLayout` → `resources/js/components/app-header.tsx`**
(app-layout.tsx:15 memilih layout berdasarkan role), sedangkan bell notifikasi
yang saya tambahkan berada di **`app-sidebar-header.tsx`** — komponen yang hanya
dirender untuk seller/admin-jurusan/picket via sidebar layout. Karena itu icon
tidak muncul untuk buyer apapun build/refresh.

Backend sudah benar: `buyerHeader.notifications[]` tersedia di Inertia props
(HandleInertiaRequests) dan tipe TS sudah diperluas.

## Langkah implementasi

### 1. Ekstrak komponen bersama
Buat `resources/js/components/notifications/header-notification-item.tsx`
mengekspor `HeaderNotificationItem({ notification })`:
- Isi = salinan persis `NotificationItem` dari app-sidebar-header.tsx (dismiss
  via router.delete + toast.error, border warna per type, Link ke href).
- Prop type: `NotificationForDropdown` dari '@/types/notifications'.
- Self-contained: typeToBorderColors lokal.

### 2. Refactor app-sidebar-header.tsx
- Hapus `NotificationItem` lokal + `typeToBorderColors`.
- Import `HeaderNotificationItem` dari file baru.
- Ganti 4 pemakaian `<NotificationItem ...>` → `<HeaderNotificationItem ...>`.
- `HeaderNotification` type lokal: hapus jika tak terpakai lain.

### 3. Tambah Bell di app-header.tsx (buyer section, sebelah tombol cart)
- Import tambahan: `Bell` (lucide), `DropdownMenuItem?` tidak perlu,
  `HeaderNotificationItem`, konstanta menu (salin
  notificationMenuClassName/notificationMenuStyle ke file ini).
- JSX setelah tombol Cart (dalam blok `{isBuyer && (...)}`, sibling):
  DropdownMenu Bell + badge dot merah bila ada item belum dibaca +
  "Mark all as read" + daftar `buyerHeader.notifications` +
  empty-state + footer link `/notifications` ("Lihat semua").
- Router/link/toast sudah tersedia di file ini.

### 4. Verifikasi
- `bunx tsc --noEmit`, eslint pada 2 file tsx, prettier --check.
- `bun run build` lalu full suite (`php artisan test`) sebagai sanksi ganda.
- Commit: `fix(notifications): render buyer bell in the actual buyer header`.

## Catatan
- Branch bell di app-sidebar-header.tsx (dibuat sesi lalu) dipertahankan —
  tidak ter-render bagi buyer saat ini namun konsisten bila layout berubah.
