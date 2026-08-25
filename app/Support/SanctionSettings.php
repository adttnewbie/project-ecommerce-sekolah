<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class SanctionSettings
{
    public const string KEY = 'sanction_rules';

    private const int DEFAULT_WINDOW_DAYS = 30;

    private const int DEFAULT_WARNING_POINTS = 3;

    private const int DEFAULT_RECEIPT_FORCE_COMPLETE_COUNT = 5;

    /**
     * @return array{window_days: int, warning_points: int, receipt_force_complete_count: int}
     */
    public static function all(): array
    {
        return [
            'window_days' => self::windowDays(),
            'warning_points' => self::warningPoints(),
            'receipt_force_complete_count' => self::receiptForceCompleteCount(),
        ];
    }

    public static function windowDays(): int
    {
        return self::intSetting('window_days', self::DEFAULT_WINDOW_DAYS);
    }

    public static function warningPoints(): int
    {
        return self::intSetting('warning_points', self::DEFAULT_WARNING_POINTS);
    }

    public static function receiptForceCompleteCount(): int
    {
        return self::intSetting('receipt_force_complete_count', self::DEFAULT_RECEIPT_FORCE_COMPLETE_COUNT);
    }

    /**
     * @param  array<string, mixed>  $rules
     */
    public static function update(array $rules): void
    {
        Setting::query()->updateOrCreate(
            ['key' => self::KEY],
            ['value' => json_encode([
                'window_days' => max(1, (int) ($rules['window_days'] ?? self::DEFAULT_WINDOW_DAYS)),
                'warning_points' => max(1, (int) ($rules['warning_points'] ?? self::DEFAULT_WARNING_POINTS)),
                'receipt_force_complete_count' => max(1, (int) ($rules['receipt_force_complete_count'] ?? self::DEFAULT_RECEIPT_FORCE_COMPLETE_COUNT)),
            ])],
        );
    }

    /**
     * Start of the rolling violation window.
     */
    public static function windowStart(?CarbonInterface $now = null): CarbonImmutable
    {
        return ($now ?? now())->toImmutable()->subDays(self::windowDays());
    }

    private static function intSetting(string $name, int $default): int
    {
        $raw = Setting::query()->where('key', self::KEY)->value('value');

        if (! is_string($raw) || $raw === '') {
            return $default;
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return $default;
        }

        if (! is_array($decoded)) {
            return $default;
        }

        $value = (int) ($decoded[$name] ?? -1);

        return $value > 0 ? $value : $default;
    }
}
