<?php

namespace App\Listeners;

use App\Enums\NotificationType;
use App\Events\ProductPendingModeration;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class CreateProductModerationNotification
{
    /**
     * Handle the event.
     */
    public function handle(ProductPendingModeration $event): void
    {
        // Use notification key for idempotency
        $notificationKey = $event->notificationKey();

        // Check if notification already exists
        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            Log::info('Product moderation notification already exists, skipping creation', [
                'key' => $notificationKey,
                'user_id' => $event->sellerId,
            ]);

            return;
        }

        // Create new persistent notification
        Notification::create([
            'user_id' => $event->sellerId,
            'type' => NotificationType::Product->value,
            'key' => $notificationKey,
            'title' => $event->notificationTitle(),
            'description' => $event->notificationDescription(),
            'href' => route('admin.products.moderation.index', false),
            'data' => [
                'product_id' => $event->productId,
                'source' => 'product_pending_moderation',
            ],
            'created_at' => now(),
        ]);
    }
}
