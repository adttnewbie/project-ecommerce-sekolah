<?php

namespace App\Enums;

enum PreOrderStatus: string
{
    case Open = 'open';
    case ClosingSoon = 'closing_soon';
    case Closed = 'closed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Pre-Order Dibuka',
            self::ClosingSoon => 'Segera Ditutup',
            self::Closed => 'Pre-Order Ditutup',
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
