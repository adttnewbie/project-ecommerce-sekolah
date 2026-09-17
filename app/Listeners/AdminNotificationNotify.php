<?php

namespace App\Listeners;

use App\Events\AdminNotificationTriggered;
use App\Support\NotificationDispatch;

class AdminNotificationNotify
{
    /**
     * Handle the event.
     *
     * Key idempotensi dipertahankan dalam format manual
     * admin-order-state:{order_id}:{title} dan TIDAK memakai
     * $event->notificationKey(): helper itu mengembalikan
     * admin-{type}-{adminId}-md5(title) yang per-admin (tidak cocok untuk
     * toRole yang memakai satu key bersama) dan tidak memuat order_id
     * sehingga tidak unik per order secara eksplisit.
     */
    public function handle(AdminNotificationTriggered $event): void
    {
        $orderId = $event->data['order_id'] ?? 'unknown';

        NotificationDispatch::toRole(
            'admin',
            $event->type,
            "admin-order-state:{$orderId}:{$event->title}",
            [
                'title' => $event->title,
                'description' => $event->description,
                'href' => $event->href ?? route('dashboard', false),
                'data' => $event->data,
            ]
        );
    }
}
