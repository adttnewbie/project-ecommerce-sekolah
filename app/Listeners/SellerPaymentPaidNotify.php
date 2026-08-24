<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\OrderPaymentApproved;
use App\Models\OrderItem;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class SellerPaymentPaidNotify
{
    /**
     * Notify the seller that their item's payment has been settled by the
     * picket. The acting picket never receives this (self-action noise), and
     * seller-initiated approvals do not dispatch the event at all.
     */
    public function handle(OrderPaymentApproved $event): void
    {
        if ($event->status !== 'approved') {
            return;
        }

        $item = OrderItem::query()
            ->with('product:id,seller_id')
            ->find($event->orderItemId);

        $sellerId = $item?->product?->seller_id;

        if ($sellerId === null) {
            Log::warning('No seller found for payment-paid notification', [
                'order_item_id' => $event->orderItemId,
            ]);

            return;
        }

        if ($sellerId === $event->processedBy) {
            return; // Seller confirmed their own cash payment.
        }

        NotificationDispatch::toUser(
            $sellerId,
            NotificationType::Payment->value,
            "seller-payment-paid:{$event->orderItemId}",
            [
                'href' => route('seller.orders.show', $event->orderItemId, false),
                'title' => "Pembayaran {$event->orderNumber} lunas",
                'description' => 'Pembayaran sebesar Rp '.number_format($event->amount, 0, ',', '.').' telah dikonfirmasi picket.',
                'data' => [
                    'order_item_id' => $event->orderItemId,
                    'amount' => $event->amount,
                    'source' => 'payment_paid',
                ],
            ],
        );
    }
}
