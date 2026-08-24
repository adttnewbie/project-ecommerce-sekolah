<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Support\Facades\Log;

/**
 * Single choke point for persisted in-app notifications: consults the
 * recipient's in_app preference and keeps delivery idempotent per
 * user + key.
 */
class NotificationDispatch
{
    /**
     * @param  array<string, mixed>  $attributes  title/description/href/data payload
     */
    public static function toUser(int $userId, string $type, string $key, array $attributes): bool
    {
        if (! NotificationPreference::allowsInApp($userId, $type)) {
            Log::info('Notification skipped by user preference', [
                'user_id' => $userId,
                'type' => $type,
                'key' => $key,
            ]);

            return false;
        }

        Notification::firstOrCreate(
            ['user_id' => $userId, 'key' => $key],
            ['type' => $type] + $attributes + ['created_at' => now()],
        );

        return true;
    }

    /**
     * Deliver to every user holding a role (e.g. all admins are equal peers).
     *
     * @param  array<string, mixed>  $attributes
     */
    public static function toRole(string $role, string $type, string $key, array $attributes): int
    {
        $delivered = 0;

        User::query()
            ->where('role', $role)
            ->orderBy('id')
            ->pluck('id')
            ->each(function (int $userId) use (&$delivered, $type, $key, $attributes): void {
                if (self::toUser($userId, $type, $key, $attributes)) {
                    $delivered++;
                }
            });

        if ($delivered === 0) {
            Log::warning('No recipient received notification', [
                'role' => $role,
                'type' => $type,
                'key' => $key,
            ]);
        }

        return $delivered;
    }
}
