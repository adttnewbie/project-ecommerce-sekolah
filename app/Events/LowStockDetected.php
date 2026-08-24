<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowStockDetected
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $productId,
        public readonly string $productName,
        public readonly int $realStock,
        public readonly int $sellerId,
    ) {}

    public function notificationKey(): string
    {
        return "seller-stock-low:{$this->productId}";
    }

    public function notificationTitle(): string
    {
        return "{$this->productName} stok menipis!";
    }

    public function notificationDescription(): string
    {
        return "Sisa stok hanya {$this->realStock} unit";
    }

    public function notificationHref(): string
    {
        return "/products/{$this->productId}/edit";
    }
}
