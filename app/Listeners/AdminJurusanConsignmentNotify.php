<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Models\UpJurusanConsignment;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class AdminJurusanConsignmentNotify
{
    /**
     * Handle the event.
     */
    public function handle(OrderItemStatusChanged $event): void
    {
        if (! $event->consignmentId) {
            return;
        }

        // The owner of the consignment's up jurusan is the recipient - not
        // the first admin_jurusan in the database.
        $ownerId = UpJurusanConsignment::query()
            ->whereKey($event->consignmentId)
            ->join('up_jurusans', 'up_jurusans.id', '=', 'up_jurusan_consignments.up_jurusan_id')
            ->value('up_jurusans.admin_jurusan_id');

        if ($ownerId === null) {
            Log::warning('No admin jurusan owner found for consignment notification', [
                'consignment_id' => $event->consignmentId,
            ]);

            return;
        }

        // Per-transition key: approve/reject/cancel each notify once while
        // staying idempotent against retries of the same transition.
        $status = $event->consignmentStatus ?? 'updated';
        $notificationKey = "admin-jurusan-consignment:{$event->consignmentId}:{$status}";

        NotificationDispatch::toUser(
            (int) $ownerId,
            'order',
            $notificationKey,
            [
                'title' => "Barang titipan {$event->productName} {$event->action}",
                'description' => "Dari seller {$event->sellerName}",
                'href' => route('admin-jurusan.consignments.show', $event->consignmentId, false),
                'data' => [
                    'consignment_id' => $event->consignmentId,
                    'status' => $status,
                    'source' => 'order_item_status_changed',
                ],
            ],
        );
    }
}
