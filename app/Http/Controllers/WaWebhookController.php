<?php

namespace App\Http\Controllers;

use App\Models\WaNotificationLog;
use Illuminate\Http\Request;

/**
 * Webhook Wuzapi (asternic/wuzapi, WEBHOOK_FORMAT=json).
 * Body: {event: {...}, type: "Message"|"ReadReceipt"|..., token: "<user token>"}.
 * Auth = samakan field token dengan WUZAPI_TOKEN (token user, bukan admin).
 */
class WaWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $expected = (string) config('services.wuzapi.token');
        $given = (string) $request->input('token', '');

        if ($expected === '' || ! hash_equals($expected, $given)) {
            abort(403, 'invalid webhook token');
        }

        $data = $request->validate([
            'type' => ['required', 'string', 'max:64'],
            'event' => ['nullable', 'array'],
        ]);

        if ($data['type'] !== 'ReadReceipt') {
            return response()->json(['ok' => true]);
        }

        $event = $data['event'] ?? [];
        $ids = $event['MessageIDs'] ?? $event['MessageIds'] ?? [];
        if (isset($event['MessageID']) && is_string($event['MessageID'])) {
            $ids[] = $event['MessageID'];
        }
        if (isset($event['ID']) && is_string($event['ID'])) {
            $ids[] = $event['ID'];
        }
        $ids = array_values(array_unique(array_filter(array_map('strval', (array) $ids))));

        if ($ids === []) {
            return response()->json(['ok' => true]);
        }

        $receiptType = strtolower((string) ($event['Type'] ?? 'delivered'));
        $status = str_contains($receiptType, 'read') ? 'read' : 'delivered';

        WaNotificationLog::whereIn('wuzapi_msg_id', $ids)
            ->where('status', 'sent')
            ->update(['status' => $status]);

        return response()->json(['ok' => true]);
    }
}
