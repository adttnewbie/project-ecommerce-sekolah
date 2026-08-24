<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\LowStockDetected;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class CreateLowStockNotification
{
    /**
     * Handle the event.
     */
    public function handle(LowStockDetected $event): void
    {
        // Use notification key for idempotency
        $notificationKey = $event->notificationKey();

        // Check if notification already exists
        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            Log::info('Low stock notification already exists, skipping creation', [
                'key' => $notificationKey,
                'user_id' => $event->sellerId,
            ]);

            return;
        }

        // Create new persistent notification
        Notification::create([
            'user_id' => $event->sellerId,
            'type' => NotificationType::Stock->value,
            'key' => $notificationKey,
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            'href' => route('seller.inventory.index', ['q' => $event->productName], false),
            'data' => [
                'product_id' => $event->productId,
                'real_stock' => $event->realStock,
                'source' => 'low_stock_detected',
            ],
            'created_at' => now(),
        ]);
    }
}
