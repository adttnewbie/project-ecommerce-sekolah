<?php

namespace App\Listeners;

use App\Events\AdminNotificationTriggered;
use App\Support\NotificationDispatch;

class AdminNotificationNotify
{
    /**
     * Handle the event.
     */
    public function handle(AdminNotificationTriggered $event): void
    {
        NotificationDispatch::toRole(
            'admin',
            $event->type,
            "admin-order-state:{$event->data['order_id']}:{$event->title}",
            [
                'title' => $event->title,
                'description' => $event->description,
                'href' => $event->href ?? route('dashboard', false),
                'data' => $event->data,
            ]
        );
    }
}
