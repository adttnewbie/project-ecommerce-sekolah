<?php

use App\Models\WaNotificationLog;

test('webhook updates delivered with correct token', function () {
    config()->set('services.wuzapi.webhook_token', 'secret-webhook');
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => [], 'status' => 'sent', 'wuzapi_msg_id' => 'MSG-1']);
    $this->postJson('/api/wa/webhook', ['messageId' => 'MSG-1', 'status' => 'delivered'], ['X-Wuzapi-Token' => 'secret-webhook'])
        ->assertOk();
    expect($log->fresh()->status)->toBe('delivered');
});

test('webhook rejects wrong token', function () {
    config()->set('services.wuzapi.webhook_token', 'secret-webhook');
    $this->postJson('/api/wa/webhook', ['messageId' => 'MSG-1', 'status' => 'read'], ['X-Wuzapi-Token' => 'salah'])
        ->assertForbidden();
});
