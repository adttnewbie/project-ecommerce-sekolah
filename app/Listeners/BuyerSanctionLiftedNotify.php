<?php

namespace App\Listeners;

use App\Events\SanctionLifted;
use App\Support\NotificationDispatch;

class BuyerSanctionLiftedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SanctionLifted $event): void
    {
        NotificationDispatch::toUser(
            $event->buyerId,
            'system',
            $event->notificationKey(),
            [
                'href' => route('orders.index', absolute: false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'sanction_id' => $event->sanctionId,
                    'sanction_type' => $event->type->value,
                    'source' => 'sanction_lifted',
                ],
            ],
        );
    }
}
