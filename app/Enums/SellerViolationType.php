<?php

namespace App\Enums;

enum SellerViolationType: string
{
    case SlowFulfillment = 'slow_fulfillment';
    case PreOrderLate = 'pre_order_late';
    case ExcessiveCancel = 'excessive_cancel';
    case CancelAfterProduction = 'cancel_after_production';
    case UnconfirmedPayment = 'unconfirmed_payment';
    case ProductModerationRejected = 'product_moderation_rejected';

    public function label(): string
    {
        return match ($this) {
            self::SlowFulfillment => 'Pengiriman lambat',
            self::PreOrderLate => 'Pre-order melewati batas waktu',
            self::ExcessiveCancel => 'Pembatalan pesanan berulang',
            self::CancelAfterProduction => 'Batal setelah produksi dimulai',
            self::UnconfirmedPayment => 'Lalai konfirmasi pembayaran',
            self::ProductModerationRejected => 'Produk ditolak moderasi',
        };
    }

    public function defaultPoints(): int
    {
        return match ($this) {
            self::PreOrderLate,
            self::CancelAfterProduction => 2,
            self::SlowFulfillment,
            self::ExcessiveCancel,
            self::UnconfirmedPayment,
            self::ProductModerationRejected => 1,
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
