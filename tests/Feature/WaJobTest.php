<?php

use App\Jobs\SendWaNotificationJob;
use App\Models\WaNotificationLog;
use Illuminate\Support\Facades\Http;

test('job sends text and marks sent on 200', function () {
    Http::fake(['*' => Http::response(['messageId' => 'MSG-1'], 200)]);
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => ['_message' => 'halo'], 'status' => 'pending']);
    (new SendWaNotificationJob($log->id))->handle();
    expect($log->fresh()->status)->toBe('sent')->and($log->fresh()->wuzapi_msg_id)->toBe('MSG-1');
});

test('job marks failed with needs_qr on 401 without retry', function () {
    Http::fake(['*' => Http::response(['error' => 'unauthorized'], 401)]);
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => ['_message' => 'halo'], 'status' => 'pending']);
    (new SendWaNotificationJob($log->id))->handle();
    expect($log->fresh()->status)->toBe('failed')->and($log->fresh()->error)->toContain('needs_qr');
});

test('job skips already sent log', function () {
    Http::fake();
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => ['_message' => 'halo'], 'status' => 'sent']);
    (new SendWaNotificationJob($log->id))->handle();
    Http::assertNothingSent();
});
