<?php

namespace App\Listeners;

use App\Enums\ProductSalesMethod;
use App\Events\ProductPendingModeration;
use App\Models\Product;
use App\Support\NotificationDispatch;

class AdminProductModerationNotify
{
    /**
     * Handle the event.
     */
    public function handle(ProductPendingModeration $event): void
    {
        // Single-gate moderation (opsi A): produk titipan UP Jurusan dimoderasi
        // admin jurusan lewat persetujuan konsinyasi, bukan admin pusat.
        // Notif seller tetap jalan via CreateProductModerationNotification.
        $salesMethod = Product::query()->whereKey($event->productId)->value('sales_method');

        if ($salesMethod instanceof ProductSalesMethod) {
            $salesMethod = $salesMethod->value;
        }

        if ($salesMethod === ProductSalesMethod::UpJurusan->value) {
            return;
        }

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
