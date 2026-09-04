<?php

use App\Jobs\SendWaNotificationJob;
use App\Support\WaNotificationService;
use Illuminate\Support\Facades\Queue;

test('normalize converts 08 to 628 and rejects invalid', function () {
    expect(WaNotificationService::normalizeNumber('0812-3456-789'))->toBe('628123456789');
    expect(WaNotificationService::normalizeNumber('+62812 345 6789'))->toBe('628123456789');
    expect(fn () => WaNotificationService::normalizeNumber('123'))->toThrow(InvalidArgumentException::class);
});

test('send renders template, writes pending log and dispatches job', function () {
    Queue::fake();
    $log = WaNotificationService::send('08123456789', 'order.baru', ['seller' => 'Toko RPL', 'trx' => 'TRX-1', 'buyer' => 'Budi', 'total' => 'Rp10.000']);
    expect($log->status)->toBe('pending')->and($log->to)->toBe('628123456789');
    $this->assertDatabaseHas('wa_notification_logs', ['id' => $log->id, 'template_key' => 'order.baru']);
    Queue::assertPushed(SendWaNotificationJob::class);
});

test('send with invalid number writes failed log without dispatch', function () {
    Queue::fake();
    $log = WaNotificationService::send('123', 'order.baru', []);
    expect($log->status)->toBe('failed')->and($log->error)->toContain('invalid_number');
    Queue::assertNothingPushed();
});
