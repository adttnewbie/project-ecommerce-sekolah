<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\OrderItemCancelled;
use App\Support\NotificationDispatch;

class SellerCancelledOrderNotify
{
    /**
     * Sellers hear about every cancellation of their items - buyer-initiated,
     * picket/admin actions, payment-rejection auto-cancels and expiry - but
     * never about their own.
     */
    public function handle(OrderItemCancelled $event): void
    {
        if ($event->actorId === $event->sellerId) {
            return;
        }

        NotificationDispatch::toUser(
            $event->sellerId,
            'order',
            "seller-item-cancelled:{$event->orderItemId}",
            [
                'href' => route('seller.orders.show', $event->orderItemId, false),
                'title' => "Pesanan {$event->productName} dibatalkan",
                'description' => "{$this->actorLabel($event)} membatalkan pesanan. Alasan: ".($event->reason ?? 'tidak disebutkan'),
                'data' => [
                    'order_id' => $event->orderId,
                    'order_item_id' => $event->orderItemId,
                    'is_expiry' => $event->isExpiry,
                    'source' => 'order_item_cancelled',
                ],
            ],
        );
    }

    private function actorLabel(OrderItemCancelled $event): string
    {
        if ($event->isExpiry) {
            return 'Sistem';
        }

        return match ($event->actorRole) {
            UserRole::Buyer->value => 'Pembeli',
            UserRole::Seller->value => 'Seller',
            UserRole::PicketOfficer->value => 'Petugas picket',
            UserRole::Admin->value => 'Admin',
            default => 'Pihak terkait',
        };
    }
}
