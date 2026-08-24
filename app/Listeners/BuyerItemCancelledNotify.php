<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\OrderItemCancelled;
use App\Support\NotificationDispatch;

class BuyerItemCancelledNotify
{
    /**
     * Tell the buyer when someone else cancels one of their items (seller or
     * picket). Buyer self-cancels are silent by definition, and auto-expiry /
     * admin force-cancel already reach the buyer through BuyerOrderStateChanged.
     */
    public function handle(OrderItemCancelled $event): void
    {
        if ($event->actorId === $event->buyerId) {
            return;
        }

        if (! in_array($event->actorRole, [
            UserRole::Seller->value,
            UserRole::PicketOfficer->value,
        ], true)) {
            return;
        }

        $actorLabel = $event->actorRole === UserRole::Seller->value
            ? 'penjual'
            : 'petugas';

        NotificationDispatch::toUser(
            $event->buyerId,
            'order',
            "buyer-order-item:{$event->orderItemId}:cancelled",
            [
                'href' => route('orders.show', $event->orderId, false),
                'title' => "Pesanan {$event->productName} dibatalkan",
                'description' => "Dibatalkan oleh {$actorLabel}. Alasan: ".($event->reason ?? 'tidak disebutkan'),
                'data' => [
                    'order_id' => $event->orderId,
                    'order_item_id' => $event->orderItemId,
                    'source' => 'order_item_cancelled',
                ],
            ],
        );
    }
}
