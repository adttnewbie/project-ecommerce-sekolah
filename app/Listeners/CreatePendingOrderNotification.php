<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\PendingOrderCreated;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class CreatePendingOrderNotification
{
    /**
     * Handle the event.
     */
    public function handle(PendingOrderCreated $event): void
    {
        $notificationKey = $event->notificationKey();

        $delivered = NotificationDispatch::toUser(
            $event->sellerId,
            NotificationType::Order->value,
            $notificationKey,
            [
                // The seller route binds an OrderItem, not an Order; link the
                // item that belongs to this seller (fall back to the center
                // page when the event carries no item id).
                'href' => $event->orderItemId !== null
                    ? route('seller.orders.show', $event->orderItemId, false)
                    : route('seller.orders.index', absolute: false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'order_id' => $event->orderId,
                    'product_id' => $event->productId,
                    'source' => 'pending_order_created',
                ],
            ],
        );

        if (! $delivered) {
            Log::info('Pending order notification skipped', [
                'key' => $notificationKey,
                'user_id' => $event->sellerId,
            ]);
        }
    }
}
