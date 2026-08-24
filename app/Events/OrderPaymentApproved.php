<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPaymentApproved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $orderItemId,
        public readonly string $orderNumber,
        public readonly int $amount,
        public readonly string $status, // 'approved' or 'rejected'
        public readonly ?int $processedBy = null,
    ) {}
}
