<?php

namespace App\Support;

use App\Models\UpJurusanPayout;
use App\Models\UpJurusanStockMovement;

class MoneyCalculationService
{
    public static function grossAmount(int $unitPrice, int $quantity): int
    {
        return $unitPrice * $quantity;
    }

    public static function commissionAmount(int $grossAmount, int $commissionRate): int
    {
        return intdiv($grossAmount * $commissionRate, 100);
    }

    public static function sellerAmount(int $grossAmount, int $commissionAmount): int
    {
        return $grossAmount - $commissionAmount;
    }

    /**
     * Seller consignment sale split (POS / checkout).
     *
     * @return array{unit_price: int, gross_amount: int, commission_amount: int, seller_amount: int}
     */
    public static function consignmentSaleSplit(int $unitPrice, int $quantity, int $commissionRate): array
    {
        $grossAmount = self::grossAmount($unitPrice, $quantity);
        $commissionAmount = self::commissionAmount($grossAmount, $commissionRate);

        return [
            'unit_price' => $unitPrice,
            'gross_amount' => $grossAmount,
            'commission_amount' => $commissionAmount,
            'seller_amount' => self::sellerAmount($grossAmount, $commissionAmount),
        ];
    }

    /**
     * UP-owned product sale: 100% revenue to UP (commission = gross, seller = 0).
     *
     * @return array{unit_price: int, gross_amount: int, commission_amount: int, seller_amount: int}
     */
    public static function upOwnedProductSaleSplit(int $unitPrice, int $quantity): array
    {
        $grossAmount = self::grossAmount($unitPrice, $quantity);

        return [
            'unit_price' => $unitPrice,
            'gross_amount' => $grossAmount,
            'commission_amount' => $grossAmount,
            'seller_amount' => 0,
        ];
    }

    /**
     * Reverse / restock amounts proportional to an original out movement.
     * Full reverse copies stored amounts to avoid 1-IDR drift.
     *
     * @return array{unit_price: int, gross_amount: int, commission_amount: int, seller_amount: int}
     */
    public static function reverseMovementSplit(UpJurusanStockMovement $movement, int $restoreQty): array
    {
        if ($restoreQty <= 0 || $movement->quantity <= 0) {
            return [
                'unit_price' => (int) $movement->unit_price,
                'gross_amount' => 0,
                'commission_amount' => 0,
                'seller_amount' => 0,
            ];
        }

        if ($restoreQty === (int) $movement->quantity) {
            return [
                'unit_price' => (int) $movement->unit_price,
                'gross_amount' => (int) $movement->gross_amount,
                'commission_amount' => (int) $movement->commission_amount,
                'seller_amount' => (int) $movement->seller_amount,
            ];
        }

        $grossAmount = self::grossAmount((int) $movement->unit_price, $restoreQty);
        $commissionAmount = intdiv((int) $movement->commission_amount * $restoreQty, (int) $movement->quantity);

        return [
            'unit_price' => (int) $movement->unit_price,
            'gross_amount' => $grossAmount,
            'commission_amount' => $commissionAmount,
            'seller_amount' => self::sellerAmount($grossAmount, $commissionAmount),
        ];
    }

    /**
     * Payout balance: sum stored seller_amount on out movements minus linked
     * reversals, per movement.
     *
     * Out movements that have been reversed (restocked) via a reverse movement
     * are netted: full reverse nets to zero, partial reverse nets proportionally.
     * Cancelled sales never contribute to a seller's payable balance.
     */
    public static function sellerEarningsFromOutMovements(int $consignmentId): int
    {
        $outs = UpJurusanStockMovement::query()
            ->where('up_jurusan_consignment_id', $consignmentId)
            ->where('type', 'out')
            ->pluck('seller_amount', 'id');

        if ($outs->isEmpty()) {
            return 0;
        }

        $reversals = UpJurusanStockMovement::query()
            ->whereIn('reverses_movement_id', $outs->keys()->all())
            ->groupBy('reverses_movement_id')
            ->selectRaw('reverses_movement_id, COALESCE(SUM(seller_amount), 0) as total')
            ->pluck('total', 'reverses_movement_id');

        $total = 0;
        foreach ($outs as $outId => $sellerAmount) {
            $out = (int) $sellerAmount;

            if (! isset($reversals[$outId])) {
                $total += $out;

                continue;
            }

            $rev = (int) $reversals[$outId];

            // Legacy fixtures create reversals without amounts (0); treat as
            // full reversal for backward compatibility. Real reversals carry
            // proportional amounts via reverseMovementSplit.
            $total += $rev === 0 ? 0 : max(0, $out - $rev);
        }

        return max(0, $total);
    }

    public static function paidPayoutAmount(int $consignmentId): int
    {
        return (int) UpJurusanPayout::query()
            ->where('up_jurusan_consignment_id', $consignmentId)
            ->sum('amount');
    }

    public static function unpaidSellerAmount(int $consignmentId): int
    {
        return max(0, self::sellerEarningsFromOutMovements($consignmentId) - self::paidPayoutAmount($consignmentId));
    }

    /**
     * Grouped seller earnings keyed by consignment id - one query instead of
     * two SUMs per row when rendering a list. Same semantics as
     * sellerEarningsFromOutMovements (out minus linked reversals per movement).
     *
     * @param  iterable<int, int|string>  $consignmentIds
     * @return array<int, int>
     */
    public static function sellerEarningsMap(iterable $consignmentIds): array
    {
        $ids = self::normalizeConsignmentIds($consignmentIds);

        if ($ids === []) {
            return [];
        }

        $outs = UpJurusanStockMovement::query()
            ->whereIn('up_jurusan_consignment_id', $ids)
            ->where('type', 'out')
            ->get(['id', 'up_jurusan_consignment_id', 'seller_amount']);

        if ($outs->isEmpty()) {
            return [];
        }

        $reversals = UpJurusanStockMovement::query()
            ->whereIn('reverses_movement_id', $outs->pluck('id')->all())
            ->groupBy('reverses_movement_id')
            ->selectRaw('reverses_movement_id, COALESCE(SUM(seller_amount), 0) as total')
            ->pluck('total', 'reverses_movement_id')
            ->map(fn (mixed $total): int => (int) $total)
            ->all();

        $result = [];
        foreach ($outs as $out) {
            $cid = (int) $out->getAttribute('up_jurusan_consignment_id');
            $outAmount = (int) $out->getAttribute('seller_amount');
            $result[$cid] ??= 0;

            if (! isset($reversals[$out->getAttribute('id')])) {
                $result[$cid] += $outAmount;

                continue;
            }

            $rev = (int) $reversals[$out->getAttribute('id')];
            $result[$cid] += $rev === 0 ? 0 : max(0, $outAmount - $rev);
        }

        foreach ($result as $cid => $total) {
            $result[$cid] = max(0, (int) $total);
        }

        return $result;
    }

    /**
     * Grouped paid payout totals keyed by consignment id.
     *
     * @param  iterable<int, int|string>  $consignmentIds
     * @return array<int, int>
     */
    public static function paidPayoutMap(iterable $consignmentIds): array
    {
        $ids = self::normalizeConsignmentIds($consignmentIds);

        if ($ids === []) {
            return [];
        }

        return UpJurusanPayout::query()
            ->whereIn('up_jurusan_consignment_id', $ids)
            ->groupBy('up_jurusan_consignment_id')
            ->selectRaw('up_jurusan_consignment_id, COALESCE(SUM(amount), 0) as total')
            ->pluck('total', 'up_jurusan_consignment_id')
            ->map(fn (mixed $total): int => (int) $total)
            ->all();
    }

    /**
     * @param  iterable<int, int|string>  $consignmentIds
     * @return list<int>
     */
    private static function normalizeConsignmentIds(iterable $consignmentIds): array
    {
        $ids = [];

        foreach ($consignmentIds as $consignmentId) {
            $ids[] = (int) $consignmentId;
        }

        return $ids;
    }
}
