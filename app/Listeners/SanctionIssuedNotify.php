<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Models\User;
use App\Support\EmailDispatch;
use App\Support\NotificationDispatch;

class SanctionIssuedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SanctionIssued $event): void
    {
        $key = $event->notificationKey();

        $attributes = [
            'href' => self::href($event->userId),
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            'data' => [
                'sanction_id' => $event->sanctionId,
                'sanction_type' => $event->type->value,
                'source' => 'sanction_issued',
            ],
        ];

        NotificationDispatch::toUser(
            $event->userId,
            'system',
            $key,
            $attributes,
        );

        EmailDispatch::toUser(
            $event->userId,
            'system',
            $key,
            $attributes,
        );
    }

    private static function href(int $userId): string
    {
        $role = User::query()->whereKey($userId)->value('role');

        return $role === UserRole::Seller->value
            ? route('seller.dashboard', absolute: false)
            : route('orders.index', absolute: false);
    }
}
