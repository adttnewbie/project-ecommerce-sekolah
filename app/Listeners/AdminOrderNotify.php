<?php

namespace App\Listeners;

use App\Events\PendingOrderCreated;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminOrderNotify
{
    /**
     * Handle the event.
     */
    public function handle(PendingOrderCreated $event): void
    {
        $admin = User::where('role', 'admin')->first();

        if (! $admin) {
            Log::warning('No admin user found to receive order notification');

            return;
        }

        $notificationKey = "admin-order:{$event->orderId}";

        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $admin->id,
            'type' => 'order',
            'key' => $notificationKey,
            'title' => "Pesanan baru dari {$event->buyerName}",
            'description' => 'Total: Rp '.number_format($event->totalPrice, 0, ',', '.'),
            'href' => route('admin.orders.index', ['filter_pending' => 1], false),
            'data' => [
                'order_id' => $event->orderId,
                'buyer_name' => $event->buyerName,
                'source' => 'pending_order',
            ],
            'created_at' => now(),
        ]);
    }
}
