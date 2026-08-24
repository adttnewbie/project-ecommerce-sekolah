<?php

namespace App\Listeners;

use App\Events\OrderItemStatusChanged;
use App\Models\Notification;
use App\Models\User;
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

        $adminJurusan = User::where('role', 'admin_jurusan')
            ->first();

        if (! $adminJurusan) {
            Log::warning('No admin jurusan user found to receive consignment notification');

            return;
        }

        $notificationKey = "admin-jurusan-consignment:{$event->consignmentId}-notif";

        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $adminJurusan->id,
            'type' => 'order',
            'key' => $notificationKey,
            'title' => "Barang titipan {$event->productName} {$event->action}",
            'description' => "Dari seller {$event->sellerName}",
            'href' => route('admin-jurusan.consignments.show', $event->consignmentId, false),
            'data' => [
                'consignment_id' => $event->consignmentId,
                'product_id' => $event->productId,
                'seller_name' => $event->sellerName,
                'source' => 'consignment_update',
            ],
            'created_at' => now(),
        ]);
    }
}
