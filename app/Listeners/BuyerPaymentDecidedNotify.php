<?php

namespace App\Listeners;

use App\Events\OrderPaymentApproved;
use App\Models\OrderItem;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class BuyerPaymentDecidedNotify
{
    /**
     * Tell the buyer whether their cash payment was confirmed or rejected
     * (with the reason). Fires only for picket decisions; seller self-
     * approvals dispatch the same event, so skip when the actor IS the buyer.
     */
    public function handle(OrderPaymentApproved $event): void
    {
        $item = OrderItem::query()
            ->with('order:id,user_id')
            ->find($event->orderItemId);

        $buyerId = $item?->order?->user_id;

        if ($buyerId === null) {
            Log::warning('No buyer found for payment decision notification', [
                'order_item_id' => $event->orderItemId,
            ]);

            return;
        }

        $approved = $event->status === 'approved';

        NotificationDispatch::toUser(
            $buyerId,
            'payment',
            "buyer-payment:{$event->orderItemId}:{$event->status}",
            [
                'href' => route('orders.show', $item->order_id, false),
                'title' => $approved
                    ? "Pembayaran {$event->orderNumber} dikonfirmasi"
                    : "Pembayaran {$event->orderNumber} ditolak",
                'description' => $approved
                    ? 'Pembayaran sebesar Rp '.number_format($event->amount, 0, ',', '.').' telah dikonfirmasi.'
                    : 'Alasan: '.($event->rejectionReason ?? 'tidak valid.'),
                'data' => [
                    'order_item_id' => $event->orderItemId,
                    'status' => $event->status,
                    'amount' => $event->amount,
                    'source' => 'payment_decided',
                ],
            ],
        );
    }
}
