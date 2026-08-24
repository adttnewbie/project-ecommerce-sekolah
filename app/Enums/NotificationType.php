<?php

namespace App\Enums;

enum NotificationType: string
{
    case Order = 'order';
    case Stock = 'stock';
    case Product = 'product';
    case Payment = 'payment';
    case System = 'system';
    case Promotion = 'promotion';

    /**
     * Get display label for notification type.
     */
    public function label(): string
    {
        return match ($this) {
            self::Order => 'Pesanan',
            self::Stock => 'Stok',
            self::Product => 'Produk',
            self::Payment => 'Pembayaran',
            self::System => 'Sistem',
            self::Promotion => 'Promosi',
        };
    }

    /**
     * Get icon component class for notification type.
     */
    public function iconClass(): string
    {
        return match ($this) {
            self::Order => '\App\Components\Icons\OrderNotificationIcon',
            self::Stock => '\App\Components\Icons\StockNotificationIcon',
            self::Product => '\App\Components\Icons\ProductNotificationIcon',
            self::Payment => '\App\Components\Icons\PaymentNotificationIcon',
            self::System => '\App\Components\Icons\SystemNotificationIcon',
            self::Promotion => '\App\Components\Icons\PromotionNotificationIcon',
        };
    }

    /**
     * Get accent color for notification type (Tailwind classes).
     */
    public function accentColor(): string
    {
        return match ($this) {
            self::Order => '#4f46e5',      // Blue-600
            self::Stock => '#f59e0b',      // Amber-500
            self::Product => '#10b981',    // Emerald-500
            self::Payment => '#3b82f6',    // Blue-500
            self::System => '#6b7280',     // Gray-500
            self::Promotion => '#ec4899',  // Pink-500
        };
    }
}
