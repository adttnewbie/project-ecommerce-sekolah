<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Support\NotificationDispatch;

class PicketOfficerOrderNotify
{
    /**
     * Handle the event.
     */
    public function handle(OrderItemStatusChanged $event): void
    {
        if (! $event->picketId) {
            return;
        }

        NotificationDispatch::toUser(
            $event->picketId,
            'order',
            "picket-officer-order:{$event->orderItemId}-notif",
            [
                'title' => "Pesanan {$event->productName} - {$event->action}",
                'description' => "Buyer: {$event->buyerName}",
                'href' => route('picket.orders', absolute: false),
                'data' => [
                    'order_item_id' => $event->orderItemId,
                    'order_id' => $event->orderId,
                    'product_id' => $event->productId,
                    'buyer_name' => $event->buyerName,
                    'source' => 'order_status_changed',
                ],
            ],
        );
    }
}
