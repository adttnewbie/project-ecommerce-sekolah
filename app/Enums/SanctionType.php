<?php

namespace App\Enums;

enum SanctionType: string
{
    case Warning = 'warning';
    case CheckoutBan = 'checkout_ban';
    case ReviewBan = 'review_ban';
    case PermanentBan = 'permanent_ban';
    case ListingBan = 'listing_ban';
    case SellingSuspension = 'selling_suspension';

    public function label(): string
    {
        return match ($this) {
            self::Warning => 'Peringatan',
            self::CheckoutBan => 'Blokir Checkout',
            self::ReviewBan => 'Blokir Ulasan',
            self::PermanentBan => 'Blokir Permanen',
            self::ListingBan => 'Blokir Produk',
            self::SellingSuspension => 'Suspensi Penjualan',
        };
    }

    public function blocksCheckout(): bool
    {
        return match ($this) {
            self::Warning, self::ReviewBan, self::ListingBan, self::SellingSuspension => false,
            self::CheckoutBan, self::PermanentBan => true,
        };
    }

    public function blocksReview(): bool
    {
        return match ($this) {
            self::Warning, self::CheckoutBan, self::ListingBan, self::SellingSuspension => false,
            self::ReviewBan, self::PermanentBan => true,
        };
    }

    public function blocksListing(): bool
    {
        return match ($this) {
            self::Warning, self::ReviewBan, self::CheckoutBan => false,
            self::ListingBan, self::SellingSuspension, self::PermanentBan => true,
        };
    }

    public function blocksSelling(): bool
    {
        return match ($this) {
            self::Warning, self::ReviewBan, self::CheckoutBan, self::ListingBan => false,
            self::SellingSuspension, self::PermanentBan => true,
        };
    }

    /**
     * Higher value = more severe. Used to pick the dominant active sanction.
     */
    public function severity(): int
    {
        return match ($this) {
            self::Warning => 0,
            self::ReviewBan, self::ListingBan => 1,
            self::CheckoutBan, self::SellingSuspension => 2,
            self::PermanentBan => 3,
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
