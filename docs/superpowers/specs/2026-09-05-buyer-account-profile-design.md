# Buyer Account Profile (Tokopedia-style) — Design Spec

**Tanggal:** 2026-09-05
**Status:** Approved (3 section)
**Scope:** Architectural — pisah page buyer vs role lain + redesign ala Tokopedia
**Opsi dipilih:** A (URL tetap `/settings/profile`) + Pendekatan 1+2 (split frontend + split backend)

## 1. Goal

- Page profile buyer punya page sendiri (file/komponen/layout terpisah total dari role lain) agar leluasa custom.
- UI/UX buyer mirip ecommerce beneran (referensi: Tokopedia): header kompak, shortcut Belanja dinamis, menu grouping, rincian profil terpisah.
- URL tidak berubah (`/settings/profile`) untuk menghindari redirect/old-link break; pemisahan terjadi di level controller + komponen.

## 2. Architecture

- `ProfileController@edit` branching by role:
  - `role === buyer` → `Inertia::render('account/index', ['accountSummary' => ...])`
  - selainnya → `Inertia::render('settings/profile')` seperti sekarang.
- `PATCH settings/profile` (update) dan `DELETE settings/profile` (destroy) tidak berubah; dipakai kedua role.
- Buyer memakai `AppHeaderLayout` (header toko + `BuyerBottomNav`), BUKAN chrome `SettingsLayout`. Hapus special-case `component === 'settings/profile' && isBuyer` di `layouts/settings/layout.tsx`.
- Bottom-nav highlight tetap by URL (`profileEdit()`), bukan nama komponen — tidak perlu ubah `buyer-bottom-nav.tsx` kecuali bug.
- Non-buyer page dibersihkan: `pages/settings/profile.tsx` hanya render `ProfileForm`; hapus import `BuyerProfile` dan branch `isBuyer`.
- `components/settings/buyer-profile.tsx` dihapus setelah migrasi (jangan dipakai lagi).

## 3. File Structure

**Buat baru (buyer):**
- `resources/js/pages/account/index.tsx` — page utama akun buyer.
- `resources/js/pages/account/profile-detail.tsx` — rincian profil (info + form edit).
- `resources/js/components/account/account-header.tsx` — kartu header (avatar, nama, email, phone, badge Buyer, chevron → detail).
- `resources/js/components/account/shop-shortcuts.tsx` — 3 kartu: Pesanan, Wishlist, Keranjang + count dinamis.
- `resources/js/components/account/order-status-strip.tsx` — strip: Belum Bayar | Dikemas | Dikirim | Selesai → link `/orders`.
- `resources/js/components/account/menu-group.tsx` — grup menu generik (title + rows).
- `resources/js/components/account/seller-cta.tsx` — kartu ajukan seller (reuse copy yang ada).
- `resources/js/components/account/account-menu-config.ts` — definisi grouping menu (single source).

**Ubah:**
- `app/Http/Controllers/Settings/ProfileController.php` — tambah branch + `accountSummary`.
- `resources/js/pages/settings/profile.tsx` — hapus branch buyer.
- `resources/js/layouts/settings/layout.tsx` — hapus special-case buyer.
- `resources/js/routes/profile.ts` (wayfinder, auto-generated — jangan edit manual; pastikan link tetap valid).

**Hapus:**
- `resources/js/components/settings/buyer-profile.tsx` (setelah pengganti siap).

## 4. Data Flow (`accountSummary`)

- Source: `ProfileController@edit` untuk buyer, bentuk:
  ```php
  'accountSummary' => [
    'cart_count' => int,
    'wishlist_count' => int,
    'orders_total' => int,
    'orders_by_status' => ['unpaid' => int, 'packing' => int, 'shipping' => int, 'done' => int],
  ]
  ```
- `cart_count`: reuse query `CartItem::where('user_id', ...)->count()` (sama seperti `buyerHeader`).
- `wishlist_count`: `Wishlist::where('user_id', ...)->count()` (cek nama model aktual saat implementasi).
- `orders_*`: agregasi order buyer by status/payment-status; mapping status code exact diputuskan saat implementasi dari `OrderStatus`/`PaymentStatus` enum (jangan hardcode label).
- `auth.user` (name/email/phone) tetap dari shared props; tidak ada endpoint baru.
- Jika query summary gagal: fallback `0` + page tetap render (jangan 500); error log server-side.

## 5. UI/UX (Tokopedia-style, token existing)

- Token: pertahankan `#0080FF`/`#EFF8FF`/`#BCE0FF`, rounded-14, shadow existing. Tidak ada tema baru.
- Layout buyer: `max-w-3xl` centered, single column (mobile-first, desktop tetap kompak ala Tokopedia mobile-web).
- Urutan vertikal `account/index`:
  1. `AccountHeader` (kartu gradient biru + avatar + nama + email/WA + badge Buyer; seluruh kartu klik → profile-detail).
  2. `ShopShortcuts` (3 kartu Belanja dengan count).
  3. `OrderStatusStrip` (4 status + chevron; klik → `/orders`, v1 tanpa filter query — filter jadi follow-up).
  4. Menu `Akun saya`: Profil (→ detail), Alamat (coming-soon/disabled jika backend belum ada), Keamanan (→ `security.edit`).
  5. Menu `Bantuan & Info`: Bantuan, Kebijakan/Layanan, Tentang (link statis/placeholder yang tidak 404).
  6. Menu `Lainnya`: Ajukan Seller (atau `SellerCta` card), Keluar (merah, confirm ringan), Hapus akun (`DeleteUser` existing dipindah ke detail atau bawah).
  7. `SellerCta` card hanya untuk `role === buyer`.
- `profile-detail`: layar khusus dengan tombol back, blok info akun + form edit (nama/email/WA) + simpan. Diakses via `?section=profil` agar shareable; direct open tetap valid. Sukses: toast + tetap di detail. Error validasi: inline per-field.
- A11y: `aria-current` di nav aktif, focus-visible ring, `role=status` untuk flash, kontras teks di atas gradient dijaga.
- Bottom padding untuk `BuyerBottomNavSpacer` agar tidak tertutup nav mobile.

## 6. Behavior & Edge Cases

- Guard role: seller/admin tidak pernah dapat komponen `account/*` walau buka URL sama.
- `?section=profil` unknown value → fallback ke index (jangan blank).
- Count 0 tetap render "0" (bukan hilang).
- Alamat: jika belum ada CRUD, menu tampil disabled dengan label "Segera hadir" — tidak boleh 404.
- Logout: reuse handler existing (`router.post(logout)`, `flushAll`, disable saat processing).
- Flash toast (`success`/`error`) tampil di index maupun detail.

## 7. Testing

- PHPUnit: `ProfileController@edit` — buyer dapat `account/index` + `accountSummary` shape benar; non-buyer dapat `settings/profile`.
- Smoke manual/PW: login buyer → `/settings/profile` tampil header+shortcut+menu; klik header/Profil → detail; edit nama tersimpan; cek sebagai seller/admin tetap settings lama; cek mobile (bottom nav tidak menutup konten).
- Tidak ada migrasi DB di v1.

## 8. Non-Goals (v1)

- CRUD alamat, filter `/orders?status=`, upload avatar, ulasan di profile, dark mode, i18n baru.
