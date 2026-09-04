<?php

namespace App\Http\Controllers;

use App\Models\WaNotificationLog;
use Illuminate\Http\Request;

class WaWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $expected = (string) config('services.wuzapi.webhook_token');
        if (! hash_equals($expected, (string) $request->header('X-Wuzapi-Token'))) {
            abort(403, 'invalid webhook token');
        }
        $data = $request->validate([
            'messageId' => ['required', 'string', 'max:128'],
            'status' => ['required', 'in:sent,delivered,read,failed'],
            'error' => ['nullable', 'string', 'max:1000'],
        ]);
        $log = WaNotificationLog::where('wuzapi_msg_id', $data['messageId'])->firstOrFail();
        $log->update(['status' => $data['status'], 'error' => $data['error'] ?? ($data['status'] === 'failed' ? $log->error : null)]);

        return response()->json(['ok' => true]);
    }
}
