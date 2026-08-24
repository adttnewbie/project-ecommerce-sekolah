<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductPendingModeration
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public readonly int $productId,
        public readonly string $productName,
        public readonly int $sellerId,
        public readonly string $sellerName
    ) {}

    /**
     * Generate stable notification key for this event.
     */
    public function notificationKey(): string
    {
        return "admin-product-pending:{$this->productId}";
    }

    /**
     * Get title for notification.
     */
    public function notificationTitle(): string
    {
        return $this->productName;
    }

    /**
     * Get description for notification.
     */
    public function notificationDescription(): string
    {
        return 'Menunggu moderasi dari '.$this->sellerName;
    }
}
