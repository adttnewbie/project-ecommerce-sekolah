<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Models\UpJurusanConsignment;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class SellerConsignmentDecidedNotify
{
    /**
     * Notify the seller when their consignment request is approved,
     * rejected, or cancelled by the jurusan admin.
     */
    public function handle(OrderItemStatusChanged $event): void
    {
        if ($event->consignmentId === null) {
            return;
        }

        if (! in_array($event->consignmentStatus, ['approved', 'rejected', 'cancelled'], true)) {
            return;
        }

        $sellerId = UpJurusanConsignment::query()
            ->whereKey($event->consignmentId)
            ->value('seller_id');

        if ($sellerId === null) {
            Log::warning('No seller found for consignment decision notification', [
                'consignment_id' => $event->consignmentId,
            ]);

            return;
        }

        $status = $event->consignmentStatus;
        $label = match ($status) {
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            'cancelled' => 'dibatalkan',
        };

        NotificationDispatch::toUser(
            (int) $sellerId,
            'order',
            "seller-consignment:{$event->consignmentId}:{$status}",
            [
                'title' => "Titipan {$event->productName} {$label}",
                'description' => "Titipan {$event->productName} {$event->action}",
                'href' => route('seller.consignments.index', absolute: false),
                'data' => [
                    'consignment_id' => $event->consignmentId,
                    'status' => $status,
                    'source' => 'order_item_status_changed',
                ],
            ],
        );
    }
}
