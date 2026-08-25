<?php

namespace App\Enums;

enum BuyerViolationType: string
{
    case UnpaidExpired = 'unpaid_expired';
    case ExcessiveCancel = 'excessive_cancel';
    case CancelInProduction = 'cancel_in_production';
    case ReviewRejected = 'review_rejected';
    case UnconfirmedReceipt = 'unconfirmed_receipt';

    public function label(): string
    {
        return match ($this) {
            self::UnpaidExpired => 'Pesanan kedaluwarsa tak dibayar',
            self::ExcessiveCancel => 'Pembatalan pesanan berulang',
            self::CancelInProduction => 'Batal setelah produksi dimulai',
            self::ReviewRejected => 'Ulasan ditolak moderasi',
            self::UnconfirmedReceipt => 'Tidak konfirmasi penerimaan',
        };
    }

    public function defaultPoints(): int
    {
        return match ($this) {
            self::CancelInProduction => 2,
            self::UnpaidExpired,
            self::ExcessiveCancel,
            self::ReviewRejected,
            self::UnconfirmedReceipt => 1,
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
