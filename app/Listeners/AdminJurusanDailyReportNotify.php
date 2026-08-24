<?php

namespace App\Listeners;

use App\Events\DailyReportSubmitted;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class AdminJurusanDailyReportNotify
{
    /**
     * Handle the event.
     */
    public function handle(DailyReportSubmitted $event): void
    {
        $adminJurusan = \App\Models\User::where('role', 'admin_jurusan')
            ->with('upJurusan:id,name')
            ->first();
        
        if (!$adminJurusan) {
            Log::warning('No admin jurusan user found to receive daily report notification');
            return;
        }

        $notificationKey = "admin-jurusan-report:{$event->reportId}";
        
        $existing = Notification::where('key', $notificationKey)->first();
        
        if ($existing) {
            return;
        }

        Notification::create([
            'user_id' => $adminJurusan->id,
            'type' => 'system',
            'key' => $notificationKey,
            'title' => "Laporan harian {$event->picketName} submitted",
            'description' => "Penjualan hari ini: Rp " . number_format($event->totalRevenue, 0, ',', '.'),
            'href' => route('admin-jurusan.reports.show', $event->reportId, false),
            'data' => [
                'report_id' => $event->reportId,
                'picket_name' => $event->picketName,
                'total_revenue' => $event->totalRevenue,
                'source' => 'daily_report_submitted',
            ],
            'created_at' => now(),
        ]);
    }
}
