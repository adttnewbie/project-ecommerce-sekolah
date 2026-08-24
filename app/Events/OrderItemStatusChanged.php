<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderItemStatusChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ?int $orderItemId,
        public readonly ?int $orderId,
        public readonly int $productId,
        public readonly ?int $consignmentId,
        public readonly string $productName,
        public readonly string $sellerName,
        public readonly string $buyerName,
        public readonly string $action,
        public readonly ?int $picketId = null,
        public readonly ?string $consignmentStatus = null,
        public readonly ?string $itemStatus = null,
    ) {}
}
