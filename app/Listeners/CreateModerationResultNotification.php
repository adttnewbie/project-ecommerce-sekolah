<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\ProductModerationDecided;
use App\Support\NotificationDispatch;

class CreateModerationResultNotification
{
    /**
     * Handle the event.
     */
    public function handle(ProductModerationDecided $event): void
    {
        NotificationDispatch::toUser(
            $event->sellerId,
            NotificationType::Product->value,
            $event->notificationKey(),
            [
                'href' => route('seller.products.index', absolute: false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'product_id' => $event->productId,
                    'decision' => $event->decision,
                    'source' => 'product_moderation_decided',
                ],
            ],
        );
    }
}
