<?php

use App\Enums\ProductSalesMethod;
use App\Enums\ProductStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\DomainEvent;
use App\Models\Product;
use App\Models\User;
use App\Support\DomainEventService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

/**
 * Genuine concurrency tests for admin product moderation approve/reject.
 *
 * The controller performs an atomic conditional UPDATE guarded by
 * `status = pending AND sales_method = self_managed`. Two independent
 * processes race the same transition on a shared file-backed SQLite database.
 * The conditional UPDATE must guarantee that exactly one writer wins the
 * `pending` state; the loser affects zero rows and changes nothing.
 *
 * Each forked child mirrors the controller's transition statement so the test
 * exercises the same SQL atomicity the endpoints rely on.
 */
function moderationDb(): string
{
    $dir = sys_get_temp_dir().'/product_moderation_'.uniqid();
    mkdir($dir);
    $dbFile = $dir.'/db.sqlite';
    touch($dbFile);
    config(['database.default' => 'concurrency']);
    config(['database.connections.concurrency' => [
        'driver' => 'sqlite',
        'database' => $dbFile,
        'prefix' => '',
        'foreign_key_constraints' => true,
    ]]);
    DB::purge('concurrency');
    Artisan::call('migrate:fresh', ['--database' => 'concurrency']);

    return $dbFile;
}

function moderationProduct(): int
{
    $category = Category::factory()->create();
    $seller = User::factory()->create(['role' => UserRole::Seller]);

    return Product::factory()
        ->for($seller, 'seller')
        ->for($category)
        ->create([
            'status' => ProductStatus::Pending,
            'sales_method' => ProductSalesMethod::SelfManaged,
        ])->id;
}

function moderationTransition(int $productId, ProductStatus $status, ?string $reason, string $resultFile): void
{
    try {
        DB::purge('concurrency');
        DB::reconnect('concurrency');
        DB::statement('PRAGMA busy_timeout = 10000');
        DB::statement('PRAGMA journal_mode = WAL');

        $affected = Product::query()
            ->whereKey($productId)
            ->where('status', ProductStatus::Pending)
            ->where('sales_method', ProductSalesMethod::SelfManaged)
            ->update([
                'status' => $status,
                'rejection_reason' => $reason,
            ]);

        if ($affected === 1) {
            DomainEventService::record(
                DomainEventService::AGGREGATE_PRODUCT,
                $productId,
                $status === ProductStatus::Approved ? 'product_approved' : 'product_rejected',
                null,
                ['to_status' => $status->value],
            );
        }

        file_put_contents($resultFile, (string) $affected);
        exit(0);
    } catch (Throwable $e) {
        file_put_contents($resultFile, 'ERROR:'.$e->getMessage());
        exit(1);
    }
}

test('concurrent approve + reject: exactly one transition wins pending', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = moderationDb();
    $productId = moderationProduct();
    $readyA = sys_get_temp_dir().'/ready_a_'.uniqid();
    $readyB = sys_get_temp_dir().'/ready_b_'.uniqid();
    $goFile = sys_get_temp_dir().'/go_'.uniqid();
    $resultA = sys_get_temp_dir().'/res_a_'.uniqid();
    $resultB = sys_get_temp_dir().'/res_b_'.uniqid();

    DB::purge('concurrency');

    $run = function (string $target) use ($readyA, $readyB, $goFile, $productId, $resultA, $resultB) {
        [$ready, $result, $status, $reason] = $target === 'approve'
            ? [$readyA, $resultA, ProductStatus::Approved, null]
            : [$readyB, $resultB, ProductStatus::Rejected, 'Race rejection'];

        touch($ready);
        $deadline = microtime(true) + 10;
        while (! file_exists($goFile) && microtime(true) < $deadline) {
            usleep(1000);
        }

        moderationTransition($productId, $status, $reason, $result);
    };

    $pidA = pcntl_fork();
    if ($pidA === -1) {
        $this->fail('Unable to fork process A.');
    }
    if ($pidA === 0) {
        $run('approve');
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        $this->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $run('reject');
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyA) || ! file_exists($readyB)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidA, $statusA);
    pcntl_waitpid($pidB, $statusB);

    try {
        $affectedA = (int) file_get_contents($resultA);
        $affectedB = (int) file_get_contents($resultB);

        [$affectedA, $affectedB] = [$affectedA, $affectedB];
        $winners = collect([$affectedA, $affectedB])->filter(fn ($n) => $n === 1)->count();

        expect($winners)->toBe(1, 'Exactly one transition should win the pending state.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $final = Product::findOrFail($productId);

        if ($affectedA === 1) {
            expect($final->status)->toBe(ProductStatus::Approved)
                ->and($final->rejection_reason)->toBeNull();
        } else {
            expect($final->status)->toBe(ProductStatus::Rejected)
                ->and($final->rejection_reason)->toBe('Race rejection');
        }

        expect(
            DomainEvent::query()
                ->where('aggregate_type', 'product')
                ->where('aggregate_id', $productId)
                ->count(),
        )->toBe(1, 'Concurrent approve + reject must produce exactly one audit event.');
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        foreach ([$dbFile, $readyA, $readyB, $goFile, $resultA, $resultB, $dbFile.'-wal', $dbFile.'-shm'] as $f) {
            @unlink($f);
        }
    }
});

test('concurrent approve + approve: exactly one wins, no duplicate success', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = moderationDb();
    $productId = moderationProduct();
    $readyA = sys_get_temp_dir().'/ready_a_'.uniqid();
    $readyB = sys_get_temp_dir().'/ready_b_'.uniqid();
    $goFile = sys_get_temp_dir().'/go_'.uniqid();
    $resultA = sys_get_temp_dir().'/res_a_'.uniqid();
    $resultB = sys_get_temp_dir().'/res_b_'.uniqid();

    DB::purge('concurrency');

    $pidA = pcntl_fork();
    if ($pidA === -1) {
        $this->fail('Unable to fork process A.');
    }
    if ($pidA === 0) {
        $runA = function () use ($readyA, $goFile, $productId, $resultA) {
            touch($readyA);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }
            moderationTransition($productId, ProductStatus::Approved, null, $resultA);
        };
        $runA();
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        $this->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $runB = function () use ($readyB, $goFile, $productId, $resultB) {
            touch($readyB);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }
            moderationTransition($productId, ProductStatus::Approved, null, $resultB);
        };
        $runB();
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyA) || ! file_exists($readyB)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidA, $statusA);
    pcntl_waitpid($pidB, $statusB);

    try {
        $affectedA = (int) file_get_contents($resultA);
        $affectedB = (int) file_get_contents($resultB);

        $winners = collect([$affectedA, $affectedB])->filter(fn ($n) => $n === 1)->count();

        expect($winners)->toBe(1, 'Exactly one approve should win the pending state.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $final = Product::findOrFail($productId);

        expect($final->status)->toBe(ProductStatus::Approved)
            ->and($final->rejection_reason)->toBeNull()
            ->and(
                DomainEvent::query()
                    ->where('aggregate_type', 'product')
                    ->where('aggregate_id', $productId)
                    ->count(),
            )->toBe(1, 'Concurrent approve + approve must produce exactly one audit event.');
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        foreach ([$dbFile, $readyA, $readyB, $goFile, $resultA, $resultB, $dbFile.'-wal', $dbFile.'-shm'] as $f) {
            @unlink($f);
        }
    }
});

test('concurrent reject + reject: exactly one reason persists, no stale override', function () {
    if (! function_exists('pcntl_fork')) {
        $this->markTestSkipped('pcntl extension is required for concurrency testing.');
    }

    $dbFile = moderationDb();
    $productId = moderationProduct();
    $readyA = sys_get_temp_dir().'/ready_a_'.uniqid();
    $readyB = sys_get_temp_dir().'/ready_b_'.uniqid();
    $goFile = sys_get_temp_dir().'/go_'.uniqid();
    $resultA = sys_get_temp_dir().'/res_a_'.uniqid();
    $resultB = sys_get_temp_dir().'/res_b_'.uniqid();

    DB::purge('concurrency');

    $pidA = pcntl_fork();
    if ($pidA === -1) {
        $this->fail('Unable to fork process A.');
    }
    if ($pidA === 0) {
        $runA = function () use ($readyA, $goFile, $productId, $resultA) {
            touch($readyA);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }
            moderationTransition($productId, ProductStatus::Rejected, 'Reason Alpha', $resultA);
        };
        $runA();
    }

    $pidB = pcntl_fork();
    if ($pidB === -1) {
        $this->fail('Unable to fork process B.');
    }
    if ($pidB === 0) {
        $runB = function () use ($readyB, $goFile, $productId, $resultB) {
            touch($readyB);
            $deadline = microtime(true) + 10;
            while (! file_exists($goFile) && microtime(true) < $deadline) {
                usleep(1000);
            }
            moderationTransition($productId, ProductStatus::Rejected, 'Reason Beta', $resultB);
        };
        $runB();
    }

    $deadline = microtime(true) + 10;
    while ((! file_exists($readyA) || ! file_exists($readyB)) && microtime(true) < $deadline) {
        usleep(1000);
    }
    touch($goFile);

    pcntl_waitpid($pidA, $statusA);
    pcntl_waitpid($pidB, $statusB);

    try {
        $affectedA = (int) file_get_contents($resultA);
        $affectedB = (int) file_get_contents($resultB);

        $winners = collect([$affectedA, $affectedB])->filter(fn ($n) => $n === 1)->count();

        expect($winners)->toBe(1, 'Exactly one reject should win the pending state.');

        DB::purge('concurrency');
        DB::reconnect('concurrency');

        $final = Product::findOrFail($productId);

        expect($final->status)->toBe(ProductStatus::Rejected)
            ->and(in_array($final->rejection_reason, ['Reason Alpha', 'Reason Beta'], true))->toBeTrue()
            ->and(
                DomainEvent::query()
                    ->where('aggregate_type', 'product')
                    ->where('aggregate_id', $productId)
                    ->count(),
            )->toBe(1, 'Concurrent reject + reject must produce exactly one audit event.');
    } finally {
        config(['database.default' => 'sqlite']);
        DB::purge('concurrency');
        foreach ([$dbFile, $readyA, $readyB, $goFile, $resultA, $resultB, $dbFile.'-wal', $dbFile.'-shm'] as $f) {
            @unlink($f);
        }
    }
});
