<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired after the checkout transaction commits when one or more pending
 * items are actionable for a picket officer's up jurusan (cash
 * verification work). One event per order per up jurusan.
 */
class OrderItemsAwaitingVerification
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $upJurusanId,
        public readonly int $orderId,
        public readonly string $orderCode,
        public readonly int $itemCount,
    ) {}
}
