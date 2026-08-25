<?php

namespace App\Support;

use App\Enums\StockMovementSource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UpJurusanStockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeliveryFeeService
{
    /**
     * Highest tier whose min_spend the subtotal reaches, or null when the
     * subtotal matches no rule (only possible before a base rule exists).
     *
     * @return array{min_spend: int, fee: int}|null
     */
    public static function matchingTier(int $subtotal): ?array
    {
        if ($subtotal <= 0) {
            return null;
        }

        $match = null;

        foreach (DeliveryFeeSettings::tiers() as $tier) {
            if ($subtotal >= $tier['min_spend']) {
                $match = $tier;
            }
        }

        return $match;
    }

    public static function feeForSubtotal(int $subtotal): int
    {
        return self::matchingTier($subtotal)['fee'] ?? 0;
    }

    /**
     * Record the order's delivery fee as UP Jurusan revenue, split
     * proportionally across the UPs involved. Idempotent: a fee that was
     * already recorded (and not reversed) is never recorded twice.
     */
    public static function recordForOrder(Order $order, User $actor): void
    {
        if ((int) $order->delivery_fee <= 0) {
            return;
        }

        DB::transaction(function () use ($order, $actor) {
            /** @var Order $current */
            $current = Order::query()->lockForUpdate()->findOrFail($order->id);

            if (self::hasActiveFeeMovements($current->id)) {
                return;
            }

            $shares = self::upShares($current);

            foreach ($shares as $upJurusanId => $share) {
                UpJurusanStockMovement::query()->create([
                    'up_jurusan_consignment_id' => null,
                    'up_jurusan_id' => $upJurusanId,
                    'product_id' => null,
                    'order_id' => $current->id,
                    'user_id' => $actor->id,
                    'type' => 'out',
                    'source' => StockMovementSource::DeliveryFee,
                    'quantity' => 0,
                    'unit_price' => $share,
                    'gross_amount' => $share,
                    'commission_amount' => $share,
                    'seller_amount' => 0,
                    'note' => 'Biaya antar pesanan '.($current->code ?? "TRX-{$current->id}"),
                ]);
            }

            DomainEventService::record(
                DomainEventService::AGGREGATE_ORDER,
                $current->id,
                'delivery_fee_recorded',
                $actor,
                [
                    'delivery_fee' => (int) $current->delivery_fee,
                    'shares' => $shares,
                ],
            );
        });
    }

    /**
     * Reverse active delivery fee movements, e.g. when an admin force-cancels
     * an already-paid order. Idempotent via the reverses_movement_id guard.
     */
    public static function reverseForOrder(Order $order, User $actor): void
    {
        $feeMovements = UpJurusanStockMovement::query()
            ->where('order_id', $order->id)
            ->where('source', StockMovementSource::DeliveryFee->value)
            ->where('type', 'out')
            ->whereDoesntHave('reversedBy')
            ->lockForUpdate()
            ->get();

        if ($feeMovements->isEmpty()) {
            return;
        }

        foreach ($feeMovements as $movement) {
            UpJurusanStockMovement::query()->create([
                'up_jurusan_consignment_id' => null,
                'up_jurusan_id' => $movement->up_jurusan_id,
                'product_id' => null,
                'order_id' => $movement->order_id,
                'user_id' => $actor->id,
                'type' => 'in',
                'source' => StockMovementSource::Reverse,
                'quantity' => 0,
                'unit_price' => (int) $movement->unit_price,
                'gross_amount' => (int) $movement->gross_amount,
                'commission_amount' => (int) $movement->commission_amount,
                'seller_amount' => 0,
                'note' => 'Pembatalan biaya antar pesanan '.($order->code ?? "TRX-{$order->id}"),
                'reverses_movement_id' => $movement->id,
            ]);
        }

        DomainEventService::record(
            DomainEventService::AGGREGATE_ORDER,
            $order->id,
            'delivery_fee_reversed',
            $actor,
            ['amount' => (int) $feeMovements->sum('gross_amount')],
        );
    }

    /**
     * Proportional split of the order's delivery fee across involved UPs,
     * weighted by each UP's item subtotal. The intdiv rounding remainder is
     * added to the largest weight so shares always sum exactly to the fee.
     *
     * @return array<int, int> upJurusanId => amount
     */
    public static function upShares(Order $order): array
    {
        $fee = (int) $order->delivery_fee;

        if ($fee <= 0) {
            return [];
        }

        $weightsByUpJurusan = [];

        foreach ($order->items as $item) {
            $upJurusanId = self::upJurusanIdForItem($item);

            if ($upJurusanId === null) {
                continue;
            }

            $weightsByUpJurusan[$upJurusanId] = ($weightsByUpJurusan[$upJurusanId] ?? 0) + (int) $item->subtotal;
        }

        $weightsByUpJurusan = array_filter($weightsByUpJurusan, fn (int $weight): bool => $weight > 0);

        if ($weightsByUpJurusan === []) {
            return [];
        }

        arsort($weightsByUpJurusan);

        $totalWeight = array_sum($weightsByUpJurusan);
        $shares = [];
        $allocated = 0;

        foreach ($weightsByUpJurusan as $upJurusanId => $weight) {
            $share = intdiv($fee * $weight, $totalWeight);
            $shares[$upJurusanId] = $share;
            $allocated += $share;
        }

        // arsort keeps insertion order for ties, so the first key is the
        // largest weight group and absorbs the rounding remainder.
        $largestUpJurusanId = (int) array_key_first($shares);
        $shares[$largestUpJurusanId] += $fee - $allocated;

        return $shares;
    }

    private static function hasActiveFeeMovements(int $orderId): bool
    {
        return UpJurusanStockMovement::query()
            ->where('order_id', $orderId)
            ->where('source', StockMovementSource::DeliveryFee->value)
            ->whereNull('reverses_movement_id')
            ->exists();
    }

    private static function upJurusanIdForItem(OrderItem $item): ?int
    {
        // The FK on order_items.product_id guarantees the product exists.
        $product = $item->product;

        $upJurusanId = $product->up_jurusan_id
            ?? $product->upJurusanConsignments->first()?->up_jurusan_id;

        return $upJurusanId !== null ? (int) $upJurusanId : null;
    }
}
