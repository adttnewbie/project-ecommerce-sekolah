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
        $isRejected = $event->status === 'rejected';

        if ($event->status !== 'approved' && ! $isRejected) {
            return;
        }

        $item = OrderItem::query()
            ->with('product:id,seller_id,sales_method')
            ->find($event->orderItemId);

        $sellerId = $item?->product?->seller_id;

        if ($sellerId === null) {
            Log::warning('No seller found for payment-paid notification', [
                'order_item_id' => $event->orderItemId,
            ]);

            return;
        }

        if ($isRejected) {
            // Seller konsinyasi diblokir menolak sendiri (SellerOrderController),
            // sehingga rejection selalu berasal dari picket dan wajib diteruskan
            // ke seller. Item non-konsinyasi: seller adalah aktornya sendiri.
            if (! $item->product->usesConsignmentStock()) {
                return;
            }

            if ($sellerId === $event->processedBy) {
                return;
            }

            NotificationDispatch::toUser(
                $sellerId,
                NotificationType::Payment->value,
                "seller-payment-rejected:{$event->orderItemId}",
                [
                    'href' => route('seller.orders.show', $event->orderItemId, false),
                    'title' => "Pembayaran {$event->orderNumber} ditolak",
                    'description' => 'Pembayaran sebesar Rp '.number_format($event->amount, 0, ',', '.').' ditolak picket. Alasan: '.($event->rejectionReason ?? 'tidak valid.'),
                    'data' => [
                        'order_item_id' => $event->orderItemId,
                        'amount' => $event->amount,
                        'source' => 'payment_rejected',
                    ],
                ],
            );

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
