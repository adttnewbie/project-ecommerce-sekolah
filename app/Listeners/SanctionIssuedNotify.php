<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\SanctionIssued;
use App\Models\User;
use App\Support\NotificationDispatch;

class SanctionIssuedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SanctionIssued $event): void
    {
        NotificationDispatch::toUser(
            $event->userId,
            'system',
            $event->notificationKey(),
            [
                'href' => self::href($event->userId),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'sanction_id' => $event->sanctionId,
                    'sanction_type' => $event->type->value,
                    'source' => 'sanction_issued',
                ],
            ],
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
