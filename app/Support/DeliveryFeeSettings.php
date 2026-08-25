<?php

namespace App\Support;

use App\Models\Setting;

class DeliveryFeeSettings
{
    public const KEY = 'delivery_fee_tiers';

    public const MAX_TIERS = 20;

    /**
     * @var list<array{min_spend: int, fee: int}>
     */
    private const DEFAULT_TIERS = [
        ['min_spend' => 0, 'fee' => 0],
    ];

    /**
     * Normalized tier rules sorted ascending by min_spend. The first rule
     * always starts at Rp 0 so every delivery order matches exactly one tier.
     *
     * @return list<array{min_spend: int, fee: int}>
     */
    public static function tiers(): array
    {
        $raw = Setting::query()->where('key', self::KEY)->value('value');

        if (! is_string($raw) || $raw === '') {
            return self::DEFAULT_TIERS;
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return self::DEFAULT_TIERS;
        }

        if (! is_array($decoded)) {
            return self::DEFAULT_TIERS;
        }

        $tiers = [];

        foreach ($decoded as $row) {
            if (! is_array($row)) {
                continue;
            }

            $minSpend = (int) ($row['min_spend'] ?? -1);
            $fee = (int) ($row['fee'] ?? -1);

            if ($minSpend < 0 || $fee < 0) {
                continue;
            }

            $tiers[] = ['min_spend' => $minSpend, 'fee' => $fee];
        }

        usort($tiers, fn (array $a, array $b): int => $a['min_spend'] <=> $b['min_spend']);

        return $tiers === [] ? self::DEFAULT_TIERS : $tiers;
    }

    /**
     * @param  iterable<array<string, mixed>>  $tiers
     */
    public static function updateTiers(iterable $tiers): void
    {
        $normalized = [];

        foreach ($tiers as $tier) {
            $normalized[] = [
                'min_spend' => max(0, (int) ($tier['min_spend'] ?? 0)),
                'fee' => max(0, (int) ($tier['fee'] ?? 0)),
            ];
        }

        usort($normalized, fn (array $a, array $b): int => $a['min_spend'] <=> $b['min_spend']);

        Setting::query()->updateOrCreate(
            ['key' => self::KEY],
            ['value' => json_encode($normalized)],
        );
    }
}
