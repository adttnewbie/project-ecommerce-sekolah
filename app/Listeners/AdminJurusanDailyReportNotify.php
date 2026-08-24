<?php

namespace App\Listeners;

use App\Events\DailyReportSubmitted;
use App\Models\UpJurusan;
use App\Models\UpJurusanDailyReport;
use App\Support\NotificationDispatch;
use Illuminate\Support\Facades\Log;

class AdminJurusanDailyReportNotify
{
    /**
     * Handle the event.
     */
    public function handle(DailyReportSubmitted $event): void
    {
        // The report belongs to one up jurusan; its owner is the recipient.
        $upJurusanId = UpJurusanDailyReport::query()
            ->whereKey($event->reportId)
            ->value('up_jurusan_id');

        $recipientId = $upJurusanId !== null
            ? UpJurusan::query()->whereKey($upJurusanId)->value('admin_jurusan_id')
            : null;

        if ($recipientId === null) {
            Log::warning('No admin jurusan owner found for daily report notification', [
                'report_id' => $event->reportId,
            ]);

            return;
        }

        NotificationDispatch::toUser(
            (int) $recipientId,
            'system',
            "admin-jurusan-report:{$event->reportId}",
            [
                'title' => "Laporan harian {$event->picketName} submitted",
                'description' => 'Penjualan hari ini: Rp '.number_format($event->totalRevenue, 0, ',', '.'),
                'href' => route('admin-jurusan.reports.show', $event->reportId, false),
                'data' => [
                    'report_id' => $event->reportId,
                    'picket_name' => $event->picketName,
                    'total_revenue' => $event->totalRevenue,
                    'source' => 'daily_report_submitted',
                ],
            ],
        );
    }
}
