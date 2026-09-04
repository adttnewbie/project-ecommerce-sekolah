<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Support\WaNotificationService;
use Illuminate\Console\Command;

class SendWaOrderReminders extends Command
{
    protected $signature = 'wa:reminders';

    protected $description = 'Kirim reminder WA untuk order belum lunas >3 jam';

    public function handle(): int
    {
        $orders = Order::query()
            ->with('user')
            ->where('status', OrderStatus::Open)
            ->where('payment_status', PaymentStatus::Unpaid)
            ->where('created_at', '<', now()->subHours(3))
            ->limit(50)->get();

        $queued = 0;
        $skipped = 0;

        foreach ($orders as $order) {
            $phone = $order->user->phone ?? null;

            if (! $phone) {
                $skipped++;

                continue;
            }

            WaNotificationService::send($phone, 'order.reminder', [
                'buyer' => $order->user->name ?? 'Buyer',
                'trx' => $order->code,
                'total' => 'Rp'.number_format((int) $order->total_price, 0, ',', '.'),
            ]);
            $queued++;
        }

        $this->info("reminders queued: {$queued}, skipped (no phone): {$skipped}");

        return self::SUCCESS;
    }
}
