<?php

namespace App\Support;

use App\Jobs\SendWaNotificationJob;
use App\Models\WaNotificationLog;
use InvalidArgumentException;

class WaNotificationService
{
    public static function normalizeNumber(string $raw): string
    {
        $digits = preg_replace('/\D+/', '', $raw) ?? '';
        if (str_starts_with($digits, '0')) {
            $digits = '62'.substr($digits, 1);
        }
        if (! str_starts_with($digits, '62') || strlen($digits) < 10 || strlen($digits) > 15) {
            throw new InvalidArgumentException("invalid_number: {$raw}");
        }

        return $digits;
    }

    public static function render(string $key, array $params): string
    {
        $all = config('wa-templates');
        $tpl = is_array($all) ? ($all[$key] ?? null) : null;
        if (! is_string($tpl)) {
            throw new InvalidArgumentException("unknown_template: {$key}");
        }
        $msg = $tpl;
        foreach ($params as $k => $v) {
            $msg = str_replace('{'.$k.'}', (string) $v, $msg);
        }

        return $msg;
    }

    public static function send(string $to, string $templateKey, array $params = []): WaNotificationLog
    {
        try {
            $normalized = self::normalizeNumber($to);
            $message = self::render($templateKey, $params);
        } catch (InvalidArgumentException $e) {
            return WaNotificationLog::create([
                'template_key' => $templateKey, 'to' => $to,
                'payload' => $params, 'status' => 'failed', 'error' => $e->getMessage(), 'attempts' => 0,
            ]);
        }
        $log = WaNotificationLog::create([
            'template_key' => $templateKey, 'to' => $normalized,
            'payload' => array_merge($params, ['_message' => $message]),
            'status' => 'pending', 'attempts' => 0,
        ]);
        SendWaNotificationJob::dispatch($log->id);

        return $log;
    }
}
