<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\PendingOrderCreated;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class CreatePendingOrderNotification
{
    /**
     * Handle the event.
     */
    public function handle(PendingOrderCreated $event): void
    {
        // Use notification key for idempotency - prevents duplicate notifications
        $notificationKey = $event->notificationKey();

        // Check if notification already exists (idempotent)
        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            Log::info('Notification already exists, skipping creation', [
                'key' => $notificationKey,
                'user_id' => $event->sellerId,
            ]);

            return;
        }

        // Create new persistent notification
        Notification::create([
            'user_id' => $event->sellerId,
            'type' => NotificationType::Order->value,
            'key' => $notificationKey,
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            // The seller route binds an OrderItem, not an Order; link the
            // item that belongs to this seller (fall back to the center
            // page when the event carries no item id).
            'href' => $event->orderItemId !== null
                ? route('seller.orders.show', $event->orderItemId, false)
                : route('seller.orders.index', absolute: false),
            'data' => [
                'order_id' => $event->orderId,
                'product_id' => $event->productId,
                'source' => 'pending_order_created',
            ],
            'created_at' => now(),
        ]);
    }
}
