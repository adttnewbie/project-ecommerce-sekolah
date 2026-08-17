<?php

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Support\OrderLivenessService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Genuine concurrency test for admin force-cancel.
 *
 * Two independent processes race the same force-cancel on a shared file-backed
 * SQLite database. The invariant: only one transition wins, stock is restored
 * exactly once, and no double cancellation occurs.
 */
test('concurrent force-cancel restores stock exactly once', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dir = sys_get_temp_dir().'/order_force_cancel_'.uniqid();
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
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $product = Product::factory()->for($seller, 'seller')->approved()->create(['stock' => 0]);
    $order = Order::factory()->for($buyer)->create([
        'status' => OrderStatus::Open,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    OrderItem::factory()->for($order)->for($product)->create([
        'quantity' => 2,
        'status' => OrderItemStatus::Packed,
        'payment_status' => PaymentStatus::Unpaid,
    ]);
    $orderId = $order->id;
    $productId = $product->id;

    DB::purge('concurrency');

    $runCancel = function (string $readyFile) use ($goFile, $orderId) {
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

            OrderLivenessService::forceCancel($order, $admin, 'Concurrent force cancel');
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
        $runCancel($readyA);
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        $this->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $runCancel($readyB);
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
            ->toBeTrue('At least one force-cancel should succeed.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $finalOrder = Order::findOrFail($orderId);
        $finalProduct = Product::findOrFail($productId);
        $finalItem = OrderItem::query()->where('order_id', $orderId)->firstOrFail();

        expect($finalProduct->stock)->toBe(2)
            ->and($finalItem->status)->toBe(OrderItemStatus::Cancelled)
            ->and($finalOrder->status)->toBe(OrderStatus::Cancelled);
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
