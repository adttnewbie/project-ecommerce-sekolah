<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PendingOrderCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     *
     * Dispatched once per seller after the checkout transaction commits, so
     * $buyerName and $totalPrice always describe the final persisted order.
     */
    public function __construct(
        public readonly int $orderId,
        public readonly string $orderNumber,
        public readonly int $productId,
        public readonly string $productName,
        public readonly int $sellerId,
        public readonly string $buyerName,
        public readonly int $totalPrice,
        public readonly ?int $orderItemId = null
    ) {}

    /**
     * Generate stable notification key for this event.
     * Key is deterministic, scoped per seller (one order can involve many
     * sellers), and never changes regardless of entity updates.
     */
    public function notificationKey(): string
    {
        return "order-pending:{$this->orderId}:{$this->sellerId}";
    }

    /**
     * Get title for notification.
     */
    public function notificationTitle(): string
    {
        return "Pesanan #{$this->orderNumber}";
    }

    /**
     * Get description for notification.
     */
    public function notificationDescription(): string
    {
        return "{$this->productName} menunggu diproses";
    }
}
