<?php

namespace App\Listeners;

use App\Events\BuyerOrderStateChanged;
use App\Models\Order;
use App\Support\EmailDispatch;
use App\Support\NotificationDispatch;

class PersistBuyerOrderNotice
{
    /**
     * Handle the event.
     */
    public function handle(BuyerOrderStateChanged $event): void
    {
        $buyerId = $this->buyerId($event->orderId);

        if ($buyerId === null) {
            return;
        }

        $key = $event->notificationKey();

        $attributes = [
            'href' => route('orders.show', $event->orderId, false),
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            'data' => [
                'order_id' => $event->orderId,
                'state' => $event->state,
                'reason' => $event->reason,
                'source' => 'buyer_order_state_changed',
            ],
        ];

        NotificationDispatch::toUser(
            $buyerId,
            'order',
            $key,
            $attributes,
        );

        EmailDispatch::toUser(
            $buyerId,
            'order',
            $key,
            $attributes,
        );
    }

    private function buyerId(int $orderId): ?int
    {
        return Order::query()->whereKey($orderId)->value('user_id');
    }
}
