<?php

namespace App\Jobs;

use App\Models\WaNotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Throwable;

class SendWaNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 60, 300];

    public function __construct(public int $logId) {}

    public function handle(): void
    {
        $log = WaNotificationLog::find($this->logId);
        if (! $log || $log->status === 'sent') {
            return;
        }
        $message = $log->payload['_message'] ?? '';
        $url = rtrim((string) config('services.wuzapi.url'), '/').'/api/send/text';
        try {
            $res = Http::timeout(10)
                ->withHeaders(['Token' => (string) config('services.wuzapi.token')])
                ->post($url, [
                    'session' => (string) config('services.wuzapi.session'),
                    'to' => $log->to,
                    'text' => $message,
                ]);
        } catch (Throwable $e) {
            $log->update(['status' => 'failed', 'error' => 'wuzapi_unreachable: '.$e->getMessage(), 'attempts' => $log->attempts + 1]);
            throw $e;
        }
        if ($res->status() === 401) {
            $log->update(['status' => 'failed', 'error' => 'needs_qr: session disconnected (401)', 'attempts' => $log->attempts + 1]);

            return;
        }
        if ($res->successful()) {
            $log->update(['status' => 'sent', 'wuzapi_msg_id' => (string) ($res->json('messageId') ?? $res->json('id')), 'attempts' => $log->attempts + 1, 'error' => null]);

            return;
        }
        $log->update(['status' => 'failed', 'error' => 'wuzapi_'.$res->status().': '.substr((string) $res->body(), 0, 300), 'attempts' => $log->attempts + 1]);
        $res->throw();
    }
}
