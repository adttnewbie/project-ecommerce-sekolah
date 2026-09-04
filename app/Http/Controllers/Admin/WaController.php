<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SendWaNotificationJob;
use App\Models\WaNotificationLog;
use App\Support\WaNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class WaController extends Controller
{
    public function index(Request $request): Response
    {
        $base = rtrim((string) config('services.wuzapi.url'), '/');
        $connected = false;
        $qr = null;
        try {
            $st = Http::timeout(5)->withHeaders(['Token' => (string) config('services.wuzapi.token')])->get($base.'/session/status');
            $connected = (bool) $st->json('data.Connected') && (bool) $st->json('data.LoggedIn');
            if (! $connected) {
                $q = Http::timeout(5)->withHeaders(['Token' => (string) config('services.wuzapi.token')])->get($base.'/session/qr');
                $qr = $q->json('data.QRCode');
            }
        } catch (\Throwable) {
            $connected = false;
        }
        $logs = WaNotificationLog::query()
            ->when($request->string('status')->toString(), fn ($q, $s) => $q->where('status', $s))
            ->when($request->string('template')->toString(), fn ($q, $t) => $q->where('template_key', $t))
            ->latest()->paginate(20)->withQueryString();

        return Inertia::render('admin/wa/index', ['connected' => $connected, 'qr' => $qr, 'logs' => $logs]);
    }

    public function retry(WaNotificationLog $log)
    {
        $log->update(['status' => 'pending', 'error' => null]);
        SendWaNotificationJob::dispatch($log->id);

        return back()->with('success', 'Antrean WA dikirim ulang.');
    }

    public function sendManual(Request $request)
    {
        $data = $request->validate([
            'to' => ['required', 'string', 'max:32'],
            'template' => ['required', 'string', 'max:64'],
            'params' => ['nullable', 'array'],
        ]);
        WaNotificationService::send($data['to'], $data['template'], $data['params'] ?? []);

        return back()->with('success', 'Pesan manual masuk antrean.');
    }
}
