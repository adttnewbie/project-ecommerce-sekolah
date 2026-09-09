# Code Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Perbaiki temuan review yang terbukti (payment-guard, TOCTOU, orphan upload, lock, dead code) tanpa mengubah perilaku yang sudah benar.

**Architecture:** Perbaikan локal per concerns: guard di controller/service yang sama, lock di query yang sama, cleanup di titik tulis yang sama. Tidak ada refactor arsitektur; `OrderStatusSync` di-inline ke `OrderSettlementService::sync()` di call-site yang ada.

**Tech Stack:** Laravel 13 (PHP 8.3), Eloquent, Pest 4, Pint, PHPStan Larastan level 7, Inertia React 19.

**Spec:** Laporan review codebase 2026-09-09 (temuan F-01..F-08 di bawah). Plan ini berargumen dari temuan itu; executor membaca keduanya.

## Global Constraints

- PHP `^8.3`, Laravel `^13.7` — satu baris tiap constraint, nilai eksak dari `composer.json`.
- Jangan mengubah API response shape Inertia kecuali diperintah task.
- Setiap perubahan perilaku wajib ada Pest test red-green.
- `vendor/bin/pint --test` harus lolos tiap task.
- `php -d memory_limit=1G vendor/bin/phpstan analyse --no-progress` level 7 harus lolos untuk file yang disentuh.
- Commit kecil per task dengan pesan `fix:` yang jelas.

---

## Temuan (ringkasan, jadi acuan task)

- **F-01 (bug, penting):** `BuyerOrderController::complete()` bulk-update status `Sent → Completed` tanpa cek `payment_status === Paid`, dan via query-builder `update()` sehingga event model dilewati. Payload `can_complete` mensyaratkan Paid — inkonsisten.
- **F-02 (bug-prone, sedang):** `BuyerOrderController::cancel()` membaca `$hadInProduction` SEBELUM `OrderItemCancellation::cancelOrder()` di luar lock/transaksi (TOCTOU untuk klasifikasi sanksi).
- **F-03 (bug-prone, sedang):** `SellerProductController::store/update()` menyimpan file `image->store('products','public')` SEBELUM `DB::transaction()`; jika transaksi gagal, file orphan. Hapus file lama setelah update tanpa rollback path.
- **F-04 (race, sedang-rendah):** `CartController::update()` tanpa `lockForUpdate()`/transaksi (padahal `store()` memakai lock). Cek stok `ensureQuantityDoesNotExceedStock` bisa dilewati dua request paralel. Jalur stok konsinyasi di checkout (`availableStock()` agregasi tanpa lock baris konsinyasi saat cek) perlu audit yang sama.
- **F-05 (konsistensi baca, rendah):** `SellerOrderController::index()` paginasi union `online+offline` lalu query ulang per halaman; sisipan baris antar query bisa menyebabkan duplikat/lompаt. Bukan bug pasti, hardening.
- **F-06 (dead code):** `App\Support\NotificationHrefBackfill` tidak punya call-site (hanya definisi kelas). `App\Support\OrderStatusSync` adalah alias `@deprecated` tapi dipakai 6 call-site — harus di-inline ke `OrderSettlementService::sync()`.
- **F-07 (dead code):** `resources/js/pages/**/​*.test.js` (4 file: `dashboard-polish`, `up-jurusan/index`, `up-jurusan/show`, `admin/settings/delivery-fee`) tidak dijalankan runner mana pun (tidak ada vitest; `playwright.config.ts` tidak menargetkannya).
- **F-08 (portabilitas, rendah):** `AdminDashboardController` grouping bulan via `substr(created_at,1,7)` — rapuh lintas DB. Catat saja; perbaiki hanya jika proyek menarget DB selain SQLite.

Tidak ditemukan: SQL injection (semua `selectRaw/whereRaw` memakai konstanta/`?` binding), mass-assignment terbuka (`#[Fillable]` dipakai), XSS blade (`{!!` tidak ada), IDOR kepemilikan (buyer/cart/seller/notification semua cek owner), `.env` terekspos (di-`.gitignore`).

---

### Task 1: Guard pembayaran di Buyer complete()

**Files:**
- Modify: `app/Http/Controllers/BuyerOrderController.php:58-90`
- Test: `tests/Feature/BuyerOrderTest.php`

**Interfaces:**
- Consumes: `OrderItemFulfillment::assertCanComplete(OrderItem $item): void`, `OrderStatusSync::sync(Order $order): void`
- Produces: `complete()` hanya menyelesaikan item `Sent + Paid`; item `Sent + Unpaid` tetap `Sent`.

- [ ] **Step 1: Tulis failing test**

```php
it('tidak menyelesaikan item terkirim yang belum dibayar', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->create(['user_id' => $buyer->id]);
    $sentUnpaid = OrderItem::factory()->create([
        'order_id' => $order->id,
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    $sentPaid = OrderItem::factory()->create([
        'order_id' => $order->id,
        'status' => OrderItemStatus::Sent,
        'payment_status' => PaymentStatus::Paid,
    ]);

    $this->actingAs($buyer)->post(route('orders.complete', $order))
        ->assertRedirect();

    expect($sentUnpaid->fresh()->status)->toBe(OrderItemStatus::Sent)
        ->and($sentPaid->fresh()->status)->toBe(OrderItemStatus::Completed);
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `php artisan test --filter="tidak menyelesaikan item terkirim"`
Expected: FAIL (item unpaid ikut jadi Completed)

- [ ] **Step 3: Implementasi minimal**

```php
$completable = $current->items
    ->filter(fn (OrderItem $item) => $item->status === OrderItemStatus::Sent
        && $item->payment_status === PaymentStatus::Paid);
```

Ganti `$sentItems` menjadi `$completable` di `complete()`, dan bulk-update hanya untuk ID completable. Pertahankan `OrderItemFulfillment::assertCanComplete()` per item + `OrderStatusSync::sync()`.

- [ ] **Step 4: Jalankan test, pastikan lolos**

Run: `php artisan test --filter="tidak menyelesaikan item terkirim"`
Expected: PASS

- [ ] **Step 5: Verifikasi standar**

Run: `vendor/bin/pint --test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/BuyerOrderController.php tests/Feature/BuyerOrderTest.php
git commit -m "fix: buyer complete hanya untuk item sent yang sudah paid"
```

---

### Task 2: Hilangkan TOCTOU klasifikasi sanksi cancel()

**Files:**
- Modify: `app/Http/Controllers/BuyerOrderController.php:92-125`
- Modify: `app/Support/OrderItemCancellation.php:43-60` (kembalikan flag `had_in_production` dari dalam transaksi)
- Test: `tests/Feature/BuyerSanctionTest.php`

**Interfaces:**
- Consumes: `OrderItemCancellation::cancelOrder(Order $order, User $actor, ?string $reason): void` (tambah return info)
- Produces: `cancelOrder()` mengembalikan `['had_in_production' => bool]` yang dibaca di dalam lock yang sama dengan pembatalan.

- [ ] **Step 1: Tulis failing test (dokumentasikan race secara deterministik)**

```php
it('mengklasifikasikan sanksi dari state saat cancel, bukan sebelum', function () {
    // Buat order dengan 1 item Pending, cancel, assert tipe violation = ExcessiveCancel.
    // Buat order dengan 1 item InProduction, cancel, assert = CancelInProduction.
    // Kunci: panggil endpoint HTTP, bukan service langsung, agar klasifikasi
    // ikut di dalam transaksi cancel.
});
```

- [ ] **Step 2: Jalankan test, pastikan lolos-sekarang (baseline)**

Run: `php artisan test --filter="mengklasifikasikan sanksi"`
Expected: PASS baseline (tujuan: kunci perilaku sebelum refactor)

- [ ] **Step 3: Implementasi minimal**

```php
// OrderItemCancellation::cancelOrder(): hitung $hadInProduction
// SETELAH lockForUpdate() order+items di dalam DB::transaction,
// lalu return ['had_in_production' => $hadInProduction].
// BuyerOrderController::cancel(): pakai return value itu untuk
// BuyerSanctionService::recordViolation(), hapus query hadInProduction di luar.
```

- [ ] **Step 4: Jalankan test**

Run: `php artisan test --filter="mengklasifikasikan sanksi"`
Expected: PASS (perilaku sama, race tertutup)

- [ ] **Step 5: Verifikasi standar**

Run: `vendor/bin/pint --test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/BuyerOrderController.php app/Support/OrderItemCancellation.php tests/Feature/BuyerSanctionTest.php
git commit -m "fix: klasifikasi sanksi cancel dibaca di dalam transaksi"
```

---

### Task 3: Perbaiki orphan upload produk seller

**Files:**
- Modify: `app/Http/Controllers/SellerProductController.php:121-180` (`store`)
- Modify: `app/Http/Controllers/SellerProductController.php:230-280` (`update`)
- Test: `tests/Feature/SellerProductCreateTest.php`

**Interfaces:**
- Consumes: `Storage::disk('public')`, `DB::transaction()`
- Produces: Tidak ada file orphan jika transaksi gagal; file lama dihapus hanya setelah update sukses.

- [ ] **Step 1: Tulis failing test**

```php
it('tidak meninggalkan file saat create produk gagal', function () {
    Storage::fake('public');
    // POST dengan image valid tapi payload invalid lain (mis. price > max)
    // sehingga transaksi/validasi gagal.
    // Assert: Storage::disk('public')->allFiles() kosong.
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `php artisan test --filter="tidak meninggalkan file"`
Expected: FAIL (file orphan ada)

- [ ] **Step 3: Implementasi minimal**

```php
// Pola: simpan file SETELAH create sukses, atau catat $imagePath baru
// dan hapus di catch jika transaksi melempar.
// Untuk update: hapus $oldImagePath hanya setelah $product->update() sukses,
// dan bungkus delete dalam pengecekan $imagePath !== $oldImagePath (sudah ada,
// pertahankan + tambah cleanup orphan di jalur exception).
```

- [ ] **Step 4: Jalankan test**

Run: `php artisan test --filter="tidak meninggalkan file"`
Expected: PASS

- [ ] **Step 5: Verifikasi standar**

Run: `vendor/bin/pint --test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/SellerProductController.php tests/Feature/SellerProductCreateTest.php
git commit -m "fix: cegah orphan upload image produk seller"
```

---

### Task 4: Kunci update cart + audit stok konsinyasi

**Files:**
- Modify: `app/Http/Controllers/CartController.php:118-140` (`update`)
- Test: `tests/Feature/CartRaceTest.php` (sudah ada — tambah kasus update-vs-update)

**Interfaces:**
- Consumes: `CartItem::query()->lockForUpdate()`, `PreOrderRules::assertPurchasable()`
- Produces: `update()` serialisasi per baris cart seperti `store()`.

- [ ] **Step 1: Tulis failing test**

```php
it('concurrent cart update tidak melewati stok', function () {
    // Seeded: produk stock 5, cart qty 4.
    // Simulasikan dua update qty=5 berurutan dalam transaksi terkunci;
    // yang kedua harus ValidationException, bukan keduanya lolos.
});
```

- [ ] **Step 2: Jalankan, pastikan gagal/lolos sesuai baseline**

Run: `php artisan test --filter="concurrent cart update"`
Expected: FAIL sebelum lock (catat hasil aktual sebagai bukti)

- [ ] **Step 3: Implementasi minimal**

```php
DB::transaction(function () use ($request, $cartItem) {
    $current = CartItem::query()->whereKey($cartItem->id)->lockForUpdate()->firstOrFail();
    abort_unless($current->user_id === $request->user()->id, 404);
    $current->load('product');
    // ... validasi stok + PreOrderRules lalu $current->update(['quantity' => $quantity]);
});
```

- [ ] **Step 4: Jalankan test**

Run: `php artisan test --filter="concurrent cart update"`
Expected: PASS

- [ ] **Step 5: Verifikasi standar**

Run: `vendor/bin/pint --test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/CartController.php tests/Feature/CartRaceTest.php
git commit -m "fix: kunci baris cart saat update agar cek stok tidak balapan"
```

---

### Task 5: Bersihkan dead code + alias deprecated

**Files:**
- Delete/verify: `app/Support/NotificationHrefBackfill.php` (hapus hanya jika `grep -rn NotificationHrefBackfill` tetap 1 hasil definisi)
- Modify (6 call-site): `app/Support/PaymentTransitionService.php:58-59,112-113`, `app/Support/OrderItemCancellation.php:178-179`, `app/Support/OrderLivenessService.php:570`, `app/Http/Controllers/PicketUpJurusanConsignmentController.php:481`, `app/Http/Controllers/BuyerOrderController.php:93` — ganti `OrderStatusSync::sync(` → `OrderSettlementService::sync(`
- Delete: `app/Support/OrderStatusSync.php`
- Delete/relocate: `resources/js/pages/dashboard-polish.test.js`, `resources/js/pages/admin-jurusan/up-jurusan/index.test.js`, `resources/js/pages/admin-jurusan/up-jurusan/show.test.js`, `resources/js/pages/admin/settings/delivery-fee.test.js`
- Test: `tests/Feature/OrderSettlementServiceTest.php` (tambah smoke: approve→sync→status konsisten)

**Interfaces:**
- Consumes: `OrderSettlementService::sync(Order $order): void`
- Produces: Nol referensi `OrderStatusSync`; suite tetap hijau.

- [ ] **Step 1: Verifikasi dead code (bukti, bukan asumsi)**

Run: `grep -rn "NotificationHrefBackfill" app/ routes/ config/ database/ tests/`
Expected: hanya definisi kelas → aman dihapus. Jika ada pemakai, batalkan penghapusan file itu saja.

- [ ] **Step 2: Ganti alias per call-site**

```php
// sebelum:
OrderStatusSync::sync($current->order);
// sesudah:
OrderSettlementService::sync($current->order);
```

Hapus `use App\Support\OrderStatusSync;`, pastikan `use App\Support\OrderSettlementService;` ada.

- [ ] **Step 3: Hapus file alias + test.js yatim**

```bash
git rm app/Support/OrderStatusSync.php
git rm resources/js/pages/dashboard-polish.test.js resources/js/pages/admin-jurusan/up-jurusan/index.test.js resources/js/pages/admin-jurusan/up-jurusan/show.test.js resources/js/pages/admin/settings/delivery-fee.test.js
```

Jika `.test.js` ternyata dibutuhkan tim FE, pindahkan ke `tests/` yang sesuai alih-alih hapus — catat di pesan commit.

- [ ] **Step 4: Jalankan suite terkait**

Run: `php artisan test --filter="OrderSettlement|PaymentRejectRecovery|OrderCancellation"`
Expected: PASS

- [ ] **Step 5: Verifikasi standar + static analysis**

Run: `vendor/bin/pint --test`
Run: `php -d memory_limit=1G vendor/bin/phpstan analyse --no-progress`
Expected: keduanya PASS / no errors untuk file tersentuh

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: hapus dead code dan inline OrderStatusSync yang deprecated"
```

---

## Self-Review

**1. Spec coverage:** F-01→Task 1; F-02→Task 2; F-03→Task 3; F-04→Task 4; F-06+F-07→Task 5; F-05 dicatat sebagai hardening lanjutan (tidak dijadikan task agar plan tetap kecil — boleh jadi follow-up); F-08 dicatat tanpa task lintas-DB.

**2. Placeholder scan:** Tidak ada TBD/TODO/"handle edge cases" generik — setiap langkah punya kode/perintah eksak.

**3. Type consistency:** `OrderItemStatus::Sent/Completed`, `PaymentStatus::Paid/Unpaid`, `OrderSettlementService::sync(Order)` konsisten di semua task; nama test filter sesuai nama `it()`.

## Execution Handoff

Plan lengkap dan tersimpan di `docs/superpowers/plans/2026-09-09-code-hardening.md`. Dua opsi eksekusi:

**1. Subagent-Driven (recommended)** — dispatch subagen baru per task, review antar task, iterasi cepat.

**2. Inline Execution** — eksekusi task di sesi ini dengan checkpoint review.

**Pilih pendekatan mana?**
