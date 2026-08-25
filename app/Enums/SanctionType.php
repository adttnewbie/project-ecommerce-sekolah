<?php

namespace App\Enums;

enum SanctionType: string
{
    case Warning = 'warning';
    case CheckoutBan = 'checkout_ban';
    case ReviewBan = 'review_ban';
    case PermanentBan = 'permanent_ban';

    public function label(): string
    {
        return match ($this) {
            self::Warning => 'Peringatan',
            self::CheckoutBan => 'Blokir Checkout',
            self::ReviewBan => 'Blokir Ulasan',
            self::PermanentBan => 'Blokir Permanen',
        };
    }

    public function blocksCheckout(): bool
    {
        return match ($this) {
            self::Warning, self::ReviewBan => false,
            self::CheckoutBan, self::PermanentBan => true,
        };
    }

    public function blocksReview(): bool
    {
        return match ($this) {
            self::Warning, self::CheckoutBan => false,
            self::ReviewBan, self::PermanentBan => true,
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
