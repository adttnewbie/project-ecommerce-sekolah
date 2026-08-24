<?php

namespace App\Listeners;

use App\Enums\UserRole;
use App\Events\OrderItemsAwaitingVerification;
use App\Models\User;
use App\Support\NotificationDispatch;

class PicketVerificationNotify
{
    /**
     * Fan the new-work notice out to every picket officer serving the up
     * jurusan. One notification per order per up jurusan, regardless of how
     * many items are involved.
     */
    public function handle(OrderItemsAwaitingVerification $event): void
    {
        $picketIds = User::query()
            ->where('role', UserRole::PicketOfficer->value)
            ->where('up_jurusan_id', $event->upJurusanId)
            ->orderBy('id')
            ->pluck('id');

        foreach ($picketIds as $picketId) {
            NotificationDispatch::toUser(
                (int) $picketId,
                'payment',
                "picket-new-order:{$event->orderId}:{$event->upJurusanId}",
                [
                    'href' => route('picket.orders', absolute: false),
                    'title' => "Pesanan {$event->orderCode} menunggu verifikasi tunai",
                    'description' => "{$event->itemCount} item menunggu konfirmasi pembayaran tunai.",
                    'data' => [
                        'order_id' => $event->orderId,
                        'up_jurusan_id' => $event->upJurusanId,
                        'item_count' => $event->itemCount,
                        'source' => 'items_awaiting_verification',
                    ],
                ],
            );
        }
    }
}
