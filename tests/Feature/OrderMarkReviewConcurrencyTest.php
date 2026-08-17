<?php

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;
use App\Support\OrderLivenessService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Genuine concurrency test for mark-requires-manual-review.
 *
 * Two independent processes race the same mark-review on a shared file-backed
 * SQLite database. The lock + transaction must ensure no lost update: both
 * writers preserve the pre-existing stuck reason and end with a single
 * 'manual_review' entry.
 */
test('concurrent manual review does not lose stuck reasons', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dir = sys_get_temp_dir().'/order_mark_review_'.uniqid();
    mkdir($dir);
    $dbFile = $dir.'/db.sqlite';
    touch($dbFile);
    $readyA = $dir.'/ready_a';
    $readyB = $dir.'/ready_b';
    $goFile = $dir.'/go';

    config(['database.default' => 'concurrency']);
    config(['database.connections.concurrency' => [
        'driver' => 'sqlite',
        'database' => $dbFile,
        'prefix' => '',
        'foreign_key_constraints' => true,
    ]]);
    DB::purge('concurrency');
    Artisan::call('migrate:fresh', ['--database' => 'concurrency']);

    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'stuck_reasons' => ['stuck_fulfillment'],
    ]);
    $orderId = $order->id;

    DB::purge('concurrency');

    $runMark = function (string $readyFile) use ($goFile, $orderId) {
        try {
            DB::purge('concurrency');
            DB::reconnect('concurrency');
            DB::statement('PRAGMA busy_timeout = 10000');
            DB::statement('PRAGMA journal_mode = WAL');

            touch($readyFile);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }

            $admin = User::query()->where('role', UserRole::Admin->value)->firstOrFail();
            $order = Order::findOrFail($orderId);

            OrderLivenessService::markRequiresManualReview($order, $admin, 'Concurrent review');
        } catch (Throwable) {
            exit(1);
        }

        exit(0);
    };

    $pidA = pcntl_fork();
    if ($pidA === -1) {
        $this->fail('Unable to fork process A.');
    }
    if ($pidA === 0) {
        $runMark($readyA);
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        $this->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $runMark($readyB);
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyA) || ! file_exists($readyB)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidA, $statusA);
    pcntl_waitpid($pidB, $statusB);

    try {
        $succeededA = pcntl_wifexited($statusA) && pcntl_wexitstatus($statusA) === 0;
        $succeededB = pcntl_wifexited($statusB) && pcntl_wexitstatus($statusB) === 0;

        expect($succeededA || $succeededB)
            ->toBeTrue('At least one mark-review transition should succeed.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $finalOrder = Order::findOrFail($orderId);
        $reasons = $finalOrder->stuck_reasons ?? [];

        expect($finalOrder->requires_manual_review)->toBeTrue()
            ->and($reasons)->toContain('stuck_fulfillment')
            ->and($reasons)->toContain('manual_review')
            ->and(array_count_values($reasons)['manual_review'] ?? 0)->toBe(1);
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        @unlink($dbFile);
        @unlink($readyA);
        @unlink($readyB);
        @unlink($goFile);
        @unlink($dbFile.'-wal');
        @unlink($dbFile.'-shm');
        @rmdir($dir);
    }
});
