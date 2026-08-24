<?php

namespace App\Listeners;

use App\Events\ProductPendingModeration;
use App\Support\NotificationDispatch;

class AdminProductModerationNotify
{
    /**
     * Handle the event.
     */
    public function handle(ProductPendingModeration $event): void
    {
        NotificationDispatch::toRole(
            'admin',
            'product',
            "admin-product-moderation:{$event->productId}",
            [
                'title' => 'Produk menunggu moderasi',
                'description' => "{$event->productName} dari {$event->sellerName}",
                'href' => route('admin.products.moderation.index', ['filter_pending' => 1], false),
                'data' => [
                    'product_id' => $event->productId,
                    'source' => 'product_pending_moderation',
                ],
            ],
        );
    }
}
