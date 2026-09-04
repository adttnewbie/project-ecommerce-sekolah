<?php

namespace App\Listeners;

use App\Events\PendingOrderCreated;
use App\Models\User;
use App\Support\WaNotificationService;

class WaOrderCreatedNotify
{
    public function handle(PendingOrderCreated $event): void
    {
        $seller = User::find($event->sellerId);

        if (! $seller || ! $seller->phone) {
            return;
        }

        WaNotificationService::send($seller->phone, 'order.baru', [
            'seller' => $seller->name,
            'trx' => $event->orderNumber,
            'buyer' => $event->buyerName,
            'total' => 'Rp'.number_format($event->totalPrice, 0, ',', '.'),
        ]);
    }
}
