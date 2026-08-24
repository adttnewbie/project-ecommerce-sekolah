<?php

namespace App\Listeners;

use App\Events\PendingOrderCreated;
use App\Support\NotificationDispatch;

class AdminOrderNotify
{
    /**
     * Handle the event.
     */
    public function handle(PendingOrderCreated $event): void
    {
        NotificationDispatch::toRole(
            'admin',
            'order',
            "admin-order:{$event->orderId}",
            [
                'title' => "Pesanan baru dari {$event->buyerName}",
                'description' => 'Total: Rp '.number_format($event->totalPrice, 0, ',', '.'),
                'href' => route('admin.orders.index', ['filter_pending' => 1], false),
                'data' => [
                    'order_id' => $event->orderId,
                    'buyer_name' => $event->buyerName,
                    'source' => 'pending_order',
                ],
            ],
        );
    }
}
