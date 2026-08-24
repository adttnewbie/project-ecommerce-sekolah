<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Models\OrderItem;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class BuyerOrderStatusNotify
{
    /**
     * Tell the buyer their item progressed (packed/sent/...). Fires for
     * seller and picket transitions; the consignment path carries no
     * itemStatus and is ignored here.
     */
    public function handle(OrderItemStatusChanged $event): void
    {
        if ($event->itemStatus === null || ! $event->orderItemId) {
            return;
        }

        $buyerId = OrderItem::query()
            ->whereKey($event->orderItemId)
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->value('orders.user_id');

        if ($buyerId === null) {
            Log::warning('No buyer found for order status notification', [
                'order_item_id' => $event->orderItemId,
            ]);

            return;
        }

        NotificationDispatch::toUser(
            (int) $buyerId,
            'order',
            "buyer-order-item:{$event->orderItemId}:{$event->itemStatus}",
            [
                'href' => route('orders.show', $event->orderId, false),
                'title' => "Pesanan {$event->productName} {$event->action}",
                'description' => "Diproses oleh {$event->sellerName}.",
                'data' => [
                    'order_id' => $event->orderId,
                    'order_item_id' => $event->orderItemId,
                    'status' => $event->itemStatus,
                    'source' => 'order_item_status_changed',
                ],
            ],
        );
    }
}
