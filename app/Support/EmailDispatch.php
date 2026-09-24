<?php

namespace App\Support;

use App\Mail\ImportantNotificationMail;
use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Single choke point for important transactional emails: consults the
 * recipient's email preference and keeps delivery idempotent per
 * user + key for 24 hours (queued retries or double-dispatched events
 * must not send the same email twice).
 */
class EmailDispatch
{
    /**
     * @param  array{href?: string|null, title: string, description?: string|null}  $attributes
     */
    public static function toUser(int $userId, string $type, string $key, array $attributes): bool
    {
        if (! NotificationPreference::allowsEmail($userId, $type)) {
            Log::info('Email skipped by user preference', [
                'user_id' => $userId,
                'type' => $type,
                'key' => $key,
            ]);

            return false;
        }

        if (! Cache::add(self::cacheKey($userId, $key), true, now()->addDay())) {
            Log::info('Email skipped as duplicate', [
                'user_id' => $userId,
                'type' => $type,
                'key' => $key,
            ]);

            return false;
        }

        $user = User::query()->select(['id', 'name', 'email'])->find($userId);

        $email = (string) ($user->email ?? '');

        if ($user === null || $email === '') {
            Log::warning('Email skipped, recipient has no email address', [
                'user_id' => $userId,
                'key' => $key,
            ]);

            return false;
        }

        $href = $attributes['href'] ?? null;

        Mail::to($email)->queue(new ImportantNotificationMail(
            recipientName: $user->name,
            notificationTitle: $attributes['title'],
            notificationDescription: (string) ($attributes['description'] ?? ''),
            actionUrl: is_string($href) && $href !== '' ? url($href) : null,
        ));

        return true;
    }

    private static function cacheKey(int $userId, string $key): string
    {
        return "emailed:{$userId}:{$key}";
    }
}
