<?php

namespace App\Console\Commands;

use App\Models\Notification;
use Illuminate\Console\Command;

class NotificationsCleanup extends Command
{
    protected $signature = 'notifications:cleanup-old {--days=90}';

    protected $description = 'Delete old dismissed notifications from archive';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoffDate = now()->subDays($days);

        $this->info("Starting cleanup of notifications older than {$days} days...");

        $deleted = Notification::whereNotNull('dismissed_at')
            ->where('dismissed_at', '<', $cutoffDate)
            ->forceDelete();

        $this->info("Deleted {$deleted} old dismissed notifications");

        return Command::SUCCESS;
    }
}
