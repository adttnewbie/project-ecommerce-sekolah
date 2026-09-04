<?php

use App\Enums\UserRole;
use App\Jobs\SendWaNotificationJob;
use App\Models\User;
use App\Models\WaNotificationLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;

test('admin can view dashboard, buyer is forbidden', function () {
    Http::fake(['*' => Http::response(['code' => 200, 'success' => true, 'data' => ['Connected' => true, 'LoggedIn' => true]], 200)]);
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $this->actingAs($admin)->get(route('admin.wa.index'))->assertOk();
    $this->actingAs($buyer)->get(route('admin.wa.index'))->assertForbidden();
});

test('retry resets failed to pending and dispatches', function () {
    Queue::fake();
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $log = WaNotificationLog::create(['template_key' => 'order.baru', 'to' => '628123456789', 'payload' => ['_message' => 'x'], 'status' => 'failed']);
    $this->actingAs($admin)->post(route('admin.wa.retry', $log))->assertRedirect();
    expect($log->fresh()->status)->toBe('pending');
    Queue::assertPushed(SendWaNotificationJob::class);
});
