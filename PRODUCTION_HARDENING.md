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