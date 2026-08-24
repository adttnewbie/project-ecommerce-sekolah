<?php

namespace App\Listeners;

use App\Events\ProductPendingModeration;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AdminProductModerationNotify
{
    /**
     * Handle the event.
     */
    public function handle(ProductPendingModeration $event): void
    {
        $admin = User::where('role', 'admin')->first();

        if (! $admin) {
            Log::warning('No admin user found to receive product moderation notification');

            return;
        }

        $notificationKey = "admin-product-moderation:{$event->productId}";

        $existing = Notification::where('key', $notificationKey)->first();

        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $admin->id,
            'type' => 'product',
            'key' => $notificationKey,
            'title' => "Produk {$event->productName} menunggu persetujuan",
            'description' => "{$event->sellerName} mengajukan produk baru untuk ditinjau.",
            'href' => route('admin.products.moderation.index', ['filter_pending' => 1], false),
            'data' => [
                'product_id' => $event->productId,
                'seller_name' => $event->sellerName,
                'source' => 'product_moderation',
            ],
            'created_at' => now(),
        ]);
    }
}
