# Buyer Account Profile (Tokopedia-style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pisah page profile buyer ke file/komponen/layout sendiri (URL tetap `/settings/profile`) dan redesign ala Tokopedia.

**Architecture:** `ProfileController@edit` branching by role ke `account/index` vs `settings/profile`; buyer pakai `AppHeaderLayout`, komponen baru di `resources/js/components/account/*` + pages di `resources/js/pages/account/*`.

**Tech Stack:** Laravel (PHP), Inertia 3, React 19 + TypeScript, Tailwind 4, Pest, Playwright, Bun, Wayfinder (auto-generated routes, jangan edit manual).

**Spec:** `docs/superpowers/specs/2026-09-05-buyer-account-profile-design.md`

## Global Constraints

- URL tetap `/settings/profile` (route name `profile.edit` tidak berubah, tidak ada redirect baru).
- Tidak ada migrasi DB di v1.
- Token warna existing dipertahankan: `#0080FF`, `#EFF8FF`, `#BCE0FF`, rounded `[14px]`, slate text.
- Buyer layout: `max-w-3xl` centered, mobile-first, `BuyerBottomNavSpacer` tidak boleh hilang.
- `resources/js/routes/*` adalah output Wayfinder — jangan edit manual.
- Alamat v1 = disabled "Segera hadir", tidak boleh 404.
- `PATCH settings/profile` / validasi `ProfileUpdateRequest` tidak berubah.

---

## File Map

- Backend ubah: `app/Http/Controllers/Settings/ProfileController.php`
- Backend test: `tests/Feature/Settings/BuyerAccountProfileTest.php` (baru)
- Frontend buat: `resources/js/pages/account/index.tsx`, `resources/js/pages/account/profile-detail.tsx`, `resources/js/components/account/account-header.tsx`, `resources/js/components/account/shop-shortcuts.tsx`, `resources/js/components/account/order-status-strip.tsx`, `resources/js/components/account/menu-group.tsx`, `resources/js/components/account/seller-cta.tsx`, `resources/js/components/account/account-menu-config.ts`
- Frontend ubah: `resources/js/pages/settings/profile.tsx`, `resources/js/layouts/settings/layout.tsx`
- Frontend hapus: `resources/js/components/settings/buyer-profile.tsx`
- Existing reuse tanpa ubah: `resources/js/components/delete-user.tsx`, `resources/js/components/buyer-bottom-nav.tsx`, `resources/js/layouts/app/app-header-layout.tsx`

---

### Task 1: Backend — `accountSummary` + branch komponen per-role

**Files:**
- Modify: `app/Http/Controllers/Settings/ProfileController.php`
- Test: `tests/Feature/Settings/BuyerAccountProfileTest.php`

**Interfaces:**
- Consumes: `CartItem`, `Wishlist`, `Order` + enums `OrderStatus`, `PaymentStatus`, `OrderItemStatus`; `UserRole::Buyer`.
- Produces: `ProfileController::accountSummary(User $user): array{cart_count:int,wishlist_count:int,orders_total:int,orders_by_status:array{unpaid:int,packing:int,shipping:int,done:int}}` dan render `account/index` untuk buyer dengan prop `accountSummary`.

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Enums\UserRole;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('buyer gets account page with summary', function () {
    $user = User::factory()->create(['role' => UserRole::Buyer]);

    $this->actingAs($user)->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('account/index')
            ->has('accountSummary', fn (Assert $s) => $s
                ->has('cart_count')
                ->has('wishlist_count')
                ->has('orders_total')
                ->has('orders_by_status')
            ));
});

test('non-buyer keeps settings page', function () {
    $user = User::factory()->create(['role' => UserRole::Seller]);

    $this->actingAs($user)->get(route('profile.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/profile'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test tests/Feature/Settings/BuyerAccountProfileTest.php`
Expected: FAIL — `component 'account/index' not found` (masih `settings/profile`, belum ada `accountSummary`).

- [ ] **Step 3: Write minimal implementation**

```php
public function edit(Request $request): Response
{
    $user = $request->user();

    if ($user->role === UserRole::Buyer) {
        return Inertia::render('account/index', [
            'status' => $request->session()->get('status'),
            'accountSummary' => $this->accountSummary($user),
        ]);
    }

    return Inertia::render('settings/profile', [
        'status' => $request->session()->get('status'),
    ]);
}

/**
 * @return array{cart_count:int,wishlist_count:int,orders_total:int,orders_by_status:array{unpaid:int,packing:int,shipping:int,done:int}}
 */
private function accountSummary(User $user): array
{
    try {
        $ordersTotal = Order::query()->where('user_id', $user->id)->count();
        $unpaid = Order::query()->where('user_id', $user->id)
            ->where('payment_status', PaymentStatus::Unpaid->value)->count();
        $packing = OrderItem::query()->whereHas('order',
                fn ($q) => $q->where('user_id', $user->id))
            ->where('status', OrderItemStatus::Packed->value)->count();
        $shipping = OrderItem::query()->whereHas('order',
                fn ($q) => $q->where('user_id', $user->id))
            ->where('status', OrderItemStatus::Sent->value)->count();
        $done = Order::query()->where('user_id', $user->id)
            ->where('status', OrderStatus::Completed->value)->count();

        return [
            'cart_count' => CartItem::query()->where('user_id', $user->id)->count(),
            'wishlist_count' => Wishlist::query()->where('user_id', $user->id)->count(),
            'orders_total' => (int) $ordersTotal,
            'orders_by_status' => [
                'unpaid' => (int) $unpaid,
                'packing' => (int) $packing,
                'shipping' => (int) $shipping,
                'done' => (int) $done,
            ],
        ];
    } catch (\Throwable $e) {
        report($e);

        return [
            'cart_count' => 0, 'wishlist_count' => 0, 'orders_total' => 0,
            'orders_by_status' => ['unpaid' => 0, 'packing' => 0, 'shipping' => 0, 'done' => 0],
        ];
    }
}
```

Catatan: tambah import `App\Enums\OrderItemStatus`, `OrderStatus`, `PaymentStatus`, `UserRole`, `App\Models\CartItem`, `Order`, `OrderItem`, `Wishlist`, `App\Models\User`. Jika nama kolom `payment_status`/`status` berbeda di `orders`, sesuaikan dengan migrasi aktual (cek `database/migrations/*orders*`) — JANGAN tebak, baca dulu.

- [ ] **Step 4: Run test to verify it passes**

Run: `php artisan test tests/Feature/Settings/BuyerAccountProfileTest.php tests/Feature/Settings/ProfileUpdateTest.php`
Expected: PASS semua.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Settings/ProfileController.php tests/Feature/Settings/BuyerAccountProfileTest.php
git commit -m "feat(account): branch buyer profile to account/index with summary"
```

---

### Task 2: Komponen presentational `components/account/*` + menu config

**Files:**
- Create: `resources/js/components/account/account-menu-config.ts`
- Create: `resources/js/components/account/account-header.tsx`
- Create: `resources/js/components/account/shop-shortcuts.tsx`
- Create: `resources/js/components/account/order-status-strip.tsx`
- Create: `resources/js/components/account/menu-group.tsx`
- Create: `resources/js/components/account/seller-cta.tsx`

**Interfaces:**
- Consumes: `auth.user: {name,email,phone,role}`, `accountSummary` dari Task 1; `NavItem['href']`; route helpers `ordersIndex`, `wishlistIndex`, `cartIndex`, `securityEdit`.
- Produces: `AccountHeader({name,email,phone,onOpen}: {name:string;email:string;phone:string|null;onOpen:()=>void})`, `ShopShortcuts({summary})`, `OrderStatusStrip({summary})`, `MenuGroup({title,items:{label,description,href,icon,disabled?,badge?}[]})`, `SellerCta()`, `ACCOUNT_MENU` config.

- [ ] **Step 1: Write the failing check (types)**

Buat file `account-menu-config.ts` dulu dengan isi final:

```ts
import { cartIndex } from '@/routes/cart';
import { index as ordersIndex } from '@/routes/orders';
import { edit as securityEdit } from '@/routes/security';
import { index as wishlistIndex } from '@/routes/wishlist';

export type AccountSummary = {
    cart_count: number;
    wishlist_count: number;
    orders_total: number;
    orders_by_status: { unpaid: number; packing: number; shipping: number; done: number };
};

export const ACCOUNT_MENU = {
    shortcuts: (s: AccountSummary) => [
        { key: 'orders', label: 'Pesanan', count: s.orders_total, href: ordersIndex() },
        { key: 'wishlist', label: 'Wishlist', count: s.wishlist_count, href: wishlistIndex() },
        { key: 'cart', label: 'Keranjang', count: s.cart_count, href: cartIndex() },
    ],
    orderStrip: (s: AccountSummary) => [
        { key: 'unpaid', label: 'Belum Bayar', count: s.orders_by_status.unpaid },
        { key: 'packing', label: 'Dikemas', count: s.orders_by_status.packing },
        { key: 'shipping', label: 'Dikirim', count: s.orders_by_status.shipping },
        { key: 'done', label: 'Selesai', count: s.orders_by_status.done },
    ],
    accountGroup: () => [
        { key: 'profil', label: 'Profil', description: 'Nama, email, WhatsApp', href: '?section=profil' as unknown as never, action: 'open-profile' as const },
        { key: 'alamat', label: 'Alamat', description: 'Segera hadir', href: '?section=profil' as unknown as never, disabled: true },
        { key: 'keamanan', label: 'Keamanan', description: 'Password & verifikasi', href: securityEdit() },
    ],
};
```

Lalu buat 5 komponen `.tsx` sebagai stub kosong yang me-render `<div/>` saja.

- [ ] **Step 2: Run check to verify it fails**

Run: `bunx tsc --noEmit 2>&1 | head -n 30`
Expected: FAIL — error `AccountHeader/ShopShortcuts/... missing required props` karena stub belum sesuai interface (atau import di page belum ada — itu yang kita mau).

- [ ] **Step 3: Write minimal implementation (final, bukan stub)**

`account-header.tsx` — kartu gradient biru, klik → `onOpen`:

```tsx
import { ChevronRight, Mail, Phone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function AccountHeader({ name, email, phone, avatar, onOpen }: {
    name: string; email: string; phone: string | null; avatar?: string | null; onOpen: () => void;
}) {
    const getInitials = useInitials();
    return (
        <button type="button" onClick={onOpen}
            className="w-full overflow-hidden rounded-[14px] border border-slate-200 bg-white text-left shadow-[0_1px_2px_rgba(15,23,42,0.05)] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none">
            <div className="bg-gradient-to-r from-[#0080FF] to-[#0059B8] px-4 pt-5 pb-10 sm:px-5">
                <div className="flex items-center gap-3">
                    <Avatar className="size-14 shrink-0 rounded-full border-2 border-white/70 bg-white">
                        <AvatarImage src={avatar ?? undefined} alt={name} />
                        <AvatarFallback className="rounded-full bg-[#EFF8FF] text-base font-semibold text-[#0080FF]">{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-white">{name}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-blue-100"><Mail className="size-3 shrink-0" />{email}</p>
                        {phone && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-blue-100"><Phone className="size-3 shrink-0" />{phone}</p>}
                    </div>
                    <span className="hidden shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/30 sm:inline-flex">Buyer</span>
                    <ChevronRight className="size-5 shrink-0 text-white/80" aria-hidden />
                </div>
            </div>
            <div className="px-4 py-3 sm:px-5"><p className="text-xs font-medium text-slate-500">Ketuk untuk lihat & ubah profil</p></div>
        </button>
    );
}
```

`shop-shortcuts.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import { Heart, PackageCheck, ShoppingCart } from 'lucide-react';
import { ACCOUNT_MENU, type AccountSummary } from './account-menu-config';

const ICONS = { orders: PackageCheck, wishlist: Heart, cart: ShoppingCart } as const;

export function ShopShortcuts({ summary }: { summary: AccountSummary }) {
    const items = ACCOUNT_MENU.shortcuts(summary);
    return (
        <div className="grid grid-cols-3 gap-2.5">
            {items.map((item) => {
                const Icon = ICONS[item.key as keyof typeof ICONS];
                return (
                    <Link key={item.key} href={item.href}
                        className="relative flex flex-col items-center gap-1.5 rounded-[12px] border border-slate-200 bg-white px-2 py-3.5 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#BCE0FF] hover:text-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none">
                        {item.count > 0 && (
                            <span className="absolute top-2 right-2 min-w-5 rounded-full bg-[#0080FF] px-1 text-center text-[10px] leading-4 font-bold text-white">{item.count > 99 ? '99+' : item.count}</span>
                        )}
                        <span className="grid size-9 place-items-center rounded-full bg-[#EFF8FF] text-[#0080FF]"><Icon className="size-4" /></span>
                        <span className="text-xs font-semibold">{item.label}</span>
                        <span className="text-[11px] text-slate-500 tabular-nums">{item.count}</span>
                    </Link>
                );
            })}
        </div>
    );
}
```

`order-status-strip.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { index as ordersIndex } from '@/routes/orders';
import { ACCOUNT_MENU, type AccountSummary } from './account-menu-config';

export function OrderStatusStrip({ summary }: { summary: AccountSummary }) {
    const items = ACCOUNT_MENU.orderStrip(summary);
    return (
        <section aria-label="Pesanan saya" className="rounded-[14px] border border-slate-200 bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <Link href={ordersIndex()} className="flex items-center justify-between rounded-[10px] px-3 py-2.5 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none">
                <span className="text-sm font-bold text-slate-900">Pesanan Saya</span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500">Lihat semua <ChevronRight className="size-3.5" /></span>
            </Link>
            <div className="grid grid-cols-4 gap-1">
                {items.map((s) => (
                    <Link key={s.key} href={ordersIndex()}
                        className="flex flex-col items-center gap-1 rounded-[10px] px-1 py-2.5 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none">
                        <span className="text-sm font-bold text-slate-900 tabular-nums">{s.count > 99 ? '99+' : s.count}</span>
                        <span className="text-[11px] font-medium text-slate-500">{s.label}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
```

`menu-group.tsx`:

```tsx
import { Link } from '@inertiajs/react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { NavItem } from '@/types';

export type MenuRow = { key: string; label: string; description: string; href?: NavItem['href']; icon: LucideIcon; disabled?: boolean; onClick?: () => void };

export function MenuGroup({ title, items }: { title: string; items: MenuRow[] }) {
    return (
        <section aria-label={title} className="rounded-[14px] border border-slate-200 bg-white py-1 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
            <h2 className="px-4 pt-3 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">{title}</h2>
            {items.map((item) => {
                const Icon = item.icon;
                const cls = 'flex items-center gap-3 rounded-[12px] px-3 py-3 transition focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none ' + (item.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-50');
                const inner = (
                    <>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"><Icon className="size-4" /></span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">{item.label}</span>
                            <span className="block truncate text-xs text-slate-500">{item.description}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-slate-400" aria-hidden />
                    </>
                );
                if (item.disabled || !item.href) {
                    return <button key={item.key} type="button" disabled={item.disabled} onClick={item.onClick} aria-disabled={item.disabled} className={cls}>{inner}</button>;
                }
                return <Link key={item.key} href={item.href} onClick={item.onClick ? (e) => { e.preventDefault(); item.onClick?.(); } : undefined} className={cls}>{inner}</Link>;
            })}
        </section>
    );
}
```

`seller-cta.tsx` — pindah dari `buyer-profile.tsx` apa adanya (Store icon + copy "Ajukan jadi seller" + Button ke `/seller-application`), bungkus Card yang sama.

- [ ] **Step 4: Run check to verify it passes**

Run: `bunx tsc --noEmit && bunx eslint resources/js/components/account/ --fix`
Expected: PASS (no errors).

- [ ] **Step 5: Commit**

```bash
git add resources/js/components/account/
git commit -m "feat(account): add tokopedia-style presentational components"
```

---

### Task 3: Pages `account/index` + `account/profile-detail` + wiring `?section=profil`

**Files:**
- Create: `resources/js/pages/account/index.tsx`
- Create: `resources/js/pages/account/profile-detail.tsx`

**Interfaces:**
- Consumes: komponen Task 2 + `auth.user` + `accountSummary: AccountSummary`; `router`, `Form`, `ProfileController.update.form()`; query `?section=profil` via `usePage().url` atau `new URLSearchParams`.
- Produces: default export `AccountIndex` (Inertia component `account/index`) dan `ProfileDetail` yang dipakai kondisional di dalam index (TANPA route baru).

- [ ] **Step 1: Write the failing test (e2e smoke)**

Buat `tests/e2e/account-profile.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('buyer sees tokopedia-style account', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('buyer@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /log in|masuk/i }).click();
    await page.goto('/settings/profile');
    await expect(page.getByRole('heading', { name: /akun saya|pesanan saya/i }).first()).toBeVisible();
    await expect(page.getByText('Pesanan', { exact: true }).first()).toBeVisible();
});
```

(Data user disesuaikan dengan seeder lokal; jika tidak ada buyer@example.com, buat via factory di `beforeEach` — JANGAN hardcode tanpa cek.)

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx playwright test tests/e2e/account-profile.spec.ts`
Expected: FAIL — heading tidak ketemu (page lama belum diganti).

- [ ] **Step 3: Write minimal implementation**

`index.tsx`:

```tsx
import { Head, router, usePage } from '@inertiajs/react';
import { CircleHelp, FileText, Info, MapPin, ShieldCheck, UserRound, LogOut } from 'lucide-react';
import { useState } from 'react';
import { AccountHeader } from '@/components/account/account-header';
import { ACCOUNT_MENU, type AccountSummary } from '@/components/account/account-menu-config';
import { MenuGroup } from '@/components/account/menu-group';
import { OrderStatusStrip } from '@/components/account/order-status-strip';
import { SellerCta } from '@/components/account/seller-cta';
import { ShopShortcuts } from '@/components/account/shop-shortcuts';
import DeleteUser from '@/components/delete-user';
import { logout } from '@/routes';
import { edit as securityEdit } from '@/routes/security';
import ProfileDetail from './profile-detail';
import type { Auth } from '@/types';

export default function AccountIndex({ accountSummary }: { accountSummary: AccountSummary }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const url = usePage().url;
    const isDetail = new URLSearchParams(url.split('?')[1] ?? '').get('section') === 'profil';
    const [loggingOut, setLoggingOut] = useState(false);
    const user = auth.user!;
    const openDetail = () => router.get('/settings/profile', { section: 'profil' }, { preserveState: true, preserveScroll: false });

    if (isDetail) return (<><Head title="Profil saya" /><ProfileDetail /></>);

    return (
        <>
            <Head title="Akun saya" />
            <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 sm:px-6">
                <AccountHeader name={user.name} email={user.email} phone={user.phone} avatar={user.avatar} onOpen={openDetail} />
                <ShopShortcuts summary={accountSummary} />
                <OrderStatusStrip summary={accountSummary} />
                <MenuGroup title="Akun saya" items={[
                    { key: 'profil', label: 'Profil', description: 'Nama, email, WhatsApp', icon: UserRound, onClick: openDetail },
                    { key: 'alamat', label: 'Alamat', description: 'Segera hadir', icon: MapPin, disabled: true },
                    { key: 'keamanan', label: 'Keamanan', description: 'Password & verifikasi', icon: ShieldCheck, href: securityEdit() },
                ]} />
                <MenuGroup title="Bantuan & info" items={[
                    { key: 'bantuan', label: 'Pusat Bantuan', description: 'FAQ & hubungi kami', icon: CircleHelp, href: '/settings/profile' as never },
                    { key: 'kebijakan', label: 'Kebijakan', description: 'Syarat & privasi', icon: FileText, href: '/settings/profile' as never },
                    { key: 'tentang', label: 'Tentang EduCart', description: 'Versi aplikasi', icon: Info, href: '/settings/profile' as never },
                ].map((r) => ({ ...r, disabled: true }))} />
                <SellerCta />
                <MenuGroup title="Lainnya" items={[
                    { key: 'keluar', label: loggingOut ? 'Keluar...' : 'Keluar', description: 'Keluar dari akun ini', icon: LogOut, onClick: () => { if (loggingOut) return; router.flushAll(); setLoggingOut(true); router.post(logout().url, {}); } },
                ]} />
                <DeleteUser />
            </div>
        </>
    );
}

AccountIndex.layout = null;
```

Catatan: `AccountIndex.layout = null` agar TIDAK dibungkus `SettingsLayout` — buyer pakai `AppHeaderLayout` global. Jika app memakai layout default otomatis, pastikan tidak double-wrap. `ACCOUNT_MENU` yang `accountGroup` boleh tidak dipakai langsung — definisi grup inline di atas adalah sumber final (hapus yang tak terpakai saat lint).

`profile-detail.tsx` — pindah form dari `buyer-profile.tsx` apa adanya: Avatar ringkas + `Form {...ProfileController.update.form()}` (name/email/phone) + tombol back `router.get('/settings/profile')` + `DeleteUser`. (Copy 1:1 dari file lama, hanya ganti judul Head → "Profil saya" dan tambah tombol Kembali di atas.)

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx tsc --noEmit && bunx eslint resources/js/pages/account/ --fix && bunx playwright test tests/e2e/account-profile.spec.ts`
Expected: PASS (atau minimal types+lint PASS; e2e PASS setelah user seed benar).

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/account/ tests/e2e/account-profile.spec.ts
git commit -m "feat(account): add buyer index and profile detail pages"
```

---

### Task 4: Cleanup — non-buyer murni settings + hapus file lama + verifikasi akhir

**Files:**
- Modify: `resources/js/pages/settings/profile.tsx`
- Modify: `resources/js/layouts/settings/layout.tsx`
- Delete: `resources/js/components/settings/buyer-profile.tsx`

**Interfaces:**
- Consumes: `ProfileForm` existing; `SettingsLayout` tanpa branch buyer.
- Produces: `settings/profile` hanya untuk non-buyer; tidak ada import buyer tersisa (`grep -r buyer-profile` kosong).

- [ ] **Step 1: Write the failing check**

```bash
grep -rn "buyer-profile\|BuyerProfile" resources/js --include="*.tsx" --include="*.ts"
```

Saat ini MASIH ada hasil (di `pages/settings/profile.tsx`) — itu FAIL yang diharapkan sebelum cleanup.

- [ ] **Step 2: Run check to confirm leftover exists**

Run: perintah di atas.
Expected: FAIL (ditemukan 2+ hasil) — bukti cleanup belum dilakukan.

- [ ] **Step 3: Write minimal implementation**

`pages/settings/profile.tsx` final:

```tsx
import { Head } from '@inertiajs/react';
import ProfileForm from '@/components/settings/profile-form';
import { edit } from '@/routes/profile';

export default function Profile() {
    return (
        <>
            <Head title="Pengaturan profil" />
            <h1 className="sr-only">Pengaturan profil</h1>
            <ProfileForm />
        </>
    );
}

Profile.layout = { breadcrumbs: [{ title: 'Pengaturan profil', href: edit() }] };
```

`layouts/settings/layout.tsx`: hapus blok `if (component === 'settings/profile' && isBuyer)` + variabel `isBuyer`/`component` yang tak terpakai; hapus juga conditional `cn(... isBuyer ...)` → kembalikan ke class statis non-buyer. Lalu: `git rm resources/js/components/settings/buyer-profile.tsx`.

- [ ] **Step 4: Run verification to confirm it passes**

Run: `grep -rn "buyer-profile\|BuyerProfile" resources/js --include="*.tsx" --include="*.ts"; echo "grep-exit:$?"; bunx tsc --noEmit; bunx eslint resources/js/pages/settings/ resources/js/layouts/settings/ --fix; php artisan test tests/Feature/Settings/`
Expected: grep exit 1 (kosong = PASS), tsc PASS, eslint PASS, Pest PASS.

- [ ] **Step 5: Commit**

```bash
git add resources/js/pages/settings/profile.tsx resources/js/layouts/settings/layout.tsx
git rm resources/js/components/settings/buyer-profile.tsx
git commit -m "refactor(settings): isolate non-buyer profile, remove buyer branch"
```

---

## Self-Review (penulis plan)

1. **Spec coverage:** Task 1 → data+branch; Task 2 → komponen Tokopedia; Task 3 → pages+detail; Task 4 → isolasi non-buyer. Alamat coming-soon, `?section=profil`, seller-CTA, logout, hapus-akun semua ter-cover. Filter `/orders?status=` eksplisit non-goal.
2. **Placeholder scan:** tidak ada TBD/TODO/"nanti diisi" — kode blok final, perintah run exact, kolom DB diberi instruksi cek migrasi.
3. **Type consistency:** `AccountSummary` didefinisikan sekali di `account-menu-config.ts`, dipakai di Task 2+3; `MenuRow.href` pakai `NavItem['href']`; controller return type match interface.
