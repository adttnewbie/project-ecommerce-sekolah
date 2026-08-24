<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Buyer-facing order lifecycle notice (auto-expiry, admin force-cancel /
 * force-complete). Buyer-initiated cancellations deliberately never fire
 * this - the buyer is the actor.
 */
class BuyerOrderStateChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $orderId,
        public readonly string $state, // 'cancelled_auto'|'cancelled_admin'|'completed_admin'
        public readonly ?string $reason = null,
    ) {}

    public function notificationKey(): string
    {
        return "buyer-order-state:{$this->orderId}:{$this->state}";
    }

    public function notificationTitle(): string
    {
        return match ($this->state) {
            'cancelled_auto' => "Pesanan #{$this->orderId} dibatalkan otomatis",
            'cancelled_admin' => "Pesanan #{$this->orderId} dibatalkan",
            default => "Pesanan #{$this->orderId} diselesaikan",
        };
    }

    public function notificationDescription(): string
    {
        return match ($this->state) {
            'cancelled_auto' => 'Melewati batas waktu pembayaran.',
            'cancelled_admin' => 'Dibatalkan oleh admin. '.($this->reason ?? ''),
            default => 'Diselesaikan oleh admin. '.($this->reason ?? ''),
        };
    }
}
