<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\SellerApplicationDecided;
use App\Support\EmailDispatch;
use App\Support\NotificationDispatch;

class SellerApplicationDecidedNotify
{
    /**
     * Handle the event.
     */
    public function handle(SellerApplicationDecided $event): void
    {
        $key = $event->notificationKey();

        $attributes = [
            'href' => route('seller-application.index', absolute: false),
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            'data' => [
                'application_id' => $event->applicationId,
                'decision' => $event->decision,
                'source' => 'seller_application_decided',
            ],
        ];

        NotificationDispatch::toUser(
            $event->userId,
            NotificationType::System->value,
            $key,
            $attributes,
        );

        EmailDispatch::toUser(
            $event->userId,
            NotificationType::System->value,
            $key,
            $attributes,
        );
    }
}
