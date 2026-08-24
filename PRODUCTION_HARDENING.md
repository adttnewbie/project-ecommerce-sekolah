# Production Hardening — Final Pass

Date: 2026-08-02 · Repo: project-ecommerce-sekolah

This document captures the hardening work shipped in this pass, the results of the four audits, the production checklist, remaining technical debt, and anything still blocking release.

## 1. Implemented (6 items)

All six items are implemented and covered by tests. `php artisan test` = 456 passed / 2 skipped / 0 failed; PHPStan 0 errors; ESLint, Prettier, and `tsc` clean.

1. **Max unpaid orders per buyer** — `CheckoutController::assertUnderUnpaidOrderLimit()` enforces `MAX_UNPAID_ORDERS = 5` counting open+unpaid orders (excluding Cancelled/Completed). The check runs **inside** the order-creation transaction after locking the buyer's `User` row, closing the TOCTOU window where two concurrent checkouts could both pass the cap. Tests cover at-limit block, under-limit allow, and cancelled/completed exclusion (`tests/Feature/CheckoutTest.php`).
2. **Scheduled command system-actor fallback** — `ExpireUnpaidOrdersCommand` now resolves the first admin, falling back to `App\Support\SystemActor::getOrCreate()` which bootstraps a deterministic `system-actor@<host>` admin instead of failing when a schedule-only host has no admin. `routes/console.php` schedules `orders:expire-unpaid` + `orders:detect-stuck` hourly. Tests: `tests/Feature/SystemActorFallbackTest.php`.
3. **Rate limiting for payout endpoints** — `FortifyServiceProvider` registers a `payout` limiter (5 req/min, keyed by `user->id ?? ip`); the route is throttled (`routes/web.php`). Test in `ConsignmentPayoutTest`.
4. **Disable payout button after submit** — payout form now uses `useForm`; the submit button and both inputs are disabled while `processing`, with a `Loader2` spinner and "Memproses..." label (`show.tsx`).
5. **Disable duplicate frontend submissions** — the pending-approval approve form and reject dialog use `<Form disableWhileProcessing>`; payout uses guarded `processing` state; double-submit is suppressed on the client and made safe server-side by the row-locked payout (`ConsignmentPayoutService`).
6. **Improve retry safety** — `CheckoutController::createOrderWithRetry()` wraps order creation in a per-attempt transaction and retries on the SQLSTATE 23000 code-collision, with randomized jitter (`TransactionCode::unique` and `AdminCategoryController` slug retries) so concurrent colliders don't stay lockstepped.

### Bugs fixed while hardening
- **Test command-execution bug** — `assertExitCode()` only records an expectation; the command actually runs in `PendingCommand::__destruct()`. Keeping the `PendingCommand` in a variable deferred execution until teardown, so `SystemActorFallbackTest` asserted on not-yet-cancelled orders. Fixed with `->run()` + explicit `assertSame(0, ...)`.
- **PHPStan (4)** — docblock iterable types on `createOrderWithRetry`, redundant nullsafe in the payout limiter, and `static::` → `self::` for private `bootstrap()`.
- **CI lint/format** — `graphify.js` (curly/padding), `show.tsx` top-level type import, and two Prettier files.
- **Command description typo** `"unpaid paid orders"` → `"unpaid orders"`.

---

## 2. Audit — Remaining races

| # | Severity | Location | Hazard | Recommendation |
|---|----------|----------|--------|----------------|
| RC-1 | **High** | `OrderLivenessService::expireUnpaidOrders` (pre-reads unpaid items) + `OrderItemCancellation::cancelItemWithinTransaction` (locks but only guards `status === Cancelled`) + `PaymentTransitionService::approve` (locks item, doesn't guard terminal status) | Expiry job racing a concurrent payment/approval on the same item can produce a *paid-and-cancelled* item with a double restock and wrong payout basis (either interleaving). The re-lock serializes rows but the guards are incomplete. | Re-validate `payment_status === Unpaid` on the **locked** read inside `cancelItemWithinTransaction` and abort cancellation otherwise; reject payment approve when item status is terminal. |
| RC-2 | **Med** | `ConsignmentTransitionService::receive()` + `PicketUpJurusanConsignmentController::receive` | Read-modify-write on `received_quantity` with no `lockForUpdate` → lost update and can over-receive past `requested_quantity`. | Re-fetch the consignment with `lockForUpdate()->findOrFail()` inside the transaction before `receive`. |
| RC-3 | **Med** | `PicketUpJurusanConsignmentController::storeSale` / `storeReport` unique-code create | POS sale/report codes use `TransactionCode::unique` probe (can't see uncommitted rows) → concurrent same-UJ inserts can collide with SQLSTATE 23000 → 500, unlike checkout which retries. | Wrap creates in the `createOrderWithRetry` 23000-retry pattern; `up_daily_report_unique` needs an upsert or locked existence guard. |
| RC-4 | **Low** | `AdminJurusanConsignmentController::approve/reject/cancel` | Transition writes run against the route-bound (unlocked) model; concurrent approve+reject is last-writer-wins. Status guards reduce impact. | `lockForUpdate` + revalidate status inside the transition. |

**Fixed during this pass:** RC-to-be on checkout unpaid-order limit (TOCTOU) and POS single-item `release()` lost-update on `sold_quantity` (now `lockForUpdate` + re-auth like `storeSale`).

**Non-issues confirmed:** `ConsignmentPayoutService` (locks + recomputes balance under lock, idempotent); cancellation/restock double-restock guard.

## 3. Audit — Remaining N+1

| Severity | Location | Fix |
|----------|----------|-----|
| N1-1 **High** | `SellerConsignmentController::index` | ~4 `SUM` queries per consignment (`sellerEarningsFromOutMovements` + `paidPayoutAmount` + `unpaidSellerAmount` re-runs both) over an unpaginated list. Collapse to 2 grouped aggregates keyed by `up_jurusan_consignment_id`. |
| N1-2 **Med** | `ActorLifecycle::userHasUnpaidPayouts` / `upJurusanHasUnpaidPayouts` | Loops `unpaidSellerAmount()` (2 SUMs) per consignment. Replace with a single grouped/join query. |
| N1-3 **Med** | `AdminOrderController::index` | Per-row `livenessLabel` → 3 `EXISTS` subqueries per order (bounded by pagination, ~30 extra/page). Compute the ID sets once per page. |
| N1-4 **Med** | `OrderLivenessService::detectAndMarkStuck` | Unbounded loop each calling 3 EXISTS subqueries. Batch via one set-based pass. |

## 4. Audit — Remaining null dereferences

| Severity | Location |
|----------|----------|
| NULL-1 **Med** | `PicketUpJurusanConsignmentController` POS `ownerName` accesses `upJurusan->name` / `seller->name`. The `products_owner_xor_chk` guarantee is enforced **only on PostgreSQL**; on MySQL/SQLite a legacy/orphaned product with both owner FKs null throws. The model phpdoc marks these non-null (verified by PHPStan), so keep the invariant or add a DB CHECK for non-Postgres. Use nullsafe with a fallback if legacy rows are possible. |

Everything else reviewed (MoneyCalculationService, ConsignmentTransition/Payout, ReportAggregationService, OrderSettlement/PaymentSync, AdminJurusan* controllers, CheckoutController) is guarded by null-safe operators or backed by **NOT NULL** FKs. `category_id`, `seller_id`/`up_jurusan_id` on consignments, and `admin_jurusan_id` (upJurusan) are audited non-null.

## 5. Audit — Remaining unbounded queries

| Severity | Location | Fix |
|----------|----------|-----|
| U-1 **High** | `OrderLivenessService::expireUnpaidOrders` does `.get()` over all system-wide expired orders + items | `chunkById()` + one cancellation passes. |
| U-2 **High** | `detectStuckOrders` materializes all stuck+expired with items | `chunkById()`. |
| U-3 **High** | `SellerOrderController::index` pulls the entire seller order item + stock-movement history then paginates in PHP | Push `paginate()`/`LIMIT` + merge only page boundaries. |
| U-4 **Med** | `AdminDashboardController` loads 8 months of orders to group in PHP | SQL `GROUP BY`/snapshot. |
| U-5 **Med** | `ReportAggregationService` revenue/count methods `.get()` full rows then sum/count | `SUM()/COUNT(DISTINCT)` in SQL. |
| U-6 **Med** | `BuyerCatalogController` returns the full approved catalog unpaginated | `paginate()` + front-load counts. |

---

## 6. Production Checklist

**Before going live**
- [ ] Set `APP_ENV=production`, `APP_DEBUG=false`, generate `APP_KEY`, real `APP_URL`.
- [ ] Use Postgres  production and verify `products_owner_xor` / unique indexes exist (POS code + daily report uniques are load-bearing).
- [ ] Run `php artisan migrate --force` and verify the scheduler runs via `php artisan schedule:work` or a server cron entry:
      `* * * * * cd /path && php artisan schedule:run >> /dev/null 2>&1`
- [ ] Run `queue:worker` with restart-on-deploy; confirm the worker has no queues skipped.
- [ ] Set `queue` driver to `database`/`redis` (not `sync`) and add retry/backoff.
- [ ] Frontend: `bun run build` and serve built assets with the CDN/asset `app.url`.
- [ ] Run `composer run ci:check` (pint, eslint, prettier, tsc, phpstan, tests) green on CI.
- [ ] Configure Horizon/supervisor with process count > 1 → directive: **lock leaks: scheduler must run; if no admin user exists the SystemActor bootstrap is the safety net.**
- [ ] Set CORS, security headers, and `APP_ENV`-gated `storage:link`.
- [ ] Configure error reporting (Sentry/Telescope/Papertrail) and log leftover stuck/failed jobs.

**Operations / go-live watch-outs**
- [ ] Verify `orders:expire-unpaid` + `orders:detect-stuck` actually run hourly and are idempotent against the RC-1 race.
- [ ] Monitor `payout` limiter (5/min) — confirm no legitimate power-user is rate-limited.
- [ ] Confirm the scheduled commands run on a host that can *bootstrap a User* (DB + table present).

---

## 7. Remaining technical debt

1. **RC-1 expiry-vs-payment race** — the single most important remaining correctness issue; needs the guarded transition changes before trusting automated expiry.
2. **N1-1 / U-catalog / U-order-pagination** — high-impact query/perf debt on seller consignments, public catalog, seller orders.
3. **U-1/U-2 unbounded job materialization** — memory/O(n) cron growth; `chunkById` is the standard fix.
4. **POS code collision retry (RC-3)** — should match checkout's retry pattern.
5. **`receive()`/admin transitions** not row-locked (RC-2/RC-4) and report-first-create uniqueness.
6. **PG-only `products_owner_xor_chk`** — on non-Postgres DB the owner-invariant null-safety depends on the model's declaration only (NULL-1).
7. **Dashboard/report aggregation in PHP** — move to SQL/Snap coverage.
8. **Test drift** — 2 tests skipped; `PerformanceBenchmarkTest` logs raw movements that should be a real assertion.

---

## 8. Blocking release

1. **Database schema on the production engine** — if it's MySQL/SQLite, non-Postgres CHECKs are dropped (owner XOR, and any CHECK) → rely on app-level contracts only. Confirm the engine matches the invariant.
2. **Scheduler availability** — the app depends on `schedule:run` for expiry + stuck detection; without it, unpaid/medium-stuck orders go unactioned. The SystemActor fallback fixes attribution only, not scheduling.
3. **Queue worker for financial MTA** — ensure the financial/consignment transitions found by the audits run in a worker, and that **at-least-once** side effects (restock/payout) are idempotent (they are guarded; expiry race RC-1 is the exception).
4. **RC-1** is considered a release governor until resolved: automated expiry racing a human payment can corrupt sellable + money state. Either land the locked-revalidation fix or disable auto-expiry on first ship.
---

## 9. Hotfix — 2026-08-24 (Fase 1)

### Fixed

1. **C1 — Checkout seller products crashed in production (500 + rollback).** `AdminOrderNotify` read `$event->buyerName`/`$event->totalPrice`, which never existed on `PendingOrderCreated`. Laravel converts the resulting E_WARNING into an `ErrorException` inside the checkout transaction, rolling back every seller-product purchase whenever an admin user existed (tests missed it because they never seeded an admin). Event now carries real buyer name, final order total, and the seller's `orderItemId`; dispatch moved **after commit** so listeners can never observe rolled-back orders.
2. **C2 / RC-1 (release governor) — expiry-vs-payment race closed on the approve side.** `PaymentTransitionService::approve()` now rejects terminal items (`Cancelled`/`Completed`) after the locked re-read, mirroring `reject()`. A cancelled unpaid item can no longer be flipped to Paid, which previously produced a Paid+Cancelled item and a Paid order header over a Cancelled order.
3. **RC-1 second half — expiry batch resilience.** `expireUnpaidOrders()` catches `ValidationException` per item (item paid mid-run), logs and skips, so one raced item no longer aborts the whole hourly batch.
4. **H1 — seller notification href pointed at the wrong entity.** Listener used the Order id against the `{orderItem}`-bound route. Now links the seller's own order item; fallback to the orders index when no item id is present.
5. **Multi-seller notification key collision.** `seller-order-pending:{orderId}` was globally unique per order, so in multi-seller carts only the first seller ever got notified. Key is now `order-pending:{orderId}:{sellerId}`.
6. **Dead code removed.** Unused `App\Services\NotificationService` (contained its own precedence bug and always-null `$order->pivot` check) deleted.

### Tests added

- Checkout notifies seller + admin with final data when an admin exists (regression for C1/H1).
- Multi-seller cart dispatches exactly one pending notification per seller.
- `approve()` refuses Cancelled/Completed items while payment stays Unpaid (regression for C2).
- Expiry batch skips an item paid mid-run and still cancels the rest (regression for H3).

### Verification status

- Full suite: 528 tests / 526 passed / 2 skipped (pre-existing) / 0 failed.
- Pint + PHPStan clean on all touched files; repo-wide pint/phpstan still report pre-existing violations in the uncommitted notification WIP files (NotificationController, Notification models/preferences, HandleInertiaRequests, AdminNotificationTriggered) — tracked separately.

> Note: `ShouldDispatchAfterCommit` was evaluated but intentionally not used: under `RefreshDatabase` the root transaction never commits, so deferred events would silently stop firing in feature tests. Post-commit dispatch-by-construction gives the same production guarantee without breaking the suite.

---

## 10. Fase 2 — Integritas data (2026-08-24)

### Fixed

1. **H1 backfill — stale seller notification hrefs.** Migration `2026_08_24_000001_fix_pending_order_notification_hrefs` + `NotificationHrefBackfill::run()` rewrite pending-order rows stored with an Order id against the OrderItem-bound seller route: resolve the recipient's own order item (lowest id), keep links that already point at one of their items, fall back to the orders index when nothing resolves. Logged per row.
2. **RC-3 — POS transaction-code collisions.** `TransactionCode::unique()` probes with `exists()` and cannot see other connections' uncommitted rows; concurrent picket sales could die with SQLSTATE 23000. New `UniqueViolationRetry` helper (mirrors checkout's retry pattern) wraps both `storeSale` and `storeReport`. The sale row is created before any consignment mutation, so retries can never double-apply stock effects; the daily-report guard stays inside its locked transaction.
3. **M4 — last unlocked consignment transitions.** `approve/reject/cancel/receive` already re-read under lock inside the service, but `complete()`, `recordSold()` and `restoreSold()` still did read-modify-write on the caller-passed model — a concurrent reversal or sale could oversell past `received_quantity` or complete an unsold consignment (last-writer-wins). All three now `lockForUpdate()->findOrFail()` and validate on the locked read.
4. **M5 — cart unique race.** `CartController::store` did check-then-create with no lock; parallel adds of the same product hit the `(user_id, product_id)` unique index and returned 500. The flow now runs in a transaction with `lockForUpdate`, stock/pre-order validation evaluates the final merged quantity, and `UniqueViolationRetry` re-runs the whole flow if the insert still loses the race.

### Tests added

- NotificationHrefBackfillTest ×3 — stale rewrite, valid-link preservation, orphan/wrong-owner fallback.
- PosSaleCodeCollisionTest ×3 — collision retried exactly once without double-applying sold_quantity, exhaustion surfaces 500 with zero side effects, direct helper attempt-count = 3.
- ConsignmentTransitionLockTest ×5 — stale-snapshot oversell rejected, completion refused after concurrent reversal/duplicate completion, clean completion, restoreSold against locked row.
- CartRaceTest ×3 — merge after lost insert race, stock re-check on merged quantity, plain add.

### Verification status

- Full suite: 542 tests / 540 passed / 2 skipped (pre-existing) / 0 failed.
- Pint + PHPStan clean on all touched files. Remaining repo-wide debt unchanged: 33 PHPStan violations in the untracked-at-the-time notification WIP files plus the pre-existing `PicketUpJurusanConsignmentController:476` nullsafe nit — scheduled for Fase 4 cleanup.

> Note: §2's RC-2 row was found stale during this phase — `receive()` had already gained its locked re-fetch in an earlier pass; this phase closed the remaining three methods.

---

## 11. Fase 3 — Performa (2026-08-24)

### Fixed

1. **N1-1 + N1-2 — consignment money aggregates.** `MoneyCalculationService::sellerEarningsMap/paidPayoutMap` do one grouped SUM per table keyed by `up_jurusan_consignment_id` (reversed movements still excluded). Seller consignment index dropped from ~4 SUMs per row to 2 queries total; `ActorLifecycle::userHasUnpaidPayouts/upJurusanHasUnpaidPayouts` read the maps instead of looping `unpaidSellerAmount`. Single-id methods remain for detail/payout paths. Benchmark: seller consignment list payload unchanged; equivalence covered by tests.
2. **U-4 — dashboard order trend in SQL.** `orderTrendData()` no longer materialises eight months of orders: two grouped queries (`COUNT`/`SUM` keyed by `substr(created_at,1,7)`, portable SQLite/MySQL/PostgreSQL) feed the same 8-bucket payload.
3. **U-6 — catalog pagination.** Buyer catalog paginates 12/page with query-string preservation and the same through()-mapped payload; `catalog/index.tsx` reads paginator data/meta, shows a range line, and renders Prev/Next (disabled at edges) via wayfinder hrefs that keep search/category filters.

### Tests added

- MoneyAggregateMapTest ×3 — grouped maps equal per-id sums (incl. reversed exclusion + overpaid clamp), empty-list guard, lifecycle detection flips after settlement.
- DashboardTest trend bucket test — counts/revenue per month, rejected payments excluded.
- CatalogTest pagination test — 12/1 split across pages, meta fields, filter preservation on page 2.

### Verification status

- Full suite: 547 tests / 545 passed / 2 skipped (pre-existing) / 0 failed.
- Pint + PHPStan clean on all touched files (repo-wide WIP debt unchanged).
- Benchmark log now records catalog.index before=14 → after=6 queries.

### Deferred

- **N1-3** (per-row livenessLabel EXISTS on admin orders index) → Fase 4.
- Seller consignment index pagination → later pass (list is small; aggregates already fixed).

---

## 12. Fase 4 — Pra-migrasi PostgreSQL & hardening (2026-08-24)

### Fixed

1. **M8a — two-stage moderation enforced.** `ConsignmentTransitionService::approve()` refuses while the linked product is not yet published by the admin product-moderation gate ("Produk belum disetujui moderator…"), so a jurusan approval can no longer bypass product review; state stays `PendingApproval`.
2. **M3 — notifications.key widened to string(100).** PostgreSQL `uuid` columns reject prefixed keys (`order-pending:{order}:{seller}`); unique index dropped/re-added around the change because SQLite's rebuild collides with the surviving index name. Long-key regression test included.
3. **M7 — rate limits.** Checkout POST throttled at 10/min per user|ip (`throttle:checkout`); registration capped at 3/min per ip inside Fortify's `CreateNewUser`, counting successful signups toward the ip budget.
4. **N1-3 — batched liveness labels.** `OrderLivenessService::primeForOrders()` fills the reason cache with three `whereKey` queries per page; admin orders index dropped from ~40 queries to **13**.
5. **N1-4 — chunked stuck detection.** `detectAndMarkStuck` walks matched orders via `chunkById(200)` instead of materialising the whole set.
6. **§7.8 — benchmark is a real assertion now.** Each route's measured count must stay ≤ its documented pre-optimisation baseline; measured values still print for drift tracking.

### CI debt cleared

- **PHPStan 34 → 0**: return types and null-safe user resolution in NotificationController/PreferencesController, `Builder<Notification>` scope generics (+ Product), BelongsTo generics, iterable value types on events/helpers, redundant nullsafe removals.
- **Pint repo-wide clean** (~30 files formatted).
- `.php-cs-fixer.*` strays gitignored.

### Verification status

- **`composer ci:check` fully green** (eslint, prettier, tsc, pint, phpstan 0, 544 tests / 542 passed / 2 skipped pre-existing pcntl-gated / 0 failed).

### Remaining known items

- Seller consignment index pagination (deferred from Fase 3).
- 2 skipped concurrency tests require the pcntl extension by design.

---

## 13. Notification hardening — audit 4 peran (2026-08-24)

### Fixed

1. **Schema — key uniqueness scoped to user.** `notifications.key` carried a global unique index, so the same logical notification could only ever reach ONE recipient (same failure class as the Fase 1 multi-seller bug). Uniqueness is now `(user_id, key)`.
2. **Central dispatch.** `NotificationDispatch::toUser()/toRole()` consults `NotificationPreference::allowsInApp()` (absent row = opted in), then delivers idempotently per user+key. All 10 listeners rebuilt on top of it; preferences are now genuinely respected.
3. **Admin recipients.** Admin-facing listeners notify *every* admin instead of `User::where('role')->first()`.
4. **Admin jurusan targeting (Gap D).** Consignment notifications go to the owning `up_jurusan.admin_jurusan_id`; per-transition keys (`admin-jurusan-consignment:{id}:{status}`) make approve/reject/cancel each notify once while staying retry-idempotent (`OrderItemStatusChanged` gained `consignmentStatus`).
5. **Seller moderation result (Gaps A+C).** New `ProductModerationDecided` event from the admin approve/reject actions drives a seller notification whose href points at `seller.products.index` (the old pending-notice href pointed sellers at the admin queue → 403).
6. **Payment settled → seller (Gap E).** `PicketOrderPaymentNotify` (self-noise) removed; new `SellerPaymentPaidNotify` tells the seller when a picket settles their item, skipping seller-self approvals and non-approved statuses.
7. **Low stock alive again (Gap B).** `LowStockDetected` was never dispatched anywhere. `Product::dispatchLowStockNotificationIfReached()` now shares the header's exact source of truth (`REAL_STOCK_SQL` + `LOW_STOCK_THRESHOLD = 5`, ReadyStock only) and is invoked after every stock-decreasing write: checkout self-managed decrement, POS product sale, and consignment `recordSold`.

### Regression matrix added

`NotificationTriggerMatrixTest` (7 tests): multi-admin fan-out with per-user idempotency; AJ owner-targeting + per-transition keys; daily-report owner routing; moderation approved/rejected to seller incl. role-accessible href GET; payment-paid to seller with no picket self-row and no seller self-approval echo; low-stock threshold firing once per product; preference gate blocking/re-enabling per user+type.

### Verification status

- Full suite: 551 tests / 549 passed / 2 skipped (pcntl-gated) / 0 failed.
- pint ✓ phpstan 0 ✓ tsc ✓.

---

## 14. Buyer notifications (2026-08-24)

### Added

Buyers now receive persisted in-app notifications through the same preference-gated, idempotent dispatch pipeline as the other roles:

| Trigger | Key | Source |
|---------|-----|--------|
| Seller marks item packed/sent | `buyer-order-item:{id}:{status}` | NEW dispatch in `SellerOrderController::updateStatus` |
| Picket advances item status (incl. consigned) | same | extended picket dispatch (`itemStatus` field) |
| Payment approved by picket | `buyer-payment:{id}:approved` | `OrderPaymentApproved` |
| Payment rejected (+ reason) | `buyer-payment:{id}:rejected` | idem, `rejectionReason` added to event |
| Auto-expiry of unpaid order | `buyer-order-state:{orderId}:cancelled_auto` | `expireUnpaidOrders` per-order notice |
| Admin force-cancel / force-complete | `...cancelled_admin` / `...completed_admin` | controller-side dispatch with admin's reason |

New events/listeners: `BuyerOrderStateChanged` → `PersistBuyerOrderNotice`, plus `BuyerOrderStatusNotify` and `BuyerPaymentDecidedNotify`. Buyer-initiated cancellations stay silent (self-action).

### UI

`buyerHeader` now carries the buyer's latest persisted notifications (dismissal-aware) and the header buyer branch gained a bell dropdown (mark-all-read, empty state, link to `/notifications`) mirroring the seller pattern.

### Tests added

`BuyerNotificationTest` (6): packed/sent notify with accessible href; consignment-style dispatches without `itemStatus` ignored; payment rejected/approved rows incl. reason; auto-expiry notice; forced-cancellation reason surfaced; preference gate blocks `order` while `payment` still delivers.

### Verification status

- Full suite: 557 tests / 555 passed / 2 skipped (pcntl) / 0 failed; pint ✓ phpstan 0 ✓ tsc/eslint/prettier ✓.

### Cancellation notifications (2026-08-24, lanjutan §14)

`OrderItemCancellation::cancelItemWithinTransaction` — choke point seluruh jalur pembatalan (buyer, seller, picket, expiry, admin force-cancel, auto-cancel karena penolakan pembayaran) — kini men-dispatch `OrderItemCancelled(orderItemId, orderId, productName, sellerId, buyerId, actorId, actorRole, reason, isExpiry)` dengan dua listener actor-aware:

- `SellerCancelledOrderNotify`: seller menerima setiap pembatalan itemnya (pembeli/picket/admin/expiry) kecuali aksinya sendiri — key `seller-item-cancelled:{itemId}`.
- `BuyerItemCancelledNotify`: buyer diberi tahu hanya ketika pembatalan dilakukan seller/picket; self-cancel senyap dan expiry/force-cancel tetap lewat `BuyerOrderStateChanged` (tanpa dobel).

Keduanya pref-gated & idempotent via `NotificationDispatch`. Regresi: `OrderCancelledNotifyTest` ×5 (multi-seller fan-out, dua arah silence rules, picket both-sides, system-side expiry ke seller, preference gate).

### Picket new-work notifications (2026-08-24, lanjutan §14)

Checkout post-commit kini mengelompokkan item pending per up jurusan tujuan (produk UP-managed via `up_jurusan_id` atau konsinyasa) dan men-dispatch `OrderItemsAwaitingVerification(upJurusanId, orderId, orderCode, itemCount)` — satu event per order-per-UJ, `itemCount` hanya menghitung item actionable untuk UJ tersebut (item self-managed dilewati).

Listener `PicketVerificationNotify` mem-fan-out ke picket officer UJ tsb (domain: satu picket per UJ — `users.up_jurusan_id` unique) dengan key `picket-new-order:{orderId}:{upJurusanId}`, type `payment` (memicu pulse badge eksisting), href `picket.orders`, pref-gated `payment`.

Regresi: `PicketVerificationNotifyTest` ×4 — fan-out + isolasi UJ lain; itemCount hanya item actionable; idempotent per order+UJ sementara order baru tetap notif; preference gate.
