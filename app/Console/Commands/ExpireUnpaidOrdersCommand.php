<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use App\Support\OrderLivenessService;
use App\Support\SystemActor;
use Illuminate\Console\Command;

class ExpireUnpaidOrdersCommand extends Command
{
    protected $signature = 'orders:expire-unpaid';

    protected $description = 'Cancel unpaid orders that passed the payment SLA and restock inventory';

    public function handle(): int
    {
        $existing = User::query()
            ->where('role', UserRole::Admin)
            ->orderBy('id')
            ->first();

        $systemActor = $existing ?? SystemActor::getOrCreate();

        if ($existing === null) {
            $this->warn('No admin user found; bootstrapped system actor to attribute expiry cancellations.');
        }

        $cancelled = OrderLivenessService::expireUnpaidOrders($systemActor);
        $this->info("Expired unpaid items cancelled: {$cancelled}");

        return self::SUCCESS;
    }
}
