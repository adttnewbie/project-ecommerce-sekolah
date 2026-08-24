<?php

namespace App\Listeners;

use App\Events\OrderPaymentApproved;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class PicketOrderPaymentNotify
{
    /**
     * Handle the event.
     */
    public function handle(OrderPaymentApproved $event): void
    {
        if ($event->status !== 'approved') {
            return;
        }

        $picket = \App\Models\User::where('id', $event->processedBy)
            ->where('role', 'picket_officer')
            ->first();
        
        if (!$picket) {
            Log::warning('Picket officer not found for payment notification');
            return;
        }

        $notificationKey = "picket-payment-approved:{$event->orderItemId}";
        
        $existing = Notification::where('key', $notificationKey)->first();
        
        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $picket->id,
            'type' => 'payment',
            'key' => $notificationKey,
            'title' => "Pembayaran order {$event->orderNumber} disetujui",
            'description' => "Total: Rp " . number_format($event->amount, 0, ',', '.').'',
            'href' => route('picket.orders', absolute: false),
            'data' => [
                'order_item_id' => $event->orderItemId,
                'order_number' => $event->orderNumber,
                'amount' => $event->amount,
                'source' => 'payment_approved',
            ],
            'created_at' => now(),
        ]);
    }
}
