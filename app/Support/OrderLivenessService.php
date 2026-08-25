<?php

namespace App\Support;

use App\Enums\BuyerViolationType;
use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\ProductSalesMethod;
use App\Enums\SellerViolationType;
use App\Enums\UserRole;
use App\Events\BuyerOrderStateChanged;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class OrderLivenessService
{
    public const int FULFILLMENT_IDLE_HOURS = 48;

    public const int SENT_IDLE_HOURS = 72;

    /** @var \WeakMap<Order, list<string>>|null */
    private static ?\WeakMap $stuckReasonsCache = null;

    /**
     * @return list<string>
     */
    public static function filterValues(): array
    {
        return ['active', 'expired', 'stuck', 'requires_action'];
    }

    /**
     * @return Builder<Order>
     */
    public static function unpaidExpiredQuery(?CarbonInterface $now = null): Builder
    {
        $now ??= now();

        return Order::query()
            ->where(function (Builder $query) use ($now) {
                $query->where(function (Builder $inner) use ($now) {
                    $inner->whereNotNull('expires_at')
                        ->where('expires_at', '<=', $now)
                        ->whereHas('items', fn (Builder $items) => $items
                            ->where('payment_status', PaymentStatus::Unpaid)
                            ->whereNotIn('status', [
                                OrderItemStatus::Cancelled->value,
                                OrderItemStatus::Completed->value,
                            ]));
                })->orWhereHas('items', function (Builder $items) use ($now) {
                    $items->where('payment_status', PaymentStatus::Unpaid)
                        ->whereNotIn('status', [
                            OrderItemStatus::Cancelled->value,
                            OrderItemStatus::Completed->value,
                        ])
                        ->where('created_at', '<=', $now->copy()->subHours(OrderItemCancellation::UNPAID_EXPIRY_HOURS))
                        ->whereHas('order', fn (Builder $order) => $order->whereNull('expires_at'));
                });
            });
    }

    /**
     * @return Builder<Order>
     */
    public static function stuckFulfillmentQuery(?CarbonInterface $now = null): Builder
    {
        $now ??= now();
        $threshold = $now->copy()->subHours(self::FULFILLMENT_IDLE_HOURS);

        return Order::query()
            ->whereIn('status', ActorLifecycle::activeOrderStatuses())
            ->whereHas('items', function (Builder $items) use ($threshold) {
                $items->where('payment_status', PaymentStatus::Paid)
                    ->whereNotIn('status', [
                        OrderItemStatus::Sent->value,
                        OrderItemStatus::Completed->value,
                        OrderItemStatus::Cancelled->value,
                    ]);

                self::applyIdleThreshold($items, $threshold);
            });
    }

    /**
     * @return Builder<Order>
     */
    public static function stuckSentQuery(?CarbonInterface $now = null): Builder
    {
        $now ??= now();
        $threshold = $now->copy()->subHours(self::SENT_IDLE_HOURS);

        return Order::query()
            ->whereIn('status', ActorLifecycle::activeOrderStatuses())
            ->whereHas('items', function (Builder $items) use ($threshold) {
                $items->where('status', OrderItemStatus::Sent)
                    ->where('payment_status', PaymentStatus::Paid)
                    ->where(function (Builder $q) use ($threshold) {
                        $q->where(function (Builder $inner) use ($threshold) {
                            $inner->whereNotNull('status_changed_at')
                                ->where('status_changed_at', '<=', $threshold);
                        })->orWhere(function (Builder $inner) use ($threshold) {
                            $inner->whereNull('status_changed_at')
                                ->where('updated_at', '<=', $threshold);
                        });
                    });
            });
    }

    /**
     * @return Builder<Order>
     */
    public static function stuckQuery(?CarbonInterface $now = null): Builder
    {
        $now ??= now();

        return Order::query()
            ->where(function (Builder $query) use ($now) {
                $query->whereIn('id', self::stuckFulfillmentQuery($now)->select('id'))
                    ->orWhereIn('id', self::stuckSentQuery($now)->select('id'));
            });
    }

    /**
     * @return Builder<Order>
     */
    public static function requiresActionQuery(?CarbonInterface $now = null): Builder
    {
        $now ??= now();

        return Order::query()
            ->where(function (Builder $query) use ($now) {
                $query->where('requires_manual_review', true)
                    ->orWhereIn('id', self::unpaidExpiredQuery($now)->select('id'))
                    ->orWhereIn('id', self::stuckQuery($now)->select('id'));
            });
    }

    /**
     * @return Builder<Order>
     */
    public static function activeQuery(): Builder
    {
        return Order::query()
            ->whereIn('status', ActorLifecycle::activeOrderStatuses())
            ->where('requires_manual_review', false);
    }

    /**
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public static function applyFilter(Builder $query, ?string $filter, ?CarbonInterface $now = null): Builder
    {
        $now ??= now();

        return match ($filter) {
            'active' => $query->whereIn('id', self::activeQuery()->select('id'))
                ->whereNotIn('id', self::requiresActionQuery($now)->select('id')),
            'expired' => $query->whereIn('id', self::unpaidExpiredQuery($now)->select('id')),
            'stuck' => $query->whereIn('id', self::stuckQuery($now)->select('id')),
            'requires_action' => $query->whereIn('id', self::requiresActionQuery($now)->select('id')),
            default => $query,
        };
    }

    /**
     * @return list<string>
     */
    public static function stuckReasonsFor(Order $order, ?CarbonInterface $now = null): array
    {
        $now ??= now();

        if (isset(self::stuckReasonsCache()[$order])) {
            return self::stuckReasonsCache()[$order];
        }

        self::primeForOrders([$order], $now);

        return self::stuckReasonsCache()[$order] ?? [];
    }

    /**
     * Precompute stuck reasons for a batch of orders with three batched
     * queries instead of up to three EXISTS probes per order - used when
     * rendering lists so a 10-row page costs 3 queries, not ~30.
     *
     * @param  iterable<int, Order>  $orders
     */
    public static function primeForOrders(iterable $orders, ?CarbonInterface $now = null): void
    {
        $now ??= now();

        // Instances already carrying cached reasons keep them.
        $pending = collect($orders)
            ->reject(fn (Order $order) => isset(self::stuckReasonsCache()[$order]));

        if ($pending->isEmpty()) {
            return;
        }

        $ids = $pending->pluck('id');

        $reasonSets = [
            'unpaid_expired' => self::unpaidExpiredQuery($now)->whereKey($ids)->pluck('id')->all(),
            'fulfillment_idle' => self::stuckFulfillmentQuery($now)->whereKey($ids)->pluck('id')->all(),
            'sent_idle' => self::stuckSentQuery($now)->whereKey($ids)->pluck('id')->all(),
        ];

        foreach ($pending as $order) {
            $reasons = [];

            foreach ($reasonSets as $reason => $matchedIds) {
                if (in_array($order->id, $matchedIds, true)) {
                    $reasons[] = $reason;
                }
            }

            if ($order->requires_manual_review) {
                $reasons[] = 'manual_review';
            }

            self::stuckReasonsCache()[$order] = array_values(array_unique($reasons));
        }
    }

    /**
     * @return \WeakMap<Order, list<string>>
     */
    private static function stuckReasonsCache(): \WeakMap
    {
        return self::$stuckReasonsCache ??= new \WeakMap;
    }

    public static function livenessLabel(Order $order, ?CarbonInterface $now = null): string
    {
        $reasons = self::stuckReasonsFor($order, $now);

        if (in_array('manual_review', $reasons, true) || $order->requires_manual_review) {
            return 'requires_action';
        }

        if (in_array('unpaid_expired', $reasons, true)) {
            return 'expired';
        }

        if (array_intersect($reasons, ['fulfillment_idle', 'sent_idle']) !== []) {
            return 'stuck';
        }

        if ($order->status->isTerminal()) {
            return 'closed';
        }

        return 'active';
    }

    /**
     * Items count as idle from their last status change, falling back to the
     * payment confirmation time and finally the last row update.
     *
     * @template TModel of \Illuminate\Database\Eloquent\Model
     *
     * @param  Builder<TModel>  $items
     * @return Builder<TModel>
     */
    private static function applyIdleThreshold(Builder $items, CarbonInterface $threshold): Builder
    {
        return $items->where(function (Builder $q) use ($threshold) {
            $q->where(function (Builder $inner) use ($threshold) {
                $inner->whereNotNull('status_changed_at')
                    ->where('status_changed_at', '<=', $threshold);
            })->orWhere(function (Builder $inner) use ($threshold) {
                $inner->whereNull('status_changed_at')
                    ->whereNotNull('payment_confirmed_at')
                    ->where('payment_confirmed_at', '<=', $threshold);
            })->orWhere(function (Builder $inner) use ($threshold) {
                $inner->whereNull('status_changed_at')
                    ->whereNull('payment_confirmed_at')
                    ->where('updated_at', '<=', $threshold);
            });
        });
    }

    public static function detectAndMarkStuck(?CarbonInterface $now = null): int
    {
        $now ??= now();
        $marked = 0;

        Order::query()
            ->where(function (Builder $query) use ($now) {
                $query->whereIn('id', self::stuckQuery($now)->select('id'))
                    ->orWhereIn('id', self::unpaidExpiredQuery($now)->select('id'));
            })
            ->with('items')
            ->orderBy('id')
            ->chunkById(200, function ($orders) use ($now, &$marked): void {
                foreach ($orders as $order) {
                    self::stuckReasonsFor($order, $now);
                    $order->update([
                        'stuck_detected_at' => $now,
                        'stuck_reasons' => self::stuckReasonsCache()[$order],
                    ]);
                    $marked++;
                }
            });

        return $marked;
    }

    /**
     * Record SLA violations against sellers from the hourly sweep:
     * paid orders not shipped in time, late pre-orders, and ignored
     * payment confirmations. Consignment stock is picket-managed and
     * therefore never attributed to the seller.
     */
    public static function recordSellerSlaViolations(?CarbonInterface $now = null): int
    {
        $now ??= now();

        return self::recordSlowFulfillmentViolations($now)
            + self::recordPreOrderLateViolations($now)
            + self::recordUnconfirmedPaymentViolations($now);
    }

    private static function recordSlowFulfillmentViolations(CarbonInterface $now): int
    {
        return self::recordSellerItemViolations(
            self::applyIdleThreshold(
                OrderItem::query()
                    ->where('payment_status', PaymentStatus::Paid)
                    ->whereNotIn('status', [
                        OrderItemStatus::Sent->value,
                        OrderItemStatus::Completed->value,
                        OrderItemStatus::Cancelled->value,
                    ])
                    ->whereHas('order', fn (Builder $order) => $order
                        ->whereIn('status', ActorLifecycle::activeOrderStatuses())),
                $now->copy()->subHours(self::FULFILLMENT_IDLE_HOURS),
            ),
            SellerViolationType::SlowFulfillment,
            'Pesanan sudah dibayar tetapi belum dikirim dalam '.self::FULFILLMENT_IDLE_HOURS.' jam',
        );
    }

    private static function recordPreOrderLateViolations(CarbonInterface $now): int
    {
        return self::recordSellerItemViolations(
            OrderItem::query()
                ->where('is_pre_order', true)
                ->whereNotNull('pre_order_deadline')
                ->where('pre_order_deadline', '<=', $now->toDateString())
                ->where('payment_status', PaymentStatus::Paid)
                ->whereNotIn('status', [
                    OrderItemStatus::Sent->value,
                    OrderItemStatus::Completed->value,
                    OrderItemStatus::Cancelled->value,
                ]),
            SellerViolationType::PreOrderLate,
            'Pre-order melewati batas waktu produksi tanpa dikirim',
        );
    }

    private static function recordUnconfirmedPaymentViolations(CarbonInterface $now): int
    {
        return self::recordSellerItemViolations(
            OrderItem::query()
                ->where('payment_status', PaymentStatus::PendingConfirmation)
                ->where('updated_at', '<=', $now->copy()->subHours(SanctionSettings::paymentConfirmSlaHours())),
            SellerViolationType::UnconfirmedPayment,
            'Bukti pembayaran tidak dikonfirmasi dalam '.SanctionSettings::paymentConfirmSlaHours().' jam',
        );
    }

    /**
     * Record one violation per seller per order for every item matching the
     * given base query. Deduplication (per order + type) happens inside the
     * sanction service.
     *
     * @param  Builder<OrderItem>  $baseQuery
     */
    private static function recordSellerItemViolations(
        Builder $baseQuery,
        SellerViolationType $type,
        string $description,
    ): int {
        $recorded = 0;

        $baseQuery
            ->whereHas('product', fn (Builder $product) => $product
                ->where('sales_method', ProductSalesMethod::SelfManaged)
                ->whereNotNull('seller_id'))
            ->with(['order:id,user_id', 'product:id,seller_id,sales_method'])
            ->orderBy('id')
            ->chunkById(200, function ($items) use ($type, $description, &$recorded): void {
                /** @var OrderItem $item */
                foreach ($items as $item) {
                    $sellerId = $item->product->seller_id;

                    if ($sellerId === null) {
                        continue;
                    }

                    $violation = SellerSanctionService::recordViolation(
                        (int) $sellerId,
                        $type,
                        order: $item->order,
                        product: $item->product,
                        description: $description,
                    );

                    if ($violation !== null) {
                        $recorded++;
                    }
                }
            });

        return $recorded;
    }

    public static function expireUnpaidOrders(User $actor, ?CarbonInterface $now = null): int
    {
        $now ??= now();
        $cancelled = 0;

        $orders = self::unpaidExpiredQuery($now)->with('items')->get();

        foreach ($orders as $order) {
            $items = $order->items->filter(
                fn (OrderItem $item) => $item->payment_status === PaymentStatus::Unpaid
                    && ! $item->status->isTerminal()
            );

            $orderCancelled = false;

            foreach ($items as $item) {
                try {
                    OrderItemCancellation::cancelItem(
                        $item,
                        $actor,
                        'Otomatis dibatalkan karena melewati batas waktu pembayaran',
                        true,
                    );
                    $cancelled++;
                    $orderCancelled = true;
                } catch (ValidationException $exception) {
                    // The item changed state between the pre-read above and the
                    // locked re-read inside cancelItem (e.g. a concurrent
                    // payment approval). Skip it so one raced item never aborts
                    // the whole expiry batch.
                    Log::warning('Skipped expiring order item that changed state', [
                        'order_item_id' => $item->id,
                        'reason' => $exception->getMessage(),
                    ]);
                }
            }

            if ($orderCancelled) {
                BuyerOrderStateChanged::dispatch(
                    orderId: $order->id,
                    state: 'cancelled_auto',
                    reason: 'Melewati batas waktu pembayaran',
                );
            }
        }

        return $cancelled;
    }

    public static function markRequiresManualReview(Order $order, User $actor, ?string $reason = null): void
    {
        if ($actor->role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'order' => 'Hanya admin yang dapat menandai review manual.',
            ]);
        }

        DB::transaction(function () use ($order, $reason) {
            /** @var Order $current */
            $current = Order::query()
                ->lockForUpdate()
                ->findOrFail($order->id);

            if ($current->status->isTerminal()) {
                throw ValidationException::withMessages([
                    'order' => 'Pesanan yang sudah selesai atau dibatalkan tidak dapat ditandai review manual.',
                ]);
            }

            $current->update([
                'requires_manual_review' => true,
                'requires_manual_review_at' => now(),
                'requires_manual_review_reason' => $reason ?? 'Ditandai butuh peninjauan manual',
                'stuck_detected_at' => $current->stuck_detected_at ?? now(),
                'stuck_reasons' => array_values(array_unique([
                    ...($current->stuck_reasons ?? []),
                    'manual_review',
                ])),
            ]);
        });
    }

    public static function clearManualReview(Order $order, User $actor): void
    {
        if ($actor->role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'order' => 'Hanya admin yang dapat menghapus peninjauan manual.',
            ]);
        }

        $reasons = collect($order->stuck_reasons ?? [])
            ->reject(fn ($reason) => $reason === 'manual_review')
            ->values()
            ->all();

        $order->update([
            'requires_manual_review' => false,
            'requires_manual_review_at' => null,
            'requires_manual_review_reason' => null,
            'stuck_reasons' => $reasons === [] ? null : $reasons,
        ]);
    }

    public static function forceComplete(Order $order, User $actor, ?string $reason = null): void
    {
        if ($actor->role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'order' => 'Hanya admin yang dapat memaksa menyelesaikan pesanan.',
            ]);
        }

        DB::transaction(function () use ($order, $reason) {
            /** @var Order $current */
            $current = Order::query()
                ->with('items')
                ->lockForUpdate()
                ->findOrFail($order->id);

            $completable = $current->items->filter(
                fn (OrderItem $item) => $item->status === OrderItemStatus::Sent
                    && $item->payment_status === PaymentStatus::Paid
            );

            if ($completable->isEmpty()) {
                throw ValidationException::withMessages([
                    'order' => 'Tidak ada item berstatus dikirim dan lunas yang dapat diselesaikan.',
                ]);
            }

            foreach ($completable as $item) {
                $item->update([
                    'status' => OrderItemStatus::Completed,
                    'status_changed_at' => now(),
                ]);
            }

            BuyerSanctionService::recordViolation(
                (int) $current->user_id,
                BuyerViolationType::UnconfirmedReceipt,
                order: $current,
                description: 'Pesanan diselesaikan paksa oleh admin karena pembeli tidak mengonfirmasi penerimaan',
            );

            OrderStatusSync::sync($current->fresh(['items']));

            $current->refresh();
            $current->update([
                'requires_manual_review' => false,
                'requires_manual_review_at' => null,
                'requires_manual_review_reason' => $reason,
                'stuck_detected_at' => null,
                'stuck_reasons' => null,
            ]);
        });
    }

    public static function forceCancel(Order $order, User $actor, ?string $reason = null): void
    {
        if ($actor->role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'order' => 'Hanya admin yang dapat memaksa membatalkan pesanan.',
            ]);
        }

        OrderItemCancellation::cancelOrder(
            $order,
            $actor,
            $reason ?? 'Force cancel oleh admin (liveness)',
            true,
            true,
        );
    }

    /**
     * @return Collection<int, Order>
     */
    public static function detectStuckOrders(?CarbonInterface $now = null): Collection
    {
        $now ??= now();

        return Order::query()
            ->where(function (Builder $query) use ($now) {
                $query->whereIn('id', self::stuckQuery($now)->select('id'))
                    ->orWhereIn('id', self::unpaidExpiredQuery($now)->select('id'));
            })
            ->with('items')
            ->orderByDesc('id')
            ->get();
    }
}
