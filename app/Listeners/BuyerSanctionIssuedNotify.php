<?php

namespace App\Listeners;

use App\Events\SanctionIssued;
use App\Support\NotificationDispatch;

class BuyerSanctionIssuedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SanctionIssued $event): void
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
                    'source' => 'sanction_issued',
                ],
            ],
        );
    }
}
