<?php

namespace App\Support;

use App\Enums\OrderItemStatus;
use App\Enums\PaymentStatus;
use App\Enums\StockMovementSource;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\UpJurusanConsignment;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderItemCancellation
{
    public const int UNPAID_EXPIRY_HOURS = 24;

    public static function cancelItem(
        OrderItem $item,
        User $actor,
        ?string $reason = null,
        bool $force = false,
    ): void {
        DB::transaction(function () use ($item, $actor, $reason, $force) {
            self::cancelItemWithinTransaction($item->id, $actor, $reason, $force);
        });
    }

    public static function cancelOrder(
        Order $order,
        User $actor,
        ?string $reason = null,
        bool $force = false,
        bool $clearOrderFlags = false,
    ): void {
        DB::transaction(function () use ($order, $actor, $reason, $force, $clearOrderFlags) {
            /** @var Order $current */
            $current = Order::query()
                ->with(['items:id,order_id,status,payment_status', 'items.order:id,user_id'])
                ->lockForUpdate()
                ->findOrFail($order->id);

            $cancellableIds = $current->items
                ->filter(fn (OrderItem $item) => self::prohibitedCancellationReason($item, $actor, $force) === null)
                ->pluck('id');

            if ($cancellableIds->isEmpty()) {
                $allCancelled = $current->items
                    ->every(fn (OrderItem $item) => $item->status === OrderItemStatus::Cancelled);

                throw ValidationException::withMessages([
                    'order' => $allCancelled
                        ? 'Pesanan ini sudah dibatalkan.'
                        : 'Tidak ada item yang dapat dibatalkan.',
                ]);
            }

            foreach ($cancellableIds as $itemId) {
                self::cancelItemWithinTransaction((int) $itemId, $actor, $reason, $force);
            }

            DomainEventService::record(
                DomainEventService::AGGREGATE_ORDER,
                $current->id,
                'order_cancelled',
                $actor,
                [
                    'reason' => $reason,
                ],
            );

            if ($clearOrderFlags) {
                $current->update([
                    'requires_manual_review' => false,
                    'requires_manual_review_at' => null,
                    'stuck_detected_at' => null,
                    'stuck_reasons' => null,
                ]);
            }
        });
    }

    private static function cancelItemWithinTransaction(
        int $itemId,
        User $actor,
        ?string $reason,
        bool $force,
    ): void {
        /** @var OrderItem $current */
        $current = OrderItem::query()
            ->with([
                'order:id,user_id,status',
                'product:id,seller_id,up_jurusan_id,sales_method,stock,fulfillment_type',
            ])
            ->lockForUpdate()
            ->findOrFail($itemId);

        if ($current->status === OrderItemStatus::Cancelled) {
            return;
        }

        self::assertCanCancel($current, $actor, $force);
        self::restock($current, $actor);

        $restoredQuantity = (int) $current->quantity;
        $isExpiry = is_string($reason)
            && str_contains($reason, 'melewati batas waktu pembayaran');

        $current->update([
            'status' => OrderItemStatus::Cancelled,
            'cancelled_at' => now(),
            'cancelled_by' => $actor->id,
            'cancel_reason' => $reason,
        ]);

        DomainEventService::record(
            DomainEventService::AGGREGATE_ORDER_ITEM,
            $current->id,
            $isExpiry ? 'order_expired' : 'order_item_cancelled',
            $actor,
            [
                'reason' => $reason,
                'restored_quantity' => $restoredQuantity,
            ],
        );

        DomainEventService::record(
            DomainEventService::AGGREGATE_ORDER_ITEM,
            $current->id,
            'restock_completed',
            $actor,
            [
                'reason' => $reason,
                'restored_quantity' => $restoredQuantity,
            ],
        );

        OrderPaymentSync::sync($current->order);
        OrderStatusSync::sync($current->order->fresh(['items']));

        $order = $current->order->fresh(['items']);
        if ($order->items->every(fn (OrderItem $orderItem) => $orderItem->status === OrderItemStatus::Cancelled)) {
            $order->update([
                'cancelled_at' => now(),
                'cancelled_by' => $actor->id,
                'cancel_reason' => $reason,
            ]);
        }
    }

    public static function assertCanCancel(OrderItem $item, User $actor, bool $force = false): void
    {
        $prohibitedReason = self::prohibitedCancellationReason($item, $actor, $force);

        if ($prohibitedReason !== null) {
            throw ValidationException::withMessages([
                'order' => $prohibitedReason,
            ]);
        }
    }

    /**
     * Single source of truth for item cancellability. Returns the message that
     * would block cancellation, or null when the item may be cancelled.
     */
    private static function prohibitedCancellationReason(OrderItem $item, User $actor, bool $force): ?string
    {
        if ($item->status === OrderItemStatus::Cancelled) {
            return 'Item pesanan sudah dibatalkan.';
        }

        if ($item->status === OrderItemStatus::Completed) {
            return 'Item yang sudah selesai tidak dapat dibatalkan.';
        }

        if ($item->payment_status === PaymentStatus::Paid) {
            return 'Item yang sudah lunas tidak dapat dibatalkan.';
        }

        if ($force) {
            return $actor->role === UserRole::Admin
                ? null
                : 'Hanya admin yang dapat memaksa pembatalan item ini.';
        }

        return match ($actor->role) {
            UserRole::Buyer => self::buyerProhibitedCancellationReason($item, $actor),
            UserRole::Seller => self::sellerProhibitedCancellationReason($item, $actor),
            UserRole::PicketOfficer => self::picketProhibitedCancellationReason($item, $actor),
            UserRole::Admin => null,
            default => 'Anda tidak berwenang membatalkan item pesanan ini.',
        };
    }

    private static function buyerProhibitedCancellationReason(OrderItem $item, User $actor): ?string
    {
        if ($item->order->user_id !== $actor->id) {
            return 'Anda tidak berwenang membatalkan pesanan ini.';
        }

        if ($item->payment_status === PaymentStatus::Paid) {
            return 'Item yang sudah dibayar tidak dapat dibatalkan oleh pembeli.';
        }

        return null;
    }

    private static function sellerProhibitedCancellationReason(OrderItem $item, User $actor): ?string
    {
        if ($item->product->seller_id !== $actor->id) {
            return 'Anda tidak berwenang membatalkan item penjual lain.';
        }

        if ($item->product->usesConsignmentStock()) {
            return 'Pembatalan produk titipan dikelola oleh picket officer UP Jurusan.';
        }

        if ($item->payment_status === PaymentStatus::Paid && $item->status === OrderItemStatus::Sent) {
            return 'Item yang sudah dibayar dan dikirim hanya dapat dibatalkan oleh admin.';
        }

        return null;
    }

    private static function picketProhibitedCancellationReason(OrderItem $item, User $actor): ?string
    {
        $product = $item->product;

        if (! $product->usesConsignmentStock()) {
            return 'Picket hanya dapat membatalkan item titipan UP Jurusan.';
        }

        if ($actor->up_jurusan_id === null) {
            return 'Anda tidak berwenang membatalkan item di UP Jurusan ini.';
        }

        $assigned = $product->up_jurusan_id === $actor->up_jurusan_id
            || UpJurusanConsignment::query()
                ->where('product_id', $product->id)
                ->where('up_jurusan_id', $actor->up_jurusan_id)
                ->exists();

        if (! $assigned) {
            return 'Anda tidak berwenang membatalkan item di UP Jurusan ini.';
        }

        return null;
    }

    public static function restock(OrderItem $item, User $actor): void
    {
        $product = Product::query()
            ->lockForUpdate()
            ->find($item->product_id);

        if ($product === null || $item->is_pre_order) {
            return;
        }

        if ($product->usesConsignmentStock()) {
            self::restockConsignment($item, $product, $actor);

            return;
        }

        $product->update([
            'stock' => $product->stock + $item->quantity,
        ]);

        if ($product->seller_id === null && $product->up_jurusan_id !== null) {
            $outMovements = UpJurusanStockMovement::query()
                ->where('order_id', $item->order_id)
                ->where('product_id', $product->id)
                ->where('type', 'out')
                ->whereNull('reverses_movement_id')
                ->lockForUpdate()
                ->get();

            foreach ($outMovements as $movement) {
                if (self::alreadyReversed($movement)) {
                    continue;
                }

                $money = MoneyCalculationService::reverseMovementSplit($movement, (int) $movement->quantity);

                UpJurusanStockMovement::query()->create([
                    'up_jurusan_consignment_id' => null,
                    'product_id' => $product->id,
                    'order_id' => $item->order_id,
                    'user_id' => $actor->id,
                    'type' => 'in',
                    'source' => StockMovementSource::Reverse,
                    'quantity' => $movement->quantity,
                    ...$money,
                    'note' => 'Restock pembatalan pesanan',
                    'reverses_movement_id' => $movement->id,
                ]);
            }
        }
    }

    private static function restockConsignment(OrderItem $item, Product $product, User $actor): void
    {
        $outMovements = UpJurusanStockMovement::query()
            ->where('order_id', $item->order_id)
            ->where('type', 'out')
            ->whereNotNull('up_jurusan_consignment_id')
            ->whereHas('consignment', fn ($q) => $q->where('product_id', $product->id))
            ->orderByDesc('id')
            ->lockForUpdate()
            ->get();

        $remaining = $item->quantity;

        foreach ($outMovements as $movement) {
            if ($remaining <= 0) {
                break;
            }

            if (self::alreadyReversed($movement)) {
                continue;
            }

            $restoreQty = min($remaining, $movement->quantity);

            /** @var UpJurusanConsignment $consignment */
            $consignment = UpJurusanConsignment::query()
                ->lockForUpdate()
                ->findOrFail($movement->up_jurusan_consignment_id);

            ConsignmentTransitionService::restoreSold($consignment, $restoreQty);

            $money = MoneyCalculationService::reverseMovementSplit($movement, $restoreQty);

            UpJurusanStockMovement::query()->create([
                'up_jurusan_consignment_id' => $consignment->id,
                'product_id' => null,
                'order_id' => $item->order_id,
                'user_id' => $actor->id,
                'type' => 'in',
                'source' => StockMovementSource::Reverse,
                'quantity' => $restoreQty,
                ...$money,
                'note' => 'Restock pembatalan pesanan',
                'reverses_movement_id' => $movement->id,
            ]);

            $remaining -= $restoreQty;
        }
    }

    private static function alreadyReversed(UpJurusanStockMovement $movement): bool
    {
        return UpJurusanStockMovement::query()
            ->where('reverses_movement_id', $movement->id)
            ->exists();
    }
}
