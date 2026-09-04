<?php

use App\Models\WaNotificationLog;

test('webhook updates delivered with correct token', function () {
    config()->set('services.wuzapi.token', 'user-token-1');
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => [], 'status' => 'sent', 'wuzapi_msg_id' => 'MSG-1']);
    $this->postJson('/api/wa/webhook', ['type' => 'ReadReceipt', 'event' => ['MessageIDs' => ['MSG-1'], 'Type' => 'delivered'], 'token' => 'user-token-1'])
        ->assertOk();
    expect($log->fresh()->status)->toBe('delivered');
});

test('webhook marks read when receipt type is read', function () {
    config()->set('services.wuzapi.token', 'user-token-1');
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => [], 'status' => 'sent', 'wuzapi_msg_id' => 'MSG-9']);
    $this->postJson('/api/wa/webhook', ['type' => 'ReadReceipt', 'event' => ['MessageIDs' => ['MSG-9'], 'Type' => 'read'], 'token' => 'user-token-1'])
        ->assertOk();
    expect($log->fresh()->status)->toBe('read');
});

test('webhook rejects wrong token', function () {
    config()->set('services.wuzapi.token', 'user-token-1');
    $this->postJson('/api/wa/webhook', ['type' => 'ReadReceipt', 'event' => [], 'token' => 'salah'])
        ->assertForbidden();
});

test('webhook ignores non-receipt events', function () {
    config()->set('services.wuzapi.token', 'user-token-1');
    $this->postJson('/api/wa/webhook', ['type' => 'Message', 'event' => ['foo' => 'bar'], 'token' => 'user-token-1'])
        ->assertOk();
});
