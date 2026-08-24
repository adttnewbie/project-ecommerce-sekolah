<?php

namespace App\Listeners;

use App\Events\BuyerOrderStateChanged;
use App\Models\Order;
use App\Support\NotificationDispatch;

class PersistBuyerOrderNotice
{
    /**
     * Handle the event.
     */
    public function handle(BuyerOrderStateChanged $event): void
    {
        NotificationDispatch::toUser(
            $this->buyerId($event->orderId),
            'order',
            $event->notificationKey(),
            [
                'href' => route('orders.show', $event->orderId, false),
                'title' => $event->notificationTitle(),
                'description' => $event->notificationDescription(),
                'data' => [
                    'order_id' => $event->orderId,
                    'state' => $event->state,
                    'reason' => $event->reason,
                    'source' => 'buyer_order_state_changed',
                ],
            ],
        );
    }

    private function buyerId(int $orderId): ?int
    {
        return Order::query()->whereKey($orderId)->value('user_id');
    }
}
