<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Models\UpJurusanConsignment;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class SellerConsignmentStockNotify
{
    /**
     * Notify the seller when picket receives their consigned stock or
     * sells it via POS. The decided-only listener ignores these
     * received/completed transitions, so this covers the stock path.
     */
    public function handle(OrderItemStatusChanged $event): void
    {
        if ($event->consignmentId === null) {
            return;
        }

        if (! in_array($event->consignmentStatus, ['received', 'completed'], true)) {
            return;
        }

        $sellerId = UpJurusanConsignment::query()
            ->whereKey($event->consignmentId)
            ->value('seller_id');

        if ($sellerId === null) {
            Log::warning('No seller found for consignment stock notification', [
                'consignment_id' => $event->consignmentId,
            ]);

            return;
        }

        $status = $event->consignmentStatus;
        $label = match ($status) {
            'received' => 'diterima',
            'completed' => 'selesai terjual',
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
