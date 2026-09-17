<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\SellerApplicationDecided;
use App\Support\NotificationDispatch;

class SellerApplicationDecidedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SellerApplicationDecided $event): void
    {
        NotificationDispatch::toUser(
            $event->userId,
            NotificationType::System->value,
            $event->notificationKey(),
            [
                'href' => route('seller-application.index', absolute: false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'application_id' => $event->applicationId,
                    'decision' => $event->decision,
                    'source' => 'seller_application_decided',
                ],
            ],
        );
    }
}
