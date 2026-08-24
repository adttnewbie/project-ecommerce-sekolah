<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired once per cancelled order item from the shared cancellation
 * choke point, carrying both parties so actor-aware listeners can notify
 * exactly the side that did not perform the action.
 */
class OrderItemCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $orderItemId,
        public readonly int $orderId,
        public readonly string $productName,
        public readonly int $sellerId,
        public readonly int $buyerId,
        public readonly int $actorId,
        public readonly string $actorRole,
        public readonly ?string $reason = null,
        public readonly bool $isExpiry = false,
    ) {}
}
