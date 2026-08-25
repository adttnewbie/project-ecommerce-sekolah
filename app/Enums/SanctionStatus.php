<?php

namespace App\Enums;

enum SanctionStatus: string
{
    case Active = 'active';
    case Lifted = 'lifted';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Aktif',
            self::Lifted => 'Dicabut',
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
