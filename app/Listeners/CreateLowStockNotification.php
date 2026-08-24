<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\LowStockDetected;
use App\Support\NotificationDispatch;

class CreateLowStockNotification
{
    /**
     * Handle the event.
     */
    public function handle(LowStockDetected $event): void
    {
        NotificationDispatch::toUser(
            $event->sellerId,
            NotificationType::Stock->value,
            $event->notificationKey(),
            [
                'href' => route('seller.inventory.index', ['q' => $event->productName], false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'product_id' => $event->productId,
                    'real_stock' => $event->realStock,
                    'source' => 'low_stock_detected',
                ],
            ],
        );
    }
}
