<?php

namespace App\Enums;

enum StockMovementSource: string
{
    case PosSale = 'pos_sale';
    case OnlineOrder = 'online_order';
    case DeliveryFee = 'delivery_fee';
    case Reverse = 'reverse';
    case Correction = 'correction';

    public function label(): string
    {
        return match ($this) {
            self::PosSale => 'POS',
            self::OnlineOrder => 'Online',
            self::DeliveryFee => 'Biaya Antar',
            self::Reverse => 'Reverse',
            self::Correction => 'Koreksi',
        };
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Sources counted as sales revenue (not reverse/correction).
     *
     * @return list<string>
     */
    public static function salesSources(): array
    {
        return [
            self::PosSale->value,
            self::OnlineOrder->value,
            self::DeliveryFee->value,
        ];
    }
}
