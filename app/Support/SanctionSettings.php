<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class SanctionSettings
{
    public const string KEY = 'sanction_rules';

    public const string SELLER_KEY = 'seller_sanction_rules';

    private const int DEFAULT_WINDOW_DAYS = 30;

    private const int DEFAULT_WARNING_POINTS = 3;

    private const int DEFAULT_RECEIPT_FORCE_COMPLETE_COUNT = 5;

    private const int DEFAULT_PAYMENT_CONFIRM_SLA_HOURS = 48;

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

    /**
     * @return array{window_days: int, warning_points: int, payment_confirm_sla_hours: int}
     */
    public static function sellerAll(): array
    {
        return [
            'window_days' => self::sellerWindowDays(),
            'warning_points' => self::sellerWarningPoints(),
            'payment_confirm_sla_hours' => self::paymentConfirmSlaHours(),
        ];
    }

    public static function windowDays(): int
    {
        return self::intSetting(self::KEY, 'window_days', self::DEFAULT_WINDOW_DAYS);
    }

    public static function warningPoints(): int
    {
        return self::intSetting(self::KEY, 'warning_points', self::DEFAULT_WARNING_POINTS);
    }

    public static function receiptForceCompleteCount(): int
    {
        return self::intSetting(self::KEY, 'receipt_force_complete_count', self::DEFAULT_RECEIPT_FORCE_COMPLETE_COUNT);
    }

    public static function sellerWindowDays(): int
    {
        return self::intSetting(self::SELLER_KEY, 'window_days', self::DEFAULT_WINDOW_DAYS);
    }

    public static function sellerWarningPoints(): int
    {
        return self::intSetting(self::SELLER_KEY, 'warning_points', self::DEFAULT_WARNING_POINTS);
    }

    /**
     * How long a seller may leave an incoming payment unconfirmed before it
     * counts as a violation.
     */
    public static function paymentConfirmSlaHours(): int
    {
        return self::intSetting(self::SELLER_KEY, 'payment_confirm_sla_hours', self::DEFAULT_PAYMENT_CONFIRM_SLA_HOURS);
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
     * @param  array<string, mixed>  $rules
     */
    public static function updateSeller(array $rules): void
    {
        Setting::query()->updateOrCreate(
            ['key' => self::SELLER_KEY],
            ['value' => json_encode([
                'window_days' => max(1, (int) ($rules['window_days'] ?? self::DEFAULT_WINDOW_DAYS)),
                'warning_points' => max(1, (int) ($rules['warning_points'] ?? self::DEFAULT_WARNING_POINTS)),
                'payment_confirm_sla_hours' => max(1, (int) ($rules['payment_confirm_sla_hours'] ?? self::DEFAULT_PAYMENT_CONFIRM_SLA_HOURS)),
            ])],
        );
    }

    /**
     * Start of the rolling violation window.
     */
    public static function windowStart(?CarbonInterface $now = null): CarbonImmutable
    {
        return self::rollingStart(self::windowDays(), $now);
    }

    /**
     * Start of the rolling seller violation window.
     */
    public static function sellerWindowStart(?CarbonInterface $now = null): CarbonImmutable
    {
        return self::rollingStart(self::sellerWindowDays(), $now);
    }

    private static function rollingStart(int $days, ?CarbonInterface $now): CarbonImmutable
    {
        return ($now ?? now())->toImmutable()->subDays($days);
    }

    private static function intSetting(string $key, string $name, int $default): int
    {
        $raw = Setting::query()->where('key', $key)->value('value');

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
