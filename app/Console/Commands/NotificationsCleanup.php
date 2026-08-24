<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class NotificationsCleanup extends Command
{
    protected $signature = 'notifications:cleanup-old {--days=90}';
    protected $description = 'Delete old dismissed notifications from archive';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Starting cleanup of notifications older than {$days} days...");

        $deleted = \App\Models\Notification::whereNotNull('dismissed_at')
            ->where('dismissed_at', '<', $cutoffDate)
            ->forceDelete();

        $this->info("Deleted {$deleted} old dismissed notifications");

        return Command::SUCCESS;
    }
}
